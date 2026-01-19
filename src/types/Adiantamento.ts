type Adiantamento = {
    idDoc: string;
    idViagem: string;
    itens: ItemAdiantamento[];
    totalAdiantamento: number;
}

export type ItemAdiantamento = {
    alimentacao: number;
    deslocamento: number;
    total: number;
    dataReferencia: string;
}

export default Adiantamento;