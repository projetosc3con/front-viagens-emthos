import { Timestamp } from "firebase/firestore"

type Mail = {
    to: string[],
    message: {
        html: string,
        text: string,
        subject: string
    },
    delivery?: {
        attempts: number,
        endTime: Timestamp,
        error: any,
        info: {
            accepted: string[],
            pending: any,
            rejected: any,
            response: string,
            sendgridQueueId: any
        }, 
        leaseExpireTime: any,
        startTime: string,
        state: string
    },
    idDoc?: string,
    idViagem?: string,
    acaoViagem?: string,
    statusViagem?: string,
    agenteViagem?: string
}

export type MailTable = {
    idDoc: string;
    destinatarios: string;
    assunto: string;
    statusNotificacao: string;
    tentativas: number;
    entregue: string;
    idViagem: string;
    acaoViagem: string;
    statusViagem: string;
    agenteViagem: string;
    html: string;
}

export default Mail;