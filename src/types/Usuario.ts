type Usuario = {
    uid: string;
    email: string;
    cpf: string;
    nomeCompleto: string;
    nomeAbreviado: string;
    nivelAcesso: string; /* COL (colaborador), PBS (aprovadores), APB (Agente de viagens petrobras), AEM (Agente de viagens Emthos), ADM (Administrador, preposto) */
    gerenciaPb: string;
    matriculaEmthos: string;
}

export const nomeAbreviado = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length <= 2
    ? fullName
    : [parts[0], parts[parts.length - 1]].join(' ');
};

export default Usuario;