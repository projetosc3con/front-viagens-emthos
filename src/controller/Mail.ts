import { mailCol, viagens } from "../util/FirebaseConnection";
import { addDoc, doc, getDocs, setDoc, updateDoc, } from "firebase/firestore";
import Mail, { MailTable } from "../types/Mail";
import Viagem from "../types/Viagem";
import { getGerencia } from "./Gerencia";
import { getUser, getUsers } from "./Usuario";
import { format, parse, subDays } from "date-fns";
import Triagem from "../types/Triagem";
import PrestacaoContas from "../types/PrestacaoContas";
import Usuario from "../types/Usuario";
import api from "../api";
import Contrato from "../types/Contrato";

export const getContrato = async (numero: string): Promise<Contrato | null> => {
    try {
        const { data } = await api.get<Contrato>('/contratos/' + numero);
        return data;
    } catch (error: any) {
        return null;
    }
}

export const SendEmail = async (email: Mail): Promise<{ res: boolean, msg: string }> => {
    try {
        await addDoc(mailCol, email);
        return { res: true, msg: 'Notificação enviada com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message}
    }
}

export const getEmails = async (): Promise<MailTable[]> => {
    const snapshot = await getDocs(mailCol);
    const lista: MailTable[] =[];
    
    snapshot.forEach(doc => {
        const data = doc.data() as Mail;
        lista.push({
            idDoc: doc.id,
            destinatarios: data.to.join(', '),
            assunto: data.message.subject,
            statusNotificacao: data.delivery ? data.delivery.state === 'SUCCESS' ? 'Entregue' : data.delivery.state : '',
            tentativas: data.delivery?.attempts ?? 0,
            entregue: data.delivery ? format(data.delivery.endTime.toDate(), "dd/MM/yyyy HH:mm:ss") : '',
            idViagem: data.idViagem ?? '',
            acaoViagem: data.acaoViagem ?? '',
            statusViagem: data.statusViagem ?? '',
            agenteViagem: data.agenteViagem ?? '',
            html: data.message.html
        });
    })
    return lista;
}

export const NotificarPreAprovada = async (viagem: Viagem) => {
    try {
        const contrato = await getContrato(viagem.contrato);
        if (!contrato) return;
        const col = await getUser(viagem.colaborador);
        let mail: Mail = {
            to: [viagem.colaborador, contrato.agentes.interno.email, contrato.agentes.preposto.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Cadastro',
            statusViagem: viagem.status,
            agenteViagem: viagem.colaborador,
            message: {
                subject: `Nova viagem cadastrada - ${viagem.gerencia}`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .btn-reprove {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #dc3545;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Viagem cadastrada pré aprovada para ${col?.nomeAbreviado}. Confira os detalhes abaixo:</p>
                            <table class="info-table">
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${col?.nomeCompleto}</td>
                                </tr>
                                <tr>
                                    <th>Origem:</th>
                                    <td>${viagem.origem}</td>
                                </tr>
                                <tr>
                                    <th>Destino:</th>
                                    <td>${viagem.destino}</td>
                                </tr>
                                <tr>
                                    <th>Data de Ida:</th>
                                    <td>${viagem.dataIda}</td>
                                </tr>
                                <tr>
                                    <th>Data de Volta:</th>
                                    <td>${viagem.dataVolta}</td>
                                </tr>
                                <tr>
                                    <th>Justificativa:</th>
                                    <td>${viagem.justificativa}</td>
                                </tr>
                            </table>
                            <div>
                                <p>
                                    Ao solicitar a viagem, o(a) colaborador(a) ${col?.nomeAbreviado} declara, para os devidos fins, que solicitou formalmente a realização da viagem mencionada acima com base em necessidade de serviço, de acordo com as diretrizes internas da Petrobras. Ciente de que a efetivação da viagem depende da aprovação gerêncial e das políticas de viagens corporativas vigentes. 
                                </p>
                            </div>
                            <div class="button-group">
                                <a
                                    href="${viagem.anexoAprovacao}"
                                    class="btn-confirm"
                                >
                                    Evidência anexada
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail)
    } catch (error: any) {
        console.log(error.message)
    }
}

export const NotificarSolicitacao = async (viagem: Viagem) => {
    try {
        const gerViagem = await getGerencia(viagem.gerencia);
        if (!gerViagem) return;
        const col = await getUser(viagem.colaborador);
        let mail: Mail = {
            to: [gerViagem.aprovador],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Aprovação',
            statusViagem: viagem.status,
            agenteViagem: gerViagem.aprovador,
            message: {
                subject: `Nova viagem solicitada - ${viagem.gerencia}`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .btn-reprove {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #dc3545;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Viagem solicitada para ${col?.nomeAbreviado}. Confira os detalhes abaixo e aprove clicando no botão:</p>
                            <table class="info-table">
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${col?.nomeCompleto}</td>
                                </tr>
                                <tr>
                                    <th>Origem:</th>
                                    <td>${viagem.origem}</td>
                                </tr>
                                <tr>
                                    <th>Destino:</th>
                                    <td>${viagem.destino}</td>
                                </tr>
                                <tr>
                                    <th>Data de Ida:</th>
                                    <td>${viagem.dataIda}</td>
                                </tr>
                                <tr>
                                    <th>Data de Volta:</th>
                                    <td>${viagem.dataVolta}</td>
                                </tr>
                                <tr>
                                    <th>Justificativa:</th>
                                    <td>${viagem.justificativa}</td>
                                </tr>
                            </table>
                            <div>
                                <p>
                                    Ao solicitar a viagem, o(a) colaborador(a) ${col?.nomeAbreviado} declara, para os devidos fins, que solicitou formalmente a realização da viagem mencionada acima com base em necessidade de serviço, de acordo com as diretrizes internas da Petrobras. Ciente de que a efetivação da viagem depende da aprovação gerêncial e das políticas de viagens corporativas vigentes. 
                                </p>
                            </div>
                            <div class="button-group">
                                <a
                                    href="https://api-viagens-emthos.vercel.app/emails/handleraprovacao?docId=${viagem.id}&action=approve"
                                    class="btn-confirm"
                                >
                                    Aprovar
                                </a>
                                <a
                                    href="https://api-viagens-emthos.vercel.app/emails/handleraprovacao?docId=${viagem.id}&action=reject"
                                    class="btn-reprove"
                                >
                                    Reprovar
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail)
    } catch (error: any) {
        console.log(error.message)
    }
}

export const NotificarProgramacao = async (viagem: Viagem, orcamento?: Triagem) => {
    try {
        const viagemRef = doc(viagens, viagem.id.toString());
        await updateDoc(viagemRef, { status: 'Programada' });
        let mail: Mail = {
            to: [viagem.colaborador],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Programação',
            statusViagem: viagem.status,
            agenteViagem: viagem.colaborador,
            message: {
                subject: `Viagem ID ${viagem.id} para ${viagem.destino} Programada`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                        background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                        padding: 0;
                        color: #333;
                        }
                        .background-overlay {
                        background-color: #fff0;
                        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                        opacity: .25;
                        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                        inset: 0;
                        position: absolute;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="background-overlay"></div>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Viagem de ${viagem.dataIda} a ${viagem.dataVolta} programada. Você tem até 7 dias antes da viagem para solicitar adiantamento:</p>
                            <div class="button-group">
                                <a
                                    href="https://viagens-emthos.web.app/viagens/${viagem.id}/adiantamento"
                                    class="btn-confirm"
                                >
                                    Solicitar adiantamento
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
        if (orcamento) {
            const contrato = await getContrato(viagem.contrato)
            if(!contrato) return;
            let docEmail: Mail = {
                to: [contrato.agentes.cliente.email],
                idViagem: viagem.id.toString(),
                acaoViagem: 'Programação',
                statusViagem: viagem.status,
                agenteViagem: contrato.agentes.cliente.email,
                message: {
                    subject: `Viagem ID ${viagem.id} para ${viagem.destino} Programada`,
                    text: '',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8" />
                            <link
                            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                            rel="stylesheet"
                            />
                            <style>
                            body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            background-position: center center;
                            background-repeat: no-repeat;
                            background-size: cover;
                            position: relative;
                            background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                            padding: 0;
                            color: #333;
                            }
                            .background-overlay {
                            background-color: #fff0;
                            background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                            opacity: .25;
                            transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                            inset: 0;
                            position: absolute;
                            }
                            .container {
                                width: 600px;
                                margin: 32px auto;
                                background: #fff;
                                border-radius: 8px;
                                padding: 24px;
                            }
                            .btn-confirm {
                                display: inline-block;
                                padding: 12px 24px;
                                margin: 16px 0;
                                background-color: #007bff;
                                color: #ffffff !important;
                                text-decoration: none;
                                border-radius: 4px;
                                font-weight: 700;
                                margin-right: 12px;
                            }
                            .button-group {
                                display: flex;
                            }
                            .info-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 16px;
                            }
                            .info-table th,
                            .info-table td {
                                text-align: left;
                                padding: 8px;
                                border-bottom: 1px solid #ddd;
                            }
                            .info-table th {
                                width: 30%;
                                font-weight: 700;
                            }
                            </style>
                        </head>
                        <body>
                            <div class="background-overlay"></div>
                            <div class="container">
                                <h2 style="margin-top:0;">Olá ${contrato.agentes.cliente.nome},</h2>
                                <p>Viagem de ${viagem.dataIda} a ${viagem.dataVolta} programada. Valor final de R$ ${orcamento.valorProgramado}</p>
                                <div class="button-group">
                                    <a
                                        href=${orcamento.emailDownloadUrl}
                                        class="btn-confirm"
                                        target="_blank"
                                    >
                                        Triagem petrobras
                                    </a>
                                    <a
                                        href=${orcamento.progDownloadUrl}
                                        class="btn-confirm"
                                        target="_blank"
                                    >
                                        Programação emthos
                                    </a>
                                </div>
                            </div>
                        </body>
                        </html>
                    
                    `
                }
            }

            await addDoc(mailCol, docEmail);
        }
    } catch (error: any) {

    }
}

export const NotificaPrepSolicitacao = async (viagem: Viagem, col: Usuario) => {
    try {
        const contrato = await getContrato(viagem.contrato);
        if (!contrato) return;
        let mail: Mail = {
            to: [contrato.agentes.preposto.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Notif. Preposto',
            statusViagem: viagem.status,
            agenteViagem: contrato.agentes.preposto.nome,
            message: {
                subject: `Viagem ID ${viagem.id} - ${viagem.status}`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá ${contrato.agentes.preposto.nome}, viagem solicitada</h2>
                            <table class="info-table">
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${col.nomeAbreviado}</td>
                                </tr>
                                <tr>
                                    <th>Gerencia:</th>
                                    <td>${viagem.gerencia}</td>
                                </tr>
                                <tr>
                                    <th>Origem:</th>
                                    <td>${viagem.origem}</td>
                                </tr>
                                <tr>
                                    <th>Destino:</th>
                                    <td>${viagem.destino}</td>
                                </tr>
                                <tr>
                                    <th>Data de Ida:</th>
                                    <td>${viagem.dataIda}</td>
                                </tr>
                                <tr>
                                    <th>Data de Volta:</th>
                                    <td>${viagem.dataVolta}</td>
                                </tr>
                                <tr>
                                    <th>Hotel:</th>
                                    <td>${viagem.hotel}</td>
                                </tr>
                                <tr>
                                    <th>Voo:</th>
                                    <td>${viagem.voo ? 'Sim' : 'Não'}</td>
                                </tr>
                                <tr>
                                    <th>Observação colaborador:</th>
                                    <td>${viagem.obsColaborador}</td>
                                </tr>
                                <tr>
                                    <th>Justificativa:</th>
                                    <td>${viagem.justificativa}</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <p>
                                Ao solicitar a viagem, o(a) colaborador(a) ${col.nomeCompleto} declara, para os devidos fins, que solicitou formalmente a realização da viagem mencionada acima com base em necessidade de serviço, de acordo com as diretrizes internas da Petrobras. Ciente de que a efetivação da viagem depende da aprovação gerêncial e das políticas de viagens corporativas vigentes. 
                            </p>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {
        
    }
}

export const NotificarCancelamento = async (viagem: Viagem) => {
    try {
        const viagemRef = doc(viagens, viagem.id.toString());
        await updateDoc(viagemRef, { status: 'Cancelar' });
        const contrato = await getContrato(viagem.contrato);
        if(!contrato) return;
        const col = await getUser(viagem.colaborador);
        let mail: Mail = {
            to: [contrato.agentes.interno.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Solicitação de cancelamento',
            statusViagem: 'Cancelar',
            agenteViagem: contrato.agentes.interno.nome,
            message: {
                subject: `Solicitado cancelamento da viagem ID ${viagem.id}`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                        background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                        padding: 0;
                        color: #333;
                        }
                        .background-overlay {
                        background-color: #fff0;
                        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                        opacity: .25;
                        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                        inset: 0;
                        position: absolute;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="background-overlay"></div>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá ${contrato.agentes.interno.nome},</h2>
                            <p>O colaborador ${col?.nomeAbreviado || viagem.colaborador} solicitou o cancelamento da viagem abaixo:</p>
                            <div class="button-group">
                                <a
                                    href="https://viagens-emthos.web.app/viagens/${viagem.id}"
                                    class="btn-confirm"
                                >
                                    Acessar viagem
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {

    }
}

export const NotificarCancelada = async (viagem: Viagem) => {
    try {
        const contrato = await getContrato(viagem.contrato);
        if(!contrato) return;
        let mail: Mail = {
            to: [viagem.colaborador, contrato.agentes.preposto.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Cancelamento',
            statusViagem: 'Cancelada',
            agenteViagem:  contrato.agentes.preposto.email,
            message: {
                subject: `Viagem ID ${viagem.id} - Cancelada`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                        background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                        padding: 0;
                        color: #333;
                        }
                        .background-overlay {
                        background-color: #fff0;
                        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                        opacity: .25;
                        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                        inset: 0;
                        position: absolute;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="background-overlay"></div>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Viagem para ${viagem.destino} cancelada</p>
                            <div class="button-group">
                                <a
                                    href="https://viagens-emthos.web.app/viagens/${viagem.id}"
                                    class="btn-confirm"
                                >
                                    Acessar viagem
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {

    }
}

export const NotificaPendentePrestacao = async (viagem: Viagem, difPrestacao: number, observacoes: string) => {
        try {
        const contrato = await getContrato(viagem.contrato)
        if (!contrato) return;
        let mail: Mail = {
            to: [contrato.agentes.preposto.email, viagem.colaborador],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Pendente prestação de contas',
            statusViagem: viagem.status,
            agenteViagem: contrato.agentes.preposto.nome,
            message: {
                subject: `Viagem ID ${viagem.id} - Revisão da prestação de contas`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Prestação de contas foi revisada. Acesse o sistema e confira os ajustes feitos, valor da diferença R$ ${difPrestacao}</p>
                            <table class="info-table">
                                <tr>
                                    <th>Observações:</th>
                                    <td>${observacoes}</td>
                                </tr>
                            </table>
                            <div class="button-group">
                                <a class="btn-confirm" href="https://viagens-emthos.web.app/viagens/${viagem.id}">
                                    Acessar viagem
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {

    }
}

export const NotificaPreposto = async (viagem: Viagem) => {
        try {
        const contrato = await getContrato(viagem.contrato);
        if (!contrato) return;
        let mail: Mail = {
            to: [contrato.agentes.preposto.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Notif. Preposto',
            statusViagem: viagem.status,
            agenteViagem: contrato.agentes.preposto.nome,
            message: {
                subject: `Viagem ID ${viagem.id} - ${viagem.status}`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá ${contrato.agentes.preposto.nome},</h2>
                            <p>Viagem atualizada, status: ${viagem.status}</p>
                            <table class="info-table">
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${viagem.colaborador}</td>
                                </tr>
                                <tr>
                                    <th>Gerencia:</th>
                                    <td>${viagem.gerencia}</td>
                                </tr>
                                <tr>
                                    <th>Origem:</th>
                                    <td>${viagem.origem}</td>
                                </tr>
                                <tr>
                                    <th>Destino:</th>
                                    <td>${viagem.destino}</td>
                                </tr>
                                <tr>
                                    <th>Data de Ida:</th>
                                    <td>${viagem.dataIda}</td>
                                </tr>
                                <tr>
                                    <th>Data de Volta:</th>
                                    <td>${viagem.dataVolta}</td>
                                </tr>
                                <tr>
                                    <th>Hotel:</th>
                                    <td>${viagem.hotel}</td>
                                </tr>
                                <tr>
                                    <th>Voo:</th>
                                    <td>${viagem.voo ? 'Sim' : 'Não'}</td>
                                </tr>
                                <tr>
                                    <th>Observação colaborador:</th>
                                    <td>${viagem.obsColaborador}</td>
                                </tr>
                                <tr>
                                    <th>Justificativa:</th>
                                    <td>${viagem.justificativa}</td>
                                </tr>
                            </table>
                            <div class="button-group">
                                <a class="btn-confirm" href="https://viagens-emthos.web.app/viagens/${viagem.id}">
                                    Acessar viagem
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {

    }
}

export const NotificarFinanceiroAdiantamento = async (viagem: Viagem) => {
    try {
        const contrato = await getContrato(viagem.contrato);
        const colaborador = await getUser(viagem.colaborador);
        const dataIdaViagem = parse(viagem.dataIda, "dd/MM/yyyy", new Date());
        const dataAdiantamento = subDays(dataIdaViagem, 3);
        if (!contrato || !colaborador) return;
        let mail: Mail = {
            to: [contrato.agentes.financeiro.email, contrato.agentes.suplenteFinanceiro.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Solicitação de adiantamento',
            statusViagem: viagem.status,
            agenteViagem: contrato.agentes.financeiro.nome,
            message: {
                subject: `Viagem ID ${viagem.id} - Solicitado adiantamento`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                            color: #333;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá ${contrato.agentes.financeiro.nome},</h2>
                            <p>Solicitado adiantamento no valor de R$ ${viagem.valorAdiantamento}. Data esperada para pagamento do adiantamento: ${format(dataAdiantamento, "dd/MM/yyyy")}</p>
                            <table class="info-table">
                                <tr>
                                    <th>Nome completo:</th>
                                    <td>${colaborador.nomeCompleto}</td>
                                </tr>
                                <tr>
                                    <th>PIX:</th>
                                    <td>${colaborador.cpf}</td>
                                </tr>
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${viagem.colaborador}</td>
                                </tr>
                                <tr>
                                    <th>Origem:</th>
                                    <td>${viagem.origem}</td>
                                </tr>
                                <tr>
                                    <th>Destino:</th>
                                    <td>${viagem.destino}</td>
                                </tr>
                                <tr>
                                    <th>Data de Ida:</th>
                                    <td>${viagem.dataIda}</td>
                                </tr>
                                <tr>
                                    <th>Data de Volta:</th>
                                    <td>${viagem.dataVolta}</td>
                                </tr>
                                <tr>
                                    <th>Hotel:</th>
                                    <td>${viagem.hotel}</td>
                                </tr>
                                <tr>
                                    <th>Voo:</th>
                                    <td>${viagem.voo ? 'Sim' : 'Não'}</td>
                                </tr>
                                <tr>
                                    <th>Observação colaborador:</th>
                                    <td>${viagem.obsColaborador}</td>
                                </tr>
                                <tr>
                                    <th>Justificativa:</th>
                                    <td>${viagem.justificativa}</td>
                                </tr>
                            </table>
                            <p>Para confirmar a programação do adiantamento, clique no link abaixo:</p>
                            <div class="button-group">
                                <a class="btn-confirm" href="https://api-viagens-emthos.vercel.app/emails/handlervaloradiantado?docId=${viagem.id}">
                                    Valor adiantado
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {
        console.log(error.message);
    }
}

export const NotificarFinanceiroPrestacao = async(viagem: Viagem, prestacao: PrestacaoContas, url: String) => {
    try {
        const contrato = await getContrato(viagem.contrato);
        const colaborador = await getUser(viagem.colaborador);
        if (!contrato || !colaborador) return;
        let mail: Mail = {
            to: [contrato.agentes.financeiro.email, contrato.agentes.suplenteFinanceiro.email],
            idViagem: viagem.id.toString(),
            acaoViagem: 'Prestação de contas enviada',
            statusViagem: viagem.status,
            agenteViagem: contrato.agentes.financeiro.nome,
            message: {
                subject: `Viagem ID ${viagem.id} - Prestação de contas enviada`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                        background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                        padding: 0;
                        color: #333;
                        }
                        .background-overlay {
                        background-color: #fff0;
                        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                        opacity: .25;
                        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                        inset: 0;
                        position: absolute;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="background-overlay"></div>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá ${contrato.agentes.financeiro.nome},</h2>
                            <p>
                            ${prestacao.valorDiferenca > 0 ?
                                'Devolvido via pix o valor de R$ ' + prestacao.valorDiferenca
                                :
                                prestacao.valorDiferenca === 0 ?
                                'Sem diferença entre prestação e adiantamento'
                                :
                                'Programar reembolso no valor de R$ ' + (prestacao.valorDiferenca * -1)
                            }
                            </p>
                            <table class="info-table">
                                <tr>
                                    <th>Nome completo:</th>
                                    <td>${colaborador.nomeCompleto}</td>
                                </tr>
                                <tr>
                                    <th>PIX:</th>
                                    <td>${colaborador.cpf}</td>
                                </tr>
                                <tr>
                                    <th>ID:</th>
                                    <td>${viagem.id}</td>
                                </tr>
                                <tr>
                                    <th>Colaborador:</th>
                                    <td>${viagem.colaborador}</td>
                                </tr>
                                <tr>
                                    <th>Adiantamento:</th>
                                    <td>R$ ${prestacao.valorAdiantamento}</td>
                                </tr>
                                <tr>
                                    <th>Prestação de contas:</th>
                                    <td>R$ ${prestacao.valorTotal}</td>
                                </tr>
                                <tr>
                                    <th>Status prestação:</th>
                                    <td>${prestacao.status}</td>
                                </tr>
                                
                                <tr>
                                    <th>Status viagem:</th>
                                    <td>${viagem.status}</td>
                                </tr>
                            </table>
                            ${prestacao.valorDiferenca !== 0 && 
                            `<div class="button-group">
                                ${prestacao.valorDiferenca > 0 ?
                                `<a class="btn-confirm" href="${url}">
                                    Abrir comprovante pix
                                </a>`
                                :
                                `<a class="btn-confirm" href="https://api-viagens-emthos.vercel.app/emails/handlerdescontoreembolso?docId=${viagem.id}&acao=reembolso">
                                    Notificar reembolso programado
                                </a>`
                                }
                            </div>`
                            }
                        </div>
                    </body>
                    </html>
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {
        console.log(error.message);
    }
}

export const DeptMail = async() => {
       try {
        const cols = await getUsers();
        const emails: string[] = cols.filter(u => u.nivelAcesso === 'COL').map(u => u.email);
        let mail: Mail = {
            to: emails,
            idViagem: 'dept mail',
            acaoViagem: 'dept mail',
            statusViagem: 'dept mail',
            agenteViagem: 'dept mail',
            message: {
                subject: `Implantação do Sistema de Viagens Emthos`,
                text: '',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                        rel="stylesheet"
                        />
                        <style>
                        body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: cover;
                        position: relative;
                        background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);    
                        padding: 0;
                        color: #333;
                        }
                        .background-overlay {
                        background-color: #fff0;
                        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
                        opacity: .25;
                        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
                        inset: 0;
                        position: absolute;
                        }
                        .container {
                            width: 600px;
                            margin: 32px auto;
                            background: #fff;
                            border-radius: 8px;
                            padding: 24px;
                        }
                        .btn-confirm {
                            display: inline-block;
                            padding: 12px 24px;
                            margin: 16px 0;
                            background-color: #007bff;
                            color: #ffffff !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 700;
                            margin-right: 12px;
                        }
                        .button-group {
                            display: flex;
                        }
                        .info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 16px;
                        }
                        .info-table th,
                        .info-table td {
                            text-align: left;
                            padding: 8px;
                            border-bottom: 1px solid #ddd;
                        }
                        .info-table th {
                            width: 30%;
                            font-weight: 700;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="background-overlay"></div>
                        <div class="container">
                            <h2 style="margin-top:0;">Olá,</h2>
                            <p>Prezados colaboradores EMTHOS.

Informamos que a partir de 11/08/2025 as solicitações de valores para adiantamento em viagens a serviço deverão ser realizadas a partir do sistema, no link abaixo seguindo as orientações apresentadas anteriormente.
Quaisquer dúvidas  gentileza procurar Victor Hugo chave F464 ou Daniel Rodrigo chave C4DR.

Seguimos à disposição.</p>
                            <div class="button-group">
                                <a
                                    href="https://viagens-emthos.web.app"
                                    class="btn-confirm"
                                >
                                    Vigens Emthos
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                
                `
            }
        }
        await addDoc(mailCol, mail);
    } catch (error: any) {

    } 
}