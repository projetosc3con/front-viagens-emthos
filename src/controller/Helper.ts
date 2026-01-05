import { HelperProps } from "../components/helper";

export const helperProxViagens = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Tela inicial',
        passos: [
            { descricao: '', urlFoto: ''}
        ],
        observacoes: ['']
    }

    return props;
}

export const helperCustoViagens = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Tela inicial',
        passos: [
            { descricao: '', urlFoto: ''}
        ],
        observacoes: ['']
    }

    return props;
}

export const helperBaseViagem = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Detalhes da viagem',
        passos: [
            { descricao: '1. É possível consultar o histórico de status da viagem clicando na targeta de status', urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fbase%2FCaptura%20de%20tela%202025-08-10%20125847.png?alt=media&token=0d46f017-9b96-431d-b2b3-513c34f184e1'},
            { descricao: '2. Os dados da solicitação só podem ser alterados enquanto o status estiver Aprovada ou Solicitada. Campos que não podem ser editados após a solicitação: Origem, destino, data ida e retorno. Caso algum destes campos estejam incorretos o colaborador deve solicitar o cancelamento e cadastrar uma nova viagem', urlFoto: ''},
        ],
        observacoes: ['Viagens com pré aprovação exibem um botão para o anexo de aprovação']
    }

    return props;
}

export const helperSolicitarViagem = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Solicitar viagem',
        passos: [
            { 
                descricao: '1. Preencher cidade de origem e destino, procurar pelo nome da cidade respeitando a pontuação, selecionar a correspondência correta.', 
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fsolicitacao%2FCaptura%20de%20tela%202025-08-04%20131551.png?alt=media&token=d9724ca0-bcc0-4369-8f78-b3223f16af89'
            },
            {
                descricao: '2. Para submeter o formulário é obrigatório que a data de ida da viagem seja superior a 30 dias da data de hoje.',
                urlFoto: ''
            },
            {
                descricao: '3. No campo Hotel, pesquise pelo hotel desejado, sem acentos. A reserva é condicionada à disponibilidade de vagas no hotel solicitado. Informe o macroprocesso correspondente a viagem.',
                urlFoto: ''
            },
            {
                descricao: '4. Por padrão o contrato do G&E é preenchido, não alterar. Informar o centro de custo Emthos (em caso de dúvida entrar em contato com adm.ge@emthos.com). Informar se haverá voo ou não.',
                urlFoto: ''
            },
            {
                descricao: '5. Adicione observações a solicitação, como necessidade de programação terrestre, particularidades no deslocamento e etc. Por ultimo, informe a justificativa alinhada com a coordenação.',
                urlFoto: ''
            }
        ],
        observacoes: [
            'As viagens devem ser solicitadas com no mínimo 30 dias antecedência. Em caso de exceção, entrar em contato com adm.ge@emthos.com',
            'Para solicitar uma viagem é necessário alinhamento prévio com a coordenação.',
            'Ao solicitar uma viagem o colaborador concorda com o termo de responsabilidade.',
            'Todos os campos são obrigatórios'
        ]
    }

    return props;
}

export const helperUsuarios = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Gestão de usuários',
        passos: [
            { 
                descricao: 'Para filtrar os usuários cadastrados, basta selecionar o botão "Filtrar por" e escolher a coluna que deseja filtrar, em seguida inserir o valor buscado', 
                urlFoto: ''
            },
            {
                descricao: 'Para ordenar crescente e decrescentemente, basta clicar no nome da coluna na tabela, isso reorganizará o filtro',
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fusuarios%2FCaptura%20de%20tela%202025-08-05%20072742.png?alt=media&token=77cd2c92-f90b-43d5-98ae-dc56394394aa'
            }
        ],
        observacoes: [
            'Ao excluir um colaborador, o acesso ao sistema é revogado.',
            'Ao cadastrar um colaborador é contabilizada a adição na gerência indicada'
        ]
    }

    return props;
}

export const helperAgentes = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Gestão de agentes do sistema',
        passos: [
            { 
                descricao: 'Para filtrar os usuários cadastrados, basta selecionar o botão "Filtrar por" e escolher a coluna que deseja filtrar, em seguida inserir o valor buscado', 
                urlFoto: ''
            },
            {
                descricao: 'Para ordenar crescente e decrescentemente, basta clicar no nome da coluna na tabela, isso reorganizará o filtro',
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fusuarios%2FCaptura%20de%20tela%202025-08-05%20072742.png?alt=media&token=77cd2c92-f90b-43d5-98ae-dc56394394aa'
            }
        ],
        observacoes: [
            'Ao excluir um colaborador, o acesso ao sistema é revogado.',
            'Ao cadastrar um colaborador é contabilizada a adição na gerência indicada'
        ]
    }

    return props;
}

