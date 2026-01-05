import Viagem from "../../types/Viagem";
import MUIDataTable from "mui-datatables";
import { MUIDataTableColumn } from "mui-datatables";
import { Responsive } from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useRef, useState, useEffect } from "react";
import { getViagens, getViagensColaborador } from "../../controller/Viagem";
import { useUserContext } from "../../context/UserContext";

const List = () => {
    const navigate = useNavigate();
    const layout: Responsive = "simple";
    const { user } = useUserContext();
    const hasFetchedData = useRef(false);
    const [viagens, setViagens] = useState<Viagem[]>();
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
                navigate('/viagens/'+rowData[0]);
            },
            responsive: layout,
            textLabels: {
                body: {
                  noMatch: "Nenhum resultado encontrado",
                  toolTip: "Ordenar",
                  columnHeaderTooltip: (column: MUIDataTableColumn) => `Clique para ordenar por ${column.label || column.name}. Arraste para alterar a posição na tabela`,
                },
                pagination: {
                  next: "Próxima página",
                  previous: "Página anterior",
                  rowsPerPage: "Linhas por página:",
                  displayRows: "de",
                },
                toolbar: {
                  search: "Pesquisar por todas as colunas da lista",
                  downloadCsv: "Baixar CSV da lista de seleção atual",
                  print: "Imprimir ou salvar em pdf a seleção atual",
                  viewColumns: "Escolher quais colunas serão exibidas",
                  filterTable: "Possibilita combinar filtros de acordo com as opções presentes na lista",
                },
                filter: {
                  all: "Todos",
                  title: "Filtros",
                  reset: "Limpar",
                },
                viewColumns: {
                  title: "Colunas exibidas",
                  titleAria: "Mostrar/Esconder colunas da tabela",
                },
                selectedRows: {
                  text: "linha(s) selecionada(s)",
                  delete: "Excluir",
                  deleteAria: "Excluir linhas selecionadas",
                }
              }
    };
    const columns = [
        {
            name: "id",
            label: "ID",
            options: {
                filter: true,
                sort: true,
                display: false,
                draggable: false,
            }
        },
        {
            name: "status",
            label: "Status",
            options: {
                filter: true,
                sort: true,
                display: true,
                draggable: false
            }
        },
        {
          name: "colaborador",
            label: "Colaborador",
            options: {
                filter: true,
                sort: true,
                display: user ? user.nivelAcesso === 'COL' ? false : true : true,
                draggable: false
            }
        },
        {
            name: "origem",
            label: "Origem",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "destino",
            label: "Destino",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
            name: "dataIda",
            label: "Ida",
            options: {
                filter: true,
                sort: true,
                display: true,
            }
        },
        {
            name: "dataVolta",
            label: "volta",
            options: {
                filter: true,
                sort: true,
                display: true
            }
        },
        {
          name: "hotel",
          label: "Hotel",
          options: {
                filter: true,
                sort: true,
                display: true
          }
        },
        {
          name: "dataSolicitacao",
          label: "Solicitado em",
          options: {
                filter: true,
                sort: true,
                display: true
          }
        },
        {
          name: "gerencia",
          label: "Gerência",
          options: {
                filter: true,
                sort: true,
                display: false
          }
        },
        {
          name: "duracao",
          label: "Duração",
          options: {
                filter: true,
                sort: true,
                display: false
          }
        },
        {
          name: "macroProcesso",
          label: "Macro Processo",
          options: {
                filter: true,
                sort: true,
                display: false
          }
        }
    ];
    
    useEffect(() => {
        if (hasFetchedData.current) return; 
        hasFetchedData.current = true;

        const fetchData = async() => {
            if(user){
              if(user.nivelAcesso === 'COL') {
                const data = await getViagensColaborador(user.email);
                setViagens(data);
              } else {
                const data = await getViagens();
                setViagens(data);
              }
            }
        }

        fetchData();
    }, []);

    if (viagens) {
        return (
            <ThemeProvider theme={theme}>
              <div className="card">
                  <div className="card-body">
                      <MUIDataTable
                          title={""}
                          data={viagens}
                          columns={columns}
                          options={options}
                      />
                  </div>
              </div>
            </ThemeProvider>
        )
    } else {
        return (
            <div className="d-flex justify-content-center pt-4">
              <Spinner/>
            </div>
        )
    }
}

export default List;