type PrestacaoContas = {
    idDoc: string;
    idViagem: string;
    status: string; /* Enviada, Pendente no prazo, Pendente atrasada, Finalizada */
    valorTotal: number;
    valorAdiantamento: number;
    valorDiferenca: number;
    notas?: Nota[];
    urlReciboPix?: string;
}

export type Nota = {
    diaViagem: string;
    valor: number;
    urlImagem: string;
    tipo: string; /* alimentação transporte outros */
    validada?: boolean;
    glosa?: number; /* (valor) se ultrassa os 205 reais na média ou transporte limite anexo 7*/
    obsGlosa?: string; /* motivo */
}

export default PrestacaoContas;