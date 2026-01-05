import { MailTable } from "../../types/Mail";
import MUIDataTable from "mui-datatables";
import { MUIDataTableColumn } from "mui-datatables";
import { Responsive } from "mui-datatables";
import { Spinner } from "react-bootstrap";
import { useRef, useState, useEffect } from "react";
import { useUserContext } from "../../context/UserContext";
import { getEmails, SendEmail } from "../../controller/Mail";
import { format } from "date-fns";
import { deleteDoc, doc } from "firebase/firestore";
import Mail from "../../types/Mail";
import { createCollection } from "../../util/FirebaseConnection";
import { Modal } from "react-bootstrap";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Notificacoes = () => {
    const { user } = useUserContext();
    const layout: Responsive = "simple";
    const hasFetchedData = useRef(false);
    const [emails, setEmails] = useState<MailTable[]>([]);
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [toDelete, setToDelete] = useState('');
    const [htmlContent, setHtml] = useState('');
    const theme = createTheme({
        components: {
            MuiTablePagination: {
            styleOverrides: {
                root: {
                color: '#edf6f9', // Cor do texto geral da paginação
                },
                toolbar: {
                '& .MuiSelect-select': {
                    color: '#edf6f9', // Cor do texto no dropdown "Linhas por página"
                },
                '& .MuiSvgIcon-root': {
                    color: '#edf6f9', // Cor do ícone de dropdown
                },
                },
                actions: {
                '& .MuiIconButton-root': {
                    color: '#edf6f9', // Cor dos botões de navegação
                    '&:hover': {
                    color: '#B85A5A', // Cor ao passar o mouse
                    },
                },
                },
            },
            },
            MUIDataTableHeadCell:{
            styleOverrides: {
                root: {
                backgroundColor: 'transparent',
                },
            },
            },
            MuiInputBase: {
            styleOverrides: {
                root: {
                '&.Mui-focused': {
                    borderColor: '#edf6f9', // Cor da borda ao focar no input
                },
                },
            },
            },
            MuiSvgIcon: {
            styleOverrides: {
                root: {
                color: '#edf6f9', // Cor do ícone da lupa
                '&:hover': {
                    color: '#B85A5A', // Cor ao passar o mouse
                },
                },
            },
            },
            MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                borderColor: '#edf6f9', // Cor da borda padrão
                },
                root: {
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#B85A5A', // Cor ao focar no input
                },
                },
            },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: '#edf6f9',
                    "&:hover": {
                        backgroundColor: "transparent",  
                        "& .MuiSvgIcon-root": {
                        color: '#B85A5A', 
                        },
                    },
                    },
                },
            },
            MuiPaper: {
            styleOverrides: {
                root: {
                backgroundColor: '#444' + ' !important',
                },
            },
            },
            MuiPopover: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#444', // fundo do overlay
                    color: '#edf6f9', // cor do texto
                },
            },
            },
            MuiList: {
            styleOverrides: {
                root: {
                    backgroundColor: '#222',
                    color: '#edf6f9',
                },
            },
            },
            MuiMenuItem: {
            styleOverrides: {
                root: {
                    backgroundColor: '#222',
                    color: '#edf6f9',
                    '&.Mui-selected': {
                        backgroundColor: '#B85A5A33',
                        color: '#B85A5A',
                    },
                    '&:hover': {
                        backgroundColor: '#B85A5A22',
                    },
                },
            },
            },
            MuiTable: {
            styleOverrides: {
                root: {
                borderCollapse: 'collapse',
                },
            },
            },
            MuiTableRow: {
            styleOverrides: {
                root: {
                borderBottom: `1px solid rgba(145, 158, 171, .32)`, // Cor da borda entre linhas
                },
            },
            },
            MuiFormControl: {
            styleOverrides: {
                root: {
                    backgroundColor: '#444',
                },
            },
            },
            MuiTableCell: {
            styleOverrides: {
                root: {
                borderBottom: `1px solid rgba(145, 158, 171, .32)`,
                color: '#edf6f9',
                },
                head: {
                backgroundColor: 'transparent',
                color: '#edf6f9',
                fontWeight: 'bold',
                borderBottom: `2px solid rgba(145, 158, 171, .32)`,
                },
            },
            },
            MUIDataTableFilter: {
            styleOverrides: {
                root: {
                backgroundColor: '#444' + ' !important',
                },
            },
            },
            MUIDataTableViewCol: {
            styleOverrides: {
                root: {
                paddingLeft: '1rem'
                },
            },
            },
            MuiChip: {
            styleOverrides: {
            root: {
                backgroundColor: '#B85A5A' + '22', // Fundo do chip
                color: '#edf6f9', 
                fontWeight: 'bold',
                border: `1px solid ${'#B85A5A'}`,
                marginRight: '.25rem'
            },
            deleteIcon: {
                color: '#B85A5A',
                '&:hover': {
                color: '#B85A5A',
                backgroundColor: 'transparent',
                },
            },
            label: {
                paddingLeft: 8,
                paddingRight: 8,
            },
            },
            },
            MuiTableSortLabel: {
            styleOverrides: {
                root: {
                color: '#edf6f9', // Define a cor padrão do texto
                '&:hover': {
                    color: '#edf6f9', // Cor ao passar o mouse
                },
                '&.Mui-active': {
                    color: '#edf6f9', // Cor ao estar ordenado (ativo)
                    '& .MuiTableSortLabel-icon': {
                    color: '#edf6f9', // Cor do ícone no estado ativo
                    },
                },
                },
                icon: {
                color: '#edf6f9', // Cor padrão do ícone
                '&:hover': {
                    color: '#B85A5A', // Cor ao passar o mouse no ícone
                },
                },
            },
            },
            MuiInput: {
            styleOverrides: {
                root: {
                    color: '#edf6f9',
                },
                underline: {
                '&:before': {
                    borderBottom: `1px solid ${'#edf6f9'}`, // linha padrão
                },
                '&:hover:not(.Mui-disabled):before': {
                    borderBottom: `1px solid ${'#B85A5A'}`, // ao passar o mouse
                },
                '&:after': {
                    borderBottom: `2px solid ${'#B85A5A'}`, // ao focar
                },
                },
            },
            },
        },
        typography: {
            allVariants: {
            color: '#edf6f9', // Define a cor padrão para todas as variantes de texto
            },
        },
    });
    const options = {
        elevation: 0,  
        draggableColumns: {
            enabled: true
        },
        resizableColumns: false,
        rowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
        searchOpen: true,
        selectableRowsHideCheckboxes: true,
        selectableRowsOnClick: false,
        onRowClick: (rowData: string[], rowMeta: {dataIndex: number, rowIndex: number}) => {
            const filter = emails.find((i) => i.idDoc === rowData[0]);
            if (!filter) return;
            setToDelete(rowData[0]);
            setHtml(filter.html);
            setShow(true);
        },
        responsive: layout,
        textLabels: {
            body: {
                noMatch: "Nenhum resultado encontrado",
                toolTip: "Ordenar",
                columnHeaderTooltip: (column: MUIDataTableColumn) => `Ordenar por ${column.label || column.name}`,
            },
            pagination: {
                next: "Próxima página",
                previous: "Página anterior",
                rowsPerPage: "Linhas por página:",
                displayRows: "de",
            },
            toolbar: {
                search: "Pesquisar",
                downloadCsv: "Baixar CSV",
                print: "Imprimir",
                viewColumns: "Ver colunas",
                filterTable: "Filtrar tabela",
            },
            filter: {
                all: "Todos",
                title: "Filtros",
                reset: "Limpar",
            },
            viewColumns: {
                title: "Mostrar colunas",
                titleAria: "Mostrar/Esconder colunas da tabela",
            },
            selectedRows: {
                text: "linha(s) selecionada(s)",
                delete: "Excluir",
                deleteAria: "Excluir linhas selecionadas",
            },
        }
    };
    const columns = [
        {
            name: "idDoc",
            label: "ID transação",
            options: {
                filter: true,
                sort: true,
                display: false,
                draggable: false,
            }
        },
        {
            name: "destinatarios",
            label: "Destinatarios",
            options: {
                filter: true,
                sort: true,
                display: true,
                draggable: true
            }
        },
        {
            name: "assunto",
            label: "Assunto",
            options: {
                filter: true,
                sort: true,
                display: true,
                draggable: true
            }
        },
        {
            name: "statusNotificacao",
            label: "Status notificação",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "tentativas",
            label: "Tentativas",
            options: {
                filter: false,
                sort: true,
                display: false
            }
        },
        {
            name: "entregue",
            label: "Data entregue",
            options: {
                filter: true,
                sort: true,
                display: true,
            }
        },
        {
            name: "idViagem",
            label: "Id viagem",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "acaoViagem",
            label: "Ação viagem",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "statusViagem",
            label: "Status viagem",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "agenteViagem",
            label: "Agente viagem",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        }
    ];

    useEffect(() => {
        if (hasFetchedData.current) return; 
        hasFetchedData.current = true;

        const fetchData = async () => {
            if(user){
                if(user.nivelAcesso === 'ADM') {
                    const res = await getEmails();
                    setEmails(res);
                }
            }
        };

        fetchData();
    }, [user]);

    const fetchData = async () => {
        if(user){
            if(user.nivelAcesso === 'ADM') {
                const res = await getEmails();
                setEmails(res);
            }
        }
    };

    const handleDelete = async () => {
        if (toDelete === '') return;

        try {
            const docRef = doc(createCollection("mail"), toDelete);
            await deleteDoc(docRef);
            setHtml('');
            setToDelete('');
            fetchData();
            setRes(true);
            setMessage("Notificação excluída com sucesso");
            setShow(true);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro: ' + error.message);
            setShow(true);
        }
    }

    const handleClose = () => {
        setShow(false);
        setMessage('');
        setHtml('');
        setToDelete('');
    }

    const handleReenviar = async () => {
        const snap = emails.find((e) => e.idDoc === toDelete);
        if (!snap) return;
        let resend: Mail = {
            to: snap?.destinatarios.split(','),
            message: {
                html: snap.html,
                text: '',
                subject: snap.assunto
            },
            idViagem: snap.idViagem,
            acaoViagem: snap.acaoViagem,
            statusViagem: snap.statusViagem,
            agenteViagem: snap.agenteViagem
        }
        
        const {msg} = await SendEmail(resend);
        alert(msg);
    }
    
    if (user?.nivelAcesso === 'ADM') {
        if (emails) {
            return (
                <>
                <ThemeProvider theme={theme}>
                    <div className="card">
                        <div className="card-body">
                            <MUIDataTable
                                title={""}
                                data={emails}
                                columns={columns}
                                options={options}
                            />
                        </div>
                    </div>
                </ThemeProvider>
                <Modal show={show} onHide={() => handleClose()} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Visualizar email</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {htmlContent !== '' && 
                            <iframe
                                title="Email Preview"
                                srcDoc={htmlContent}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: 400,
                                    border: "none",
                                }}
                            />
                        }
                        {message !== '' && message}
                    </Modal.Body>
                    {toDelete !== '' &&
                        <Modal.Footer>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-danger me-4" onClick={() => handleDelete()}>Deletar</button>
                            <button className="btn btn-secondary" onClick={() => handleReenviar()}>Reenviar</button>
                        </div>
                        </Modal.Footer>
                    }
                </Modal>
                </>
            );
        } else {
            return (
                <div className="d-flex justify-content-center pt-4">
                    <Spinner />
                </div>
            );
        }
    } else {
        return <>Sem acesso a essa área</>;
    }
};

export default Notificacoes;
