import { Timestamp } from "firebase/firestore";

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

export default Viagem;