import { Timestamp } from "firebase/firestore";
import Usuario from "./Usuario";
import { parse, differenceInDays, format, differenceInCalendarDays, parseISO, sub, addDays } from "date-fns";
import { addViagem, getNextId } from "../controller/Viagem";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../util/FirebaseConnection";
import { getCurrentDateTime } from "../pages/new";
import { NotificaPreposto, NotificarPreAprovada, NotificarSolicitacao } from "../controller/Mail";
import Adiantamento from "./Adiantamento";
import { addAdiantamento } from "../controller/Adiantamento";

type Viagem = {
    id: number; /* NA */
    status: string; /* SISTEMA */
    origem: string; /* OK */
    destino: string; /* OK */
    colaborador: string; /* SISTEMA */
    dataIda: string; /* OK */
    dataVolta: string; /* OK */
    duracao: number; /* SISTEMA */
    gerencia: string; /* SISTEMA */
    contrato: string; /* OK */
    hotel: string; /* OK */
    custoTotal?: number; /* POS */
    voo: boolean; /* OK */
    obsColaborador: string; /* OK */
    centroCusto?: string; /* POS */
    macroProcesso: string; /* OK */
    telContato: string; /* SISTEMA */
    adiantamento?: boolean; /* POS */
    valorAdiantamento?: number; /* POS */
    atestadoResponsabilidade?: boolean; /* POS */
    dataSolicitacao: string; /* SISTEMA */
    ccPetrobras?: string; /* OK */
    obsProgramador?: string; /* POS */
    anexoAprovacao?: string;
    nroRelatorio?: number;
    justificativa: string;
}

export type HomeTable = {
    id: string;
    status: string;
    destino: string;
    volta: string;
    duracao: string;
    adiantamento: string;
    valorFinal: string;
}

export type StatusCount = {
    name: string;
    value: number;
}

export type StatusLog = {
    dateTime: Timestamp;
    idViagem: string;
    valorAnt: string;
    valorAtt: string;
}

export async function verificaConformidade(submited: Viagem, user: Usuario) {
    if (submited.duracao <= 0) {
        throw new Error("Insira datas de ida e retorno válidas");
    }

    switch (submited.contrato) {
        case "4600679817":
        case "4600680171":
            if (!diferencaDias(submited.dataIda, 10) && user.nivelAcesso === 'COL') {
                throw new Error("Sua viagem deve ser solicitada com no mínimo 10 dias de antecedência");
            }
            break;
        case "4600685412":
            if (!diferencaDias(submited.dataIda, 10) && user.nivelAcesso === 'COL') {
                throw new Error("Sua viagem deve ser solicitada com no mínimo 10 dias de antecedência");
            }
            break;
        default:
            throw new Error("Contrato inválido");
    }
}

export async function processarCadastro(submited: Viagem, user: Usuario | null, toggleFnc: () => void, preAprovada: boolean, anexo: string | null, colaboradores: Usuario[]): Promise<{ res: boolean, msg: string, id: number}> {
    if (!user) return { res: false, msg: 'Sem usuário!', id: 0};
    toggleFnc();
    let url: string = '';
    const colb = colaboradores.find(c => c.email === submited.colaborador);
    try {
        //carega o arquivo da evidencia
        if (preAprovada && anexo) {
            const id = await getNextId();
            const fileRef = ref(storage, `viagens/${id}/evidencia-aprovacao`);
            
            const response = await fetch(anexo);
            const blob = await response.blob();  // Para imagens ou PDFs
            await uploadBytes(fileRef, blob);
            url = await getDownloadURL(fileRef);
        } else {
            return { res: false, msg: 'Viagens pré aprovadas precisam de anexo com comprovação!', id: 0};
        }
            
        //post no banco
        const { res, msg, id } = await addViagem({ 
            ...submited, 
            duracao: submited.duracao + 1,
            colaborador: user.nivelAcesso === 'COL' ? user.email : colb?.email || submited.colaborador,
            gerencia: user.nivelAcesso === 'COL' ? user.gerenciaPb : colb?.gerenciaPb || submited.gerencia,
            dataIda: format(parseISO(submited.dataIda), 'dd/MM/yyyy'),
            dataVolta: format(parseISO(submited.dataVolta), 'dd/MM/yyyy'),
            dataSolicitacao: getCurrentDateTime().toString(),
            anexoAprovacao: url,
            status: preAprovada ? 'Aprovada' : 'Solicitada'
        });

        //se for contrato SMS o adiantamento já é processado
        if (submited.contrato === '4600685412') {
            //gera o array com os dias e diarias
            const dataIda = new Date(submited.dataIda);
            const itens = Array.from({ length: submited.duracao }, (_, i) => {
                const dataRef = addDays(dataIda, i);
                return {
                    alimentacao: 65,
                    deslocamento: 0,
                    lavanderia: 0,
                    total: 65,
                    dataReferencia: format(dataRef, "dd/MM/yyyy")
                };
            });
            //envia pro banco e notifica
            const { res: resAdiantamento, msg: msgAdiantamento } = await addAdiantamento({
                idDoc: '',
                idViagem: id.toString(),
                itens: itens,
                totalAdiantamento: 65 * submited.duracao
            });
        }

        //NOTIFICACOES
        if (preAprovada) {        
            //se for preaprovada notificação é diferente
            await NotificarPreAprovada({ 
                ...submited, 
                id: id,
                duracao: submited.duracao + 1,
                colaborador: user.nivelAcesso === 'COL' ? user.email : colb?.email || submited.colaborador,
                gerencia: user.nivelAcesso === 'COL' ? user.gerenciaPb : colb?.gerenciaPb || submited.gerencia,
                dataIda: format(parseISO(submited.dataIda), 'dd/MM/yyyy'),
                dataVolta: format(parseISO(submited.dataVolta), 'dd/MM/yyyy'),
                dataSolicitacao: getCurrentDateTime().toString(),
                anexoAprovacao: url,
                status: 'Aprovada'
            })
        } else {
            await NotificarSolicitacao({ 
                ...submited, 
                id: id,
                duracao: submited.duracao + 1,
                colaborador: user.nivelAcesso === 'COL' ? user.email : colb?.email || submited.colaborador,
                gerencia: user.nivelAcesso === 'COL' ? user.gerenciaPb : colb?.gerenciaPb || submited.gerencia,
                dataIda: format(parseISO(submited.dataIda), 'dd/MM/yyyy'),
                dataVolta: format(parseISO(submited.dataVolta), 'dd/MM/yyyy'),
                dataSolicitacao: getCurrentDateTime().toString()
            });
            await NotificaPreposto({ 
                ...submited, 
                id: id,
                duracao: submited.duracao + 1,
                colaborador: user.nivelAcesso === 'COL' ? user.email : colb?.email || submited.colaborador,
                gerencia: user.nivelAcesso === 'COL' ? user.gerenciaPb : colb?.gerenciaPb || submited.gerencia,
                dataIda: format(parseISO(submited.dataIda), 'dd/MM/yyyy'),
                dataVolta: format(parseISO(submited.dataVolta), 'dd/MM/yyyy'),
                dataSolicitacao: getCurrentDateTime().toString()
            });
        }
        return { res: res, msg: msg, id: id };
    } catch (error: any) {
        toggleFnc();
        return { res: false, msg: error.message, id: 0 };
    }
}

function diferencaDias(dataString: string, target: number): boolean {
  const targetDate = parse(dataString, 'yyyy-MM-dd', new Date());
  const today = new Date();

  const diff = differenceInCalendarDays(targetDate, today);
  return diff >= target;
}

export default Viagem;