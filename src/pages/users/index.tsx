import { FormEvent, useEffect, useRef, useState } from "react";
import { addUser, deleteUser, getUsers, limiteDeUsers, updateUser } from "../../controller/Usuario";
import Usuario, { nomeAbreviado } from "../../types/Usuario";
import { useUserContext } from "../../context/UserContext";
import { customSelectStyles, ListBox } from "./styles";
import InputMask from 'react-input-mask';
import Select, { SingleValue, components } from 'react-select';
import Gerencia from "../../types/Gerencia";
import { diminuirColaborador, getGerencias, incluirColaborador } from "../../controller/Gerencia";
import { Modal } from "react-bootstrap";
import SearchFilter from "../../components/searchFilter";
import Caret from "../../components/caret";
import Helper, { HelperProps } from "../../components/helper";
import { helperUsuarios } from "../../controller/Helper";

type OptionType = { value: string; label: string };

type Sort = {
    direction: 'asc' | 'desc';
    keyToSort: keyof Usuario;
}

const Users = () => {
    const { user } = useUserContext();
    const hasFetchedData = useRef(false);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);
    const [show, setShow] = useState(false);
    const [res, setRes] = useState(false);
    const [message, setMessage] = useState('');
    const [filter, setFilter] = useState('');
    const [info, setInfo] = useState<HelperProps>();
    const options = ['E-mail', 'Nome', 'Gerência', 'Acesso'];
    const [selected, setSelected] = useState<string>(options[0]);
    const [novoEditado, setNovoEditado] = useState<Usuario>({
        uid: 'Pendente',
        email: '',
        cpf: '',
        nomeCompleto: '',
        nomeAbreviado: '',
        nivelAcesso: '',
        gerenciaPb: 'N/A',
        matriculaEmthos: 'N/A'
    });
    const nivelOptions = [
        { value: '', label: 'Selecione...'},
        { value: 'COL', label: 'Colaborador' },
        // { value: 'PBS', label: 'Aprovador' },
        //{ value: 'APB', label: 'Agente Petrobras' },
        { value: 'AEM', label: 'Agente Emthos' },
        { value: 'ADM', label: 'Administrador' }
    ]
    const gerenciasOptions = [
    { value: '', label: 'Selecione...' },
    ...gerencias.map((gerencia) => ({ value: gerencia.nome, label: gerencia.nome }))
    ];
    const [sort, setSort] = useState<Sort>({ keyToSort: 'nomeAbreviado', direction: 'asc'});
    const headers = [
        {
            id: 1,
            key: "email",
            label: "E-mail"
        },
        {
            id: 2,
            key: "nomeAbreviado",
            label: "Nome"
        },
        {
            id: 3,
            key: "gerencia",
            label: "Gerência"
        },
        {
            id: 4,
            key: "nivelAcesso",
            label: "Acesso"
        },
        {
            id: 5,
            key: "acoes",
            label: "Ações"
        }
    ];

    const handleHeaderClick = (header: { id: number; key: string; label: string; }) => {
        setSort({
            keyToSort: header.key as keyof Usuario,
            direction: header.key === sort.keyToSort ? sort.direction === "asc" ? "desc" : "asc" : "desc"
        })
    }

    function getSortedArray(arrayToSort: Usuario[]): Usuario[] {
        return [...arrayToSort].sort((a, b) => {
            const aValue = a[sort.keyToSort];
            const bValue = b[sort.keyToSort];

            if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
            if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
            return 0;
        });
    }
 
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchData = async() => {
            const data = await getUsers();
            setUsers(data);
            const grs = await getGerencias();
            setGerencias(grs);
            const infoSnap = await helperUsuarios();
            setInfo(infoSnap);
        }

        fetchData();
    })

    const carregarUser = (user: Usuario) => {
        setNovoEditado({
            uid: user.uid,
            email: user.email,
            cpf: user.cpf,
            nomeCompleto: user.nomeCompleto,
            nomeAbreviado: user.nomeAbreviado,
            nivelAcesso: user.nivelAcesso,
            gerenciaPb: user.gerenciaPb,
            matriculaEmthos: user.matriculaEmthos
        });
    }

    const deletar = async (email: string) => {
        const uSnap = users.find(u => u.email === email);
        if (!uSnap) return;
        if (uSnap.email === user?.email) {
            setRes(false);
            setMessage('Você não pode excluir seu próprio perfil');
            setShow(true); 
            return;
        }
        document.body.style.cursor = "wait";
        try {
            if (uSnap.uid !== 'Pendente') {
                console.log(`https://southamerica-east1-viagens-emthos.cloudfunctions.net/deleteUserByUid?uid=${uSnap.uid}`);
                const resp = await fetch(`https://southamerica-east1-viagens-emthos.cloudfunctions.net/deleteUserByUid?uid=${uSnap.uid}`, { method: "DELETE" });
                if(!resp.ok) {
                    const erro = await resp.text();
                    throw new Error(erro);
                }
            }

            await diminuirColaborador(uSnap.gerenciaPb);
            const { res, msg } = await deleteUser(uSnap);
            setRes(res);
            setMessage(msg);
            setShow(true);  
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro: ' + error.message);
            setShow(true);  
        } finally {
            document.body.style.cursor = "default";
        }
    }

    const handleBlur = () => {
        setNovoEditado(prev => ({
            ...prev,
            nomeAbreviado: nomeAbreviado(novoEditado.nomeCompleto)
        }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
        const { name, value } = e.target;
        setNovoEditado(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetClose = () => {
        setNovoEditado({
            uid: 'Pendente',
            email: '',
            cpf: '',
            nomeCompleto: '',
            nomeAbreviado: '',
            nivelAcesso: '',
            gerenciaPb: 'N/A',
            matriculaEmthos: 'N/A'
        });
    }

    const handleSelectChange = (fieldName: keyof Usuario) => (selected: SingleValue<OptionType>) => {
        if (fieldName === 'nivelAcesso') {
            setNovoEditado(prev => ({
                ...prev,
                gerenciaPb: selected?.value === 'COL' ? '' : 'N/A',
                matriculaEmthos: selected?.value === 'COL' ? '' : selected?.value === 'AEM' ? '' : 'N/A',
                [fieldName]: selected?.value || ''
            }));
        } else {
            setNovoEditado(prev => ({
                ...prev,
                [fieldName]: selected?.value || ''
            }));
        }
    };

    const InserirEditar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //checa os campos
        if (novoEditado.nivelAcesso === '' || novoEditado.email === '' || novoEditado.cpf === '') {
            setRes(false);
            setMessage('Preencha todos os campos');
            setShow(true);        
            return;
        }

        try {
            //procura na lista
            const idx = users.findIndex(u => u.email === novoEditado.email);
            if (novoEditado.uid === 'Pendente' && idx === -1) {
                //se chegou no limite não deixa incluir
                const limite = await limiteDeUsers();
                if(limite) {
                    setRes(false);
                    setMessage('Limite de usuários atingido');
                    setShow(true);  
                    return;  
                }

                const { res, msg } = await addUser(novoEditado);
                await incluirColaborador(novoEditado.gerenciaPb);
                handleResetClose();
                setRes(res);
                setMessage(msg);
                setShow(true);    
            } else if (novoEditado.uid === 'Pendente' && idx !== -1) {
                setRes(false);
                setMessage('Usuário já cadastrado no sistema');
                setShow(true);  
                return;  
            } else {
                const { res, msg } = await updateUser(novoEditado);
                handleResetClose();
                setRes(res);
                setMessage(msg);
                setShow(true);    
            }
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao enviar dados! Erro:' + error.message);
            setShow(true);
        }
    }

    if (user && user.nivelAcesso !== 'ADM') {
        return (
            <>
                Sem acesso
            </>
        )
    } else {
        return (
            <div className="container">
                <div className="d-flex gap-2 flex-wrap flex-lg-nowrap">
                    <div className="col-12 col-lg-4">
                        <div className="card">
                        <div className="d-flex">
                            <h5>{novoEditado.uid === 'Pendente' ? <>Novo usuário</> : <>Editar usuário</>}</h5>
                            {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
                        </div>
                        <hr/>
                        <form onSubmit={InserirEditar}>
                            <div className="row">
                                <div className="form-group mb-4 col-12">
                                    <label htmlFor="email">E-mail</label>
                                    <input type="email" id="email" name="email" placeholder="E-mail do usuário" onChange={handleChange} value={novoEditado.email} required/>
                                </div>
                                <div className="form-group mb-4 col-12">
                                    <label htmlFor="cpf">PIX</label>
                                    <input type="text" id="cpf" name="cpf" onChange={handleChange} value={novoEditado.cpf} required />
                                </div>
                                <div className="form-group mb-4 col-12">
                                    <label htmlFor="nomecompleto">Nome completo</label>
                                    <input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Insira o nome sem abreviações" onChange={handleChange} value={novoEditado.nomeCompleto} onBlur={handleBlur} required/>
                                </div><div className="form-group mb-4 col-12">
                                    <label htmlFor="nomeAbreviado">Nome abreviado</label>
                                    <input type="text" id="nomeAbreviado" name="nomeAbreviado" placeholder="Informe o nome de exibição no sistema" onChange={handleChange} value={novoEditado.nomeAbreviado} required/>
                                </div>
                                <div className="mb-4 col-12">
                                    <div className="form-group">
                                        <label htmlFor="nivelAcesso">Nivel de acesso</label>
                                    </div>
                                    <Select
                                        name="nivelAcesso"
                                        value={nivelOptions.find(opt => opt.value === novoEditado.nivelAcesso)  || nivelOptions[0]}
                                        onChange={handleSelectChange("nivelAcesso")}
                                        options={nivelOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                                {novoEditado.gerenciaPb !== 'N/A' && 
                                <div className="mb-4 col-12">
                                    <div className="form-group">
                                        <label htmlFor="nivelAcesso">Gerencia Petrobras</label>
                                    </div>
                                    <Select
                                        name="gerenciaPb"
                                        value={gerenciasOptions.find(opt => opt.value === novoEditado.gerenciaPb)  || gerenciasOptions[0]}
                                        onChange={handleSelectChange("gerenciaPb")}
                                        options={gerenciasOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>}
                                {novoEditado.matriculaEmthos !== 'N/A' && 
                                <div className="form-group mb-4 col-12">
                                    <label htmlFor="matriculaEmthos">Contrato</label>
                                    <input type="text" id="matriculaEmthos" name="matriculaEmthos" placeholder="Insira a matrícula do usuário" onChange={handleChange} value={novoEditado.matriculaEmthos}/>
                                </div>}
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-danger">
                                        <i className="bi bi-floppy-fill me-2"/>
                                        {novoEditado.uid === 'Pendente' && users.findIndex(u => u.email === novoEditado.email) === -1 ? 
                                            <>Cadastrar</> 
                                            : 
                                            <>Salvar</>
                                        }
                                    </button>
                                    <button onClick={handleResetClose} className="btn btn-secondary">
                                        <i className="bi bi-x-square me-2"/>
                                        {novoEditado.uid === 'Pendente' && users.findIndex(u => u.email === novoEditado.email) === -1 ?
                                            <>Limpar</> 
                                            : 
                                            <>Fechar</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </form>
                        </div>
                    </div>
                    <ListBox className="card col-12 col-lg-8">
                        <div className="col-12 col-lg-4">
                            <SearchFilter valor={filter} setValor={setFilter} opcoes={options} selecionado={selected} setSelecionado={setSelected}/>         
                        </div>
                        <div className="card-body table-responsive">
                                <table className="table table-dark table-striped-columns table-hover">
                                    <thead>
                                        <tr>
                                            {headers.map((header, index) => (
                                                <th key={index} onClick={() => handleHeaderClick(header)} >
                                                    <span>{header.label}</span>
                                                    {header.id !== 5 && header.key === sort.keyToSort &&
                                                    <span><Caret direction={sort.keyToSort === header.key ? sort.direction : "asc"} /></span>
                                                    }
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                <tbody>
                                    {getSortedArray(users).filter((item) => {
                                        if(selected === options[0]){
                                            return filter.toLowerCase() === '' ? item : item.email.toLowerCase().includes(filter);
                                        } else if (selected === options[1]){
                                            return filter.toLowerCase() === '' ? item : item.nomeAbreviado.toLowerCase().includes(filter);
                                        } else if (selected === options[2]) {
                                            return filter.toLowerCase() === '' ? item : item.gerenciaPb.toLowerCase().includes(filter);
                                        } else {
                                            return filter.toLowerCase() === '' ? item : item.nivelAcesso.toLowerCase().includes(filter);
                                        } 
                                    }).map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.email}</td>
                                            <td>{row.nomeAbreviado}</td>
                                            <td>{row.gerenciaPb}</td>
                                            <td>{row.nivelAcesso}</td>
                                            <td>
                                                <div className="d-flex">
                                                    <button className="btn btn-primary" onClick={() => carregarUser(row)}><i className="bi bi-pencil"/></button>
                                                <button className="btn btn-danger" onClick={() => deletar(row.email)}><i className="bi bi-trash3"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ListBox>
                </div>
                <Modal show={show} onHide={() => setShow(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>{res ? 'Sucesso' : 'Erro'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default Users;