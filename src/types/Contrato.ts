type Contrato = {
    id?: string;
    nroContrato: string;
    empresa: string;
    saldoContratual: number;
    valorContrato: number;
    reajuste?: number;
    agentes: AgentesContrato;
};

export type AgentesContrato = {
    preposto: Agente;
    interno: Agente;
    financeiro: Agente;
    suplenteFinanceiro: Agente;
    cliente: Agente; //Ponto focal cliente
    suplenteCliente: Agente;
}

export type Agente = {
    nome: string;
    email: string;
}

export default Contrato;