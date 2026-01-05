import { useEffect, useState, useRef, FormEvent } from "react";
import Select, { SingleValue } from 'react-select';
import ViagemContainer from "../../../components/viagemContainer";
import { Modal, Spinner } from "react-bootstrap";
import Viagem from "../../../types/Viagem";
import { parse, differenceInDays, format, isAfter, addDays } from "date-fns";
import { customSelectStyles } from "../../new/styles";
import { getViagem, updateViagem } from "../../../controller/Viagem";
import { useParams } from "react-router-dom";
import CalendarRange from "../../../components/calendario";
import StatusBadge from "../../../components/statusBadge";
import { useUserContext } from "../../../context/UserContext";
import hoteisData from '../../../util/hoteis.json';
import { CitySelect } from "../../new";
import { Alert } from "react-bootstrap";
import { NotificaPreposto, NotificarCancelada, NotificarCancelamento } from "../../../controller/Mail";
import StatusLogViewer from "../../../components/statusLogViewer";
import Helper, { HelperProps } from "../../../components/helper";
import { helperBaseViagem } from "../../../controller/Helper";

type OptionType = { value: string; label: string };

const getCurrentDateTime = (): string => {
    const currentDate = new Date();

    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mês começa do zero, por isso é necessário adicionar 1
    const year = currentDate.getFullYear().toString();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const ViagemBase = () => {
    const { id } = useParams<{id: string}>();
    const { user } = useUserContext();
    const [show, setShow] = useState(false);
    const [jusCancelamento, setJusCancelamento] = useState('');
    const [toggle, setToggle] = useState(false);
    const [res, setRes] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [prevStatus, setPrevStatus] = useState<string | null>(null);
    const [alertMsg, setAlertMsg] = useState('');
    const [info, setInfo] = useState<HelperProps>();
    const [edited, setEdited] = useState<Viagem>({
        id: 0,
        status: '',
        origem: '',
        destino: '',
        colaborador: '',
        dataIda: '',
        dataVolta: '',
        duracao: 0,
        gerencia: '',
        contrato: '',
        hotel: '',
        voo: false,
        obsColaborador: '',
        macroProcesso: '',
        telContato: '',
        dataSolicitacao: '',
        justificativa: ''
    });
    const hasFetchedData = useRef(false);
    const vooOptions = [
        { value: 'false', label: 'Não' },
        { value: 'true', label: 'Sim' }
    ]
    const hotelOptions = [
        { value: '', label: 'Selecione...' },
        ...hoteisData.hoteis.map((i) => ({ value: i.value, label: i.value }))
    ];
    const macroOptions = [
        { value: '', label: 'Selecione...' },
        { value: 'Ferramentas e Sistemas', label: 'Ferramentas e Sistemas' },
        { value: 'Fiscalização', label: 'Fiscalização' },
        { value: 'Materiais', label: 'Materiais' },
        { value: 'Planejamento', label: 'Planejamento' },
        { value: 'Suporte Técnico', label: 'Suporte Técnico' },
        { value: 'Evento', label: 'Evento' },
        { value: 'Gerenciamento', label: 'Gerenciamento' },
        { value: 'Outro', label: 'Outro'}
    ];
    const statusOptions = [
        { value: 'Solicitada', label: 'Solicitada'},
        { value: 'Aprovada', label: 'Aprovada'},
        { value: 'Reprovada', label: 'Reprovada'},
        { value: 'Triagem', label: 'Triagem'},
        { value: 'Programada', label: 'Programada'},
        { value: 'Adiantamento enviado', label: 'Adiantamento enviado'},
        { value: 'Valor Adiantado', label: 'Valor Adiantado'},
        { value: 'Pendente prestação de contas', label: 'Pendente prestação de contas'},
        { value: 'Prestação de contas enviada', label: 'Prestação de contas enviada' },
        { value: 'Sem pendências', label: 'Sem pendências'},
        { value: 'Com pendências', label: 'Com pendências'},
        { value: 'Pendente financeiro', label: 'Pendente financeiro'},
        { value: 'Desconto programado', label: 'Desconto programado'},
        { value: 'Reembolso programado', label: 'Reembolso programado'},
        { value: 'Concluída', label: 'Concluída'},
        { value: 'Cancelar', label: 'Cancelar'},
        { value: 'Cancelada', label: 'Cancelada'}
    ]

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchData = async () => {
            if (id) {
                const res = await getViagem(id);
                if (res) {
                    const ida = format(parse(res.dataIda, "dd/MM/yyyy", new Date()), "yyyy-MM-dd");
                    const volta = format(parse(res.dataVolta, "dd/MM/yyyy", new Date()), "yyyy-MM-dd");
                    setEdited({...res, dataIda: ida, dataVolta: volta});
                    setPrevStatus(res.status);
                    console.log(edited);
                }
            }
            const snapinfo = await helperBaseViagem();
            setInfo(snapinfo);
        }

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
        const { name, value } = e.target;

        setEdited(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setEdited(prev => {
            const updated = {
                ...prev,
                [name]: value
            };
            const { dataIda, dataVolta } = updated;
            if (dataIda && dataVolta) {
                const parsedIda = parse(dataIda, 'yyyy-MM-dd', new Date());
                const parsedVolta = parse(dataVolta, 'yyyy-MM-dd', new Date());
                const duracao = differenceInDays(parsedVolta, parsedIda);
                return {
                    ...updated,
                    duracao: duracao > 0 ? duracao : 0
                };
            }
            return updated;
        });
    };
    
    const handleSelectChange = (fieldName: keyof Viagem) => (selected: SingleValue<OptionType>) => {
        setEdited(prev => ({
            ...prev,
            [fieldName]: selected?.value || ''
        }));
    };

    const alterar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            document.body.style.cursor = "wait";
            const { res, msg } = await updateViagem({ 
                ...edited,
                dataIda: format(parse(edited.dataIda, "yyyy-MM-dd", new Date()), "dd/MM/yyyy"),
                dataVolta: format(parse(edited.dataVolta, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
            });
            if(res) {
                if(prevStatus !== edited.status) {
                    if (edited.status === 'Cancelada') {
                        await NotificarCancelada(edited);
                    }
                }
            }
            setRes(res);
            setAlertMsg(msg);
            setShow(true);
            document.body.style.cursor = "default";
        } catch (error: any) {
            setRes(false);
            setAlertMsg(error.message);
            setShow(true);
            document.body.style.cursor = "default";
        }
    }

    const handleCancelamento = async () => {
        if (jusCancelamento === '' || jusCancelamento.length < 5) {
            setAlertType('warning');
            setAlertMsg('Insira uma justificativa');
            return;
        }

        try {
            await NotificarCancelamento(edited);
            await NotificaPreposto({...edited, status: 'Cancelar'});
            setAlertType('success');
            setAlertMsg('Solicitação de cancelamento enviada');
        } catch (error: any) {
            setAlertType('warning');
            setAlertMsg('Erro ao solicitar cancelamento: '+error.message);
        }
    }

    if (edited.id !== 0) {
        return (
            <ViagemContainer>
                <div  className="mt-2 d-flex justify-content-between">
                    <div className="d-flex">
                        <h4>Viagem de ID {edited.id}</h4>
                        <h4 className="ms-2"><StatusLogViewer idViagem={edited.id.toString()}><StatusBadge status={edited.status} /></StatusLogViewer></h4>
                    </div>
                    {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
                </div>
                <form onSubmit={alterar}>
                    <div className="row mt-4">
                        <div className="col-12 col-lg-6">
                            <div className="row">
                                {user?.nivelAcesso === 'COL' ? 
                                    <div className="form-group mb-4 col-8 col-sm-8">
                                        <label htmlFor="origem">Origem</label>
                                        <input type="text" id="origem" name="origem" placeholder="Cidade e estado de partida" value={edited.origem} required/>
                                    </div>
                                :
                                    <div className="mb-4 col-8 col-sm-8">
                                        <div className="form-group">
                                            <label htmlFor="origem">Origem</label>
                                        </div>
                                        <CitySelect
                                            value={
                                                edited.origem
                                                ? { value: edited.origem, label: edited.origem }
                                                : null
                                            }
                                            onChange={(opt) => setEdited(prev => ({ ...prev, origem: opt.value }))}
                                        />
                                    </div>
                                }
                                {user?.nivelAcesso !== 'ADM' ? 
                                <div className="form-group mb-4 col-4 col-sm-4">
                                    <label htmlFor="dataIda">Ida</label>
                                    <input type="date" id="dataIda" name="dataIda" value={edited.dataIda} required />
                                </div>
                                    :
                                <div className="form-group mb-4 col-4 col-sm-4">
                                    <label htmlFor="dataIda">Ida</label>
                                    <input type="date" id="dataIda" name="dataIda" onChange={handleDataChange} value={edited.dataIda} required />
                                </div> 
                                }
                            </div>
                            <div className="row">
                                {user?.nivelAcesso === 'COL' ? 
                                    <div className="form-group mb-4 col-8 col-sm-8">
                                        <label htmlFor="destino">Destino</label>
                                        <input type="text" id="destino" name="destino" placeholder="Cidade e estado de destino" value={edited.destino} required/>
                                    </div>
                                :
                                    <div className="mb-4 col-8 col-sm-8">
                                        <div className="form-group">
                                            <label htmlFor="destino">Destino</label>
                                        </div>
                                        <CitySelect
                                            value={
                                                edited.destino
                                                ? { value: edited.destino, label: edited.destino }
                                                : null
                                            }
                                            onChange={(opt) => setEdited(prev => ({ ...prev, destino: opt.value }))}
                                        />
                                    </div>
                                }
                                {user?.nivelAcesso !== "ADM" ?
                                    <div className="form-group mb-4 col-4 col-sm-4">
                                        <label htmlFor="origem">Retorno</label>
                                        <input type="date" id="dataVolta" name="dataVolta" value={edited.dataVolta} required />
                                    </div>
                                :
                                    <div className="form-group mb-4 col-4 col-sm-4">
                                        <label htmlFor="origem">Retorno</label>
                                        <input type="date" id="dataVolta" name="dataVolta" onChange={handleDataChange} value={edited.dataVolta} required />
                                    </div>
                                }
                            </div>
                            <div className="row">
                                <div className="mb-4 col-6">
                                    <div className="form-group">
                                        <label htmlFor="hotel">Hotel</label>
                                    </div>
                                    <Select
                                        name="hotel"
                                        value={hotelOptions.find(opt => opt.value === edited.hotel)  || hotelOptions[0]}
                                        onChange={handleSelectChange("hotel")}
                                        options={hotelOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                                <div className="mb-4 col-6">
                                    <div className="form-group">
                                        <label htmlFor="hotel">Macroprocesso</label>
                                    </div>
                                    <Select
                                        name="macroProcesso"
                                        value={macroOptions.find(opt => opt.value === edited.macroProcesso)  || macroOptions[0]}
                                        onChange={handleSelectChange("macroProcesso")}
                                        options={macroOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group mb-4 col-8 col-sm-5">
                                    <label htmlFor="contrato">Contrato</label>
                                    <input type="text" id="contrato" required onChange={handleChange} name="contrato" value={edited.contrato} />
                                </div>
                                <div className="form-group mb-4 col-8 col-sm-4">
                                    <label htmlFor="origem">Centro de custo</label>
                                    <input type="text" id="origem" required onChange={handleChange} name="centroCusto" value={edited.centroCusto}/>
                                </div>
                                <div className="mb-4 col-4 col-sm-3">
                                    <div className="form-group">
                                        <label htmlFor="hotel">Haverá voo?</label>
                                    </div>
                                    <Select
                                        name="voo"
                                        value={vooOptions.find(opt => opt.value === edited.voo.toString())  || vooOptions[0]}
                                        onChange={handleSelectChange("voo")}
                                        options={vooOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                            </div>
                            {user?.nivelAcesso !== 'COL' && 
                            <div className="row">
                                <div className="form-group mb-4 col-12 col-md-6 col-xxl-4">
                                    <label htmlFor="colaborador">Colaborador</label>
                                    <input type="text" id="colaborador" required name="colaborador" value={edited.colaborador} />
                                </div>
                                <div className="form-group mb-4 col-12 col-md-6 col-xxl-3">
                                    <label htmlFor="gerencia">Gerência</label>
                                    <input type="text" id="gerencia" required name="gerencia" value={edited.gerencia} />
                                </div>
                                <div className="form-group mb-4 col-6 col-md-3 col-xxl-2">
                                    <label htmlFor="duracao">Duração</label>
                                    <input type="text" id="duracao" name="duracao" value={`${edited.duracao} dias`} />
                                </div>
                                <div className="form-group mb-4 col-6 col-md-3 col-xxl-3">
                                    <label htmlFor="dataSolicitacao">Solicitada em</label>
                                    <input type="text" id="dataSolicitacao" name="dataSolicitacao" value={edited.dataSolicitacao} />
                                </div>
                            </div>
                            }
                            <div className="row">
                                <div className="form-group mb-4 col-12">
                                    <label htmlFor="justificativa">Justificativa</label>
                                    <textarea rows={2} id="justificativa" placeholder="Justificativa para a viagem..." onChange={handleChange} value={edited.justificativa} name="justificativa"/>
                                </div>
                            </div>
                            {edited?.anexoAprovacao && 
                                <a className="btn btn-outline-secondary mb-4 col-12 col-md-6 col-lg-4 d-flex" href={edited.anexoAprovacao} target="_blank">
                                    <label>Evidência aprovação</label>
                                    <i className="bi bi-cloud-check-fill ms-2"/>
                                </a>
                            }
                        </div>
                        <div className="col-12 col-lg-6">
                            <div className="row">
                                <div className="form-group mb-4">
                                    <label htmlFor="observacao">Observação</label>
                                    <textarea rows={3} id="observacao" placeholder="Descreva quaisquer particularidades em relação a programação da viagem..." onChange={handleChange} value={edited.obsColaborador} name="obsColaborador"/>
                                </div>
                            </div>
                            {user?.nivelAcesso !== 'COL' &&
                            <div className="row">
                                <div className="form-group mb-4">
                                    <label htmlFor="obsProgramador">Observação agente de viagens</label>
                                    <textarea rows={3} id="obsProgramador" placeholder="Observação do agente de viagens (não exibido para o usuário)..." onChange={handleChange} value={edited.obsProgramador} name="obsProgramador"/>
                                </div>
                            </div>
                            }
                            <div className="row">
                                <CalendarRange startDate={format(parse(edited.dataIda, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")} endDate={format(parse(edited.dataVolta, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")} />
                            </div>
                        </div>
                        <div className="col-4 d-flex">
                            {(user?.nivelAcesso !== 'COL' || (edited.status === 'Aprovada' || edited.status === 'Solicitada')) && 
                            <button className="btn btn-danger me-3" type="submit">Alterar <i className="bi bi-pencil-fill ms-1" /></button>
                            }
                            {user?.nivelAcesso !== 'COL' &&
                                <Select
                                    name="status"
                                    menuPlacement="top"
                                    value={statusOptions.find(opt => opt.value === edited.status)  || statusOptions[0]}
                                    onChange={handleSelectChange("status")}
                                    options={statusOptions}
                                    styles={customSelectStyles()}
                                    noOptionsMessage={() => "Não encontrado"}
                                />
                            }
                        </div>
                        
                        {user?.nivelAcesso !== 'COL' && edited.nroRelatorio &&
                        <small className="mt-2">Incluída no relatório Nº {edited.nroRelatorio}</small>
                        }
                    </div>
                </form>
                {user?.nivelAcesso === 'COL' && (isAfter(parse(edited.dataIda, 'dd/MM/yyyy', new Date()), addDays(new Date(), 15))) && (edited.status === 'Solicitada' || edited.status === 'Aprovada' || edited.status === 'Programada' || edited.status === 'Triagem') &&
                    <button className="btn btn-danger me-3 mt-3" type="button" onClick={() => {setToggle(true);setShow(true)}}>Solicitar cancelamento <i className="bi bi-x ms-1" /></button>
                }
                <Modal show={show} onHide={() => setShow(false)}>
                    {toggle ?
                    <>
                    <Modal.Header closeButton>
                        <h5>Justificar cancelamento</h5>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="form-group mb-4">
                                <textarea rows={3} id="justificativaCancelamento" placeholder="Explique o motivo para o cancelamento da viagem..." onChange={(e) => setJusCancelamento(e.target.value)} value={jusCancelamento} name="justificativaCancelamento"/>
                            </div>
                        </div>
                        {alertMsg !== '' &&
                        <Alert dismissible variant={alertType}>{alertMsg}</Alert>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => handleCancelamento()}>Cancelar</button>
                    </Modal.Footer>
                    </> 
                    :
                    <>
                    <Modal.Header closeButton>
                        <h5>{res ? 'Sucesso' : 'Erro'}</h5>
                    </Modal.Header>
                    <Modal.Body>
                        {alertMsg}
                    </Modal.Body>
                    </> 
                    }
                </Modal>
            </ViagemContainer>
        )
    } else {
        return (
            <ViagemContainer>
                <div className="d-flex justify-content-center mt-4">
                    <Spinner/>
                </div>
            </ViagemContainer>
        )
    }
}

export default ViagemBase;