export const helperExport = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Exportar arquivos de viagens',
        passos: [
            { 
                descricao: '1. Selecione a viagem que deseja extrair o backup de arquivos', 
                urlFoto: ''
            },
            { 
                descricao: '2. Clique em "Baixar arquivos". Será feito download de um arquivo zip com o conteudo da prestação de contas da viagem selecionada.', 
                urlFoto: ''
            }
        ]
    }

    return props;
}

export const helperMedicao = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Relatório de medição',
        passos: [
            { 
                descricao: 'Selecione a data de inicio e data fim do range de medição, serão extraídas as viagens que foram finalizadas dentro desse período.', 
                urlFoto: ''
            },
            {
                descricao: 'Ao clicar em exportar, será gerada uma planilha excel, que é baixada automaticamente na máquina do usuário e armazenada no repositório para consulta posterior',
                urlFoto: ''
            }
        ]
    }

    return props;
}



export const helperAdiantamento = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Solicitar adiantamento',
        passos: [
            { 
                descricao: '1. Após a aprovação da viagem o colaborador pode solicitar adiantamento pelo link recebido no e-mail ou consultando sua viagem no sistema.', 
                urlFoto: ''
            },
            { 
                descricao: '2. Digitar apenas números nos campos da tabela, os decimais devem ser separados por vírgula (,). O deslocamento deve ser solicitado de acordo com a necessidade diaria.', 
                urlFoto: ''
            },
            { 
                descricao: '3. Após o preenchimento, no canto inferior direito da tabela será exibido o total da solicitação. Ao enviar o formulário, o setor financeiro é notificado para o pagamento do valor.', 
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fadiantamento%2FCaptura%20de%20tela%202025-08-04%20063100.png?alt=media&token=e3b8458e-01ee-496c-bd2f-380414c77a18'
            },
        ],
        observacoes: [
            'Após a aprovação da solicitação, o colaborador receberá um email de confirmação com o link de acesso para a viagem.',
            'Apenas é possivel solicitar adiantamento enquanto o status da viagem for: “Aprovada”, “Triagem” ou “Programada”. Durante os demais status apenas é possivel consultar o adiantamento.',
            'O valor máximo de diária para alimentação é de R$ 205,00.'
        ]
    }

    return props;
}

export const helperPrestacao = async (): Promise<HelperProps> => {
    const props: HelperProps = {
        titulo: 'Prestação de contas',
        passos: [
            { 
                descricao: '1. Após o término da viagem, o status é alterado para "Pendente prestação de contas". O colaborador deve consultar sua viagem no sistema, e na aba Prestação de contas, selecionar os dias em vermelho para anexar as notas de comprovação da viagem.', 
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fprestacao%2FCaptura%20de%20tela%202025-08-04%20160242.jpg?alt=media&token=df0da09f-776a-40b6-9f31-df019b08825d'
            },
            { 
                descricao: '2. Ao selecionar o dia, o colaborador deve especificar o valor das notas no arquivo anexado, delimitando os decimais com vírgula (,). Selecionar o tipo de gasto, e escolher o arquivo contendo as notas, de preferência uma foto com todas as notas do dia em questão, como no exemplo abaixo:', 
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fprestacao%2FWhatsApp%20Image%202025-03-20%20at%2008.46.48.jpeg?alt=media&token=66290f6e-fc57-457a-a663-d71c26c86c6e'
            },
            { 
                descricao: '3. Após o carregamento de todas as notas o colaborador deve clicar em "Salvar prestação de contas", para que seja armazenado no sistema o registro. Caso contrário, as notas serão perdidas e será necessário preencher novamente.', 
                urlFoto: 'https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fhelpers%2Fprestacao%2FCaptura%20de%20tela%202025-08-04%20064430.png?alt=media&token=5492cd96-c96a-4eee-9ea9-32f7194e28d5'
            },
        ],
        observacoes: [
            'Todas as notas de mesmo tipo (alimentação ou transporte) correspondentes a um dia da viagem devem estar na mesma foto, a fim de facilitar conferência posterior. ',
            'A diferença indicada na tabela de prestação de contas indica reembolso, caso seja negativa, ou desconto em folha, caso seja positiva.'
        ]
    }

    return props;
}

