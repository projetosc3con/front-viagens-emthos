import { Container, customSelectStyles } from "./styles";
import Select, { SingleValue, components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { StylesConfig } from 'react-select';
import { useNavigate } from "react-router-dom";
import { FormEvent, useEffect, useRef, useState } from "react";
import { addViagem, getNextId } from "../../controller/Viagem";
import Viagem, { processarCadastro, verificaConformidade } from "../../types/Viagem";
import { parse, differenceInDays, format, differenceInCalendarDays, parseISO } from "date-fns";
import { Alert, Modal } from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";
import CalendarRange from "../../components/calendario";
import { NotificaPreposto, NotificarPreAprovada, NotificarSolicitacao, SendEmail } from "../../controller/Mail";
import Usuario from "../../types/Usuario";
import { getUsers } from "../../controller/Usuario";
import hoteisData from '../../util/hoteis.json';
import cidadesData from '../../util/estados-cidades.json';
import Helper, { HelperProps } from "../../components/helper";
import { helperSolicitarViagem } from "../../controller/Helper";
import { getGerencia } from "../../controller/Gerencia";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../util/FirebaseConnection";
import Gerencia from "../../types/Gerencia";

export type OptionType = { value: string; label: string };

export function CitySelect({ onChange, value }: {
  onChange: (opt: OptionType) => void;
  value: OptionType | null;
}) {
  return (
    <AsyncSelect<OptionType>
      cacheOptions
      defaultOptions
      loadOptions={loadCityOptions}
      onChange={opt => onChange(opt!)}
      value={value}
      placeholder="Selecione a cidade..."
      styles={customSelectStyles()}
      noOptionsMessage={() => "Não encontrado"}
      loadingMessage={() => "Carregando..."}
    />
  );
}

const loadCityOptions = (inputValue: string, callback: (options: OptionType[]) => void) => {
  // Debounce manual de 300ms
  clearTimeout((loadCityOptions as any)._timer);
  (loadCityOptions as any)._timer = setTimeout(() => {
    const filtered = cidadesData.cities
      .filter(c =>
        c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        c.state.toLowerCase().includes(inputValue.toLowerCase())
      )
      // Limita a 50 resultados pra não sobrecarregar
      .slice(0, 50)
      .map(c => ({
        value: `${c.name} - ${c.state}`,
        label: `${c.name} - ${c.state}`,
      }));

    callback(filtered);
  }, 300);
};

export const getCurrentDateTime = (): string => {
    const currentDate = new Date();

    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mês começa do zero, por isso é necessário adicionar 1
    const year = currentDate.getFullYear().toString();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const New = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [res, setRes] = useState(false);
    const { user } = useUserContext();
    const [message, setMessage] = useState('');
    const [colaboradores, setColaboradores] = useState<Usuario []>([]);
    const [info, setInfo] = useState<HelperProps>();
    const [idNova, setIdNova] = useState(0);
    const hasFetchedData = useRef(false);
    const [anexo, setAnexo] = useState<string | null>(null);
    const [toogle, setToggle] = useState(false);
    const [lockButtons, setLockButtons] = useState(false);
    const [preApr, setPreapr] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [nova, setNova] = useState<Viagem>({
        id: 0,
        status: 'Solicitada',
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
        anexoAprovacao: '',
        dataSolicitacao: '',
        justificativa: ''
    });

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
    const colOptions = [
        { value: '', label: 'Selecione...'},
        ...colaboradores.filter(col => col.nivelAcesso === 'COL').map((col) => ({ value: col.email, label: col.nomeAbreviado }))
    ];
 
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchData = async () => {
            if (user?.nivelAcesso !== 'COL') {
                //se não for colaborador requisitante busca a lista de usuarios
                const snap = await getUsers();
                if (user?.nivelAcesso === 'ADM') {
                    setColaboradores(snap);
                } else {
                    const filtered = snap.filter((u) => u.contrato === user?.contrato);
                    setColaboradores(filtered);
                }
            } else {
                const input = document.getElementById('contrato') as HTMLInputElement | null;
                if (input && user.contrato) {
                    input.value = user.contrato;
                    setNova({...nova, contrato: user.contrato });
                }
            }
            const infoSnap = await helperSolicitarViagem();
            setInfo(infoSnap);
        }

        fetchData();
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf", "text/plain"];
            if (validTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                setAnexo(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                alert("Por favor, selecione um arquivo válido.");
            }
        } else {
            setAnexo(null);
        }
    };

    const toggleLockBtn = async () => {
        setLockButtons(!lockButtons);
    }

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        let gerencia: Gerencia | null;

        try {
            //bloqueios encapsulados de acordo com contrato
            await verificaConformidade(nova, user);

            //se for colaborador cadastrando
            if(user.nivelAcesso === 'COL') {
                gerencia = await getGerencia(user.gerenciaPb);
            } else {
                const userRef = colaboradores.find(c => c.email === nova.colaborador)
                if (!userRef) return;
                gerencia = await getGerencia(userRef.gerenciaPb);
            }
            //Se for fluxo completo nao exibe a sub etapa e cadastra, se não for, exibe e aguarda a finalização
            if (gerencia && gerencia.fluxoCompleto) {
                const { res, msg } = await processarCadastro(nova, user, toggleLockBtn, preApr, anexo, colaboradores);
                setRes(res);
                setMessage(msg);
                setToggle(false);
                setShow(true);
            } else {
                setToggle(true);
                setShow(true);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Erro ao cadastrar viagem');
            setRes(false);
            setShow(true);
        }
    };

    const handleDialogSubmit = async () => {
        //se tiver pre aprovação e nenhum anexo, retorna
        if (preApr && !anexo) {
            setRes(false);
            setMessage('Anexe um arquivo de comprovação');
            setShowAlert(true);
            return;
        }

        try {
            const { res, msg } = await processarCadastro(nova, user, toggleLockBtn, preApr, anexo, colaboradores);
            setRes(res);
            setMessage(msg);
            setToggle(false);
            setShow(true);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Erro ao cadastrar viagem');
            setShow(true);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
        const { name, value } = e.target;

        setNova(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        try {
            setNova(prev => {
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
        } catch (error: any) {
            console.log(error);
            return;
        }
    };

    const handleSelectChange = (fieldName: keyof Viagem) => (selected: SingleValue<OptionType>) => {
        setNova(prev => ({
            ...prev,
            [fieldName]: selected?.value || ''
        }));
    };

    return (
        <Container className="card">
            <div className="d-flex">
                <h4>Solicitar nova viagem</h4>
                {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
            </div>
            <hr/>
            <div className="card-body">
                <form onSubmit={handleFormSubmit}>
                    <div className="row">
                        <div className="col-12 col-lg-6">
                            <div className="row">
                                <div className="mb-4 col-8 col-sm-8">
                                    <div className="form-group">
                                        <label htmlFor="origem">Origem</label>
                                    </div>
                                    <CitySelect
                                        value={
                                            nova.origem
                                            ? { value: nova.origem, label: nova.origem }
                                            : null
                                        }
                                        onChange={(opt) => setNova(prev => ({ ...prev, origem: opt.value }))}
                                    />
                                </div>
                                <div className="form-group mb-4 col-4 col-sm-4">
                                    <label htmlFor="dataIda">Ida</label>
                                    <input type="date" id="dataIda" name="dataIda" onChange={handleDataChange} value={nova.dataIda} required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="mb-4 col-8 col-sm-8">
                                    <div className="form-group">
                                        <label htmlFor="destino">Destino</label>
                                    </div>
                                    <CitySelect
                                        value={
                                            nova.destino
                                            ? { value: nova.destino, label: nova.destino }
                                            : null
                                        }
                                        onChange={(opt) => setNova(prev => ({ ...prev, destino: opt.value }))}
                                    />
                                </div>
                                <div className="form-group mb-4 col-4 col-sm-4">
                                    <label htmlFor="origem">Retorno</label>
                                    <input type="date" id="dataVolta" name="dataVolta" onChange={handleDataChange} value={nova.dataVolta} required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="mb-4 col-6">
                                    <div className="form-group">
                                        <label htmlFor="hotel">Hotel</label>
                                    </div>
                                    <Select
                                        name="hotel"
                                        value={hotelOptions.find(opt => opt.value === nova.hotel)  || hotelOptions[0]}
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
                                        value={macroOptions.find(opt => opt.value === nova.macroProcesso)  || macroOptions[0]}
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
                                    <input type="text" id="contrato" required onChange={handleChange} name="contrato" value={nova.contrato} disabled={user?.nivelAcesso === 'COL'}/>
                                </div>
                                <div className="form-group mb-4 col-8 col-sm-4">
                                    <label htmlFor="origem">Centro de custo</label>
                                    <input type="text" id="origem" required onChange={handleChange} name="centroCusto" value={nova.centroCusto}/>
                                </div>
                                <div className="mb-4 col-4 col-sm-3">
                                    <div className="form-group">
                                        <label htmlFor="hotel">Haverá voo?</label>
                                    </div>
                                    <Select
                                        name="voo"
                                        value={vooOptions.find(opt => opt.value === nova.voo.toString())  || vooOptions[0]}
                                        onChange={handleSelectChange("voo")}
                                        options={vooOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-6">
                            <div className="row">
                                <div className="form-group mb-4">
                                    <label htmlFor="observacao">Observação</label>
                                    <textarea rows={3} id="observacao" placeholder="Descreva quaisquer particularidades em relação a programação da viagem..." onChange={handleChange} value={nova.obsColaborador} name="obsColaborador"/>
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="justificativa">Justificativa</label>
                                    <textarea rows={2} id="justificativa" placeholder="Motivo da viagem" onChange={handleChange} value={nova.justificativa} name="justificativa" required/>
                                </div>
                                {user?.nivelAcesso !== 'COL' && 
                                <div className="mb-4">
                                    <div className="form-group">
                                        <label htmlFor="colaborador">Colaborador</label>
                                    </div>
                                    <Select
                                        name="colaborador"
                                        value={colOptions.find(opt => opt.value === nova.colaborador)  || colOptions[0]}
                                        onChange={handleSelectChange("colaborador")}
                                        options={colOptions}
                                        styles={customSelectStyles()}
                                        noOptionsMessage={() => "Não encontrado"}
                                    />
                                </div>
                                }
                            </div>
                            <div className="row mb-2">
                                {nova.duracao > 0 && 
                                    <CalendarRange startDate={format(parse(nova.dataIda, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")} endDate={format(parse(nova.dataVolta, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")} />
                                }
                            </div>
                        </div>
                        <div className="col-4 mt-2">
                            <button className="btn btn-danger" type="submit">Enviar <i className="bi bi-send-fill ms-1" /></button>
                        </div>
                    </div>
                </form>
            </div>

            <Modal show={show} onHide={() => setShow(false)} >
                { toogle ? 
                <>
                    <Modal.Header closeButton>
                        <Modal.Title>Aprovação da gerência</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <div className="form-group">
                                <label htmlFor="aprovacao">Viagem pré aprovada pela gerência?</label>
                            </div>
                            <div className="mb-4 col-4 col-sm-3">
                                <Select
                                    name="aprovacao"
                                    value={vooOptions.find(opt => opt.value === preApr.toString())  || vooOptions[0]}
                                    onChange={(s) => setPreapr(s?.value === 'true' ? true : false)}
                                    options={vooOptions}
                                    styles={customSelectStyles()}
                                    noOptionsMessage={() => "Não encontrado"}
                                />
                            </div>
                            {preApr && 
                            <div className="form-group col-8 mb-4">
                                <label htmlFor="image">Comprovação</label>
                                <input className="form-control" type="file" id="anexo" accept=".png, .jpg, .jpeg, .pdf, .msg, .eml" onChange={handleFileChange} />
                            </div>
                            }
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="col-12">
                            {showAlert && <Alert className="mt-2" variant={res ? 'success' : 'danger'} onClose={() => setShowAlert(false)} dismissible>{message}</Alert>}
                            <button className="btn btn-danger" onClick={() => handleDialogSubmit()} disabled={lockButtons}>Enviar</button>
                        </div>
                    </Modal.Footer>
                </>
                :
                <>
                    <Modal.Header closeButton>
                        <Modal.Title>{res ? 'Cadastrada com sucesso' : 'Erro ao cadastrar'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                    </Modal.Body>
                    {res && 
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => navigate(`/viagens/${idNova}/adiantamento`)}>Solicitar adiantamento</button>
                    </Modal.Footer>
                    }
                </>
                }
            </Modal>
        </Container>
    )
}

export default New;