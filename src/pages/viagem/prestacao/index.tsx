import { useParams } from "react-router-dom";
import ViagemContainer from "../../../components/viagemContainer";
import { FormEvent, useEffect, useRef, useState } from "react";
import Viagem from "../../../types/Viagem";
import PrestacaoContas, { Nota } from "../../../types/PrestacaoContas";
import { getViagem } from "../../../controller/Viagem";
import { Spinner } from "react-bootstrap";
import CalendarRange from "../../../components/calendario";
import Select, { SingleValue } from 'react-select';
import { customSelectStyles } from "../../new/styles";
import { getContas } from "../../../controller/PrestacaoContas";
import { getAdiantamento } from "../../../controller/Adiantamento";
import { Modal } from "react-bootstrap";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { prestacoesDeContas, storage, viagens } from "../../../util/FirebaseConnection";
import { addDoc, doc, updateDoc } from "firebase/firestore";
import { parse, formatDate, isBefore, differenceInBusinessDays } from 'date-fns';
import StatusBadge from "../../../components/statusBadge";
import { NotificaPendentePrestacao, NotificaPreposto, NotificarFinanceiroPrestacao } from "../../../controller/Mail";
import Helper, { HelperProps } from "../../../components/helper";
import { helperPrestacao } from "../../../controller/Helper";
import { useUserContext } from "../../../context/UserContext";

type OptionType = { value: string; label: string };

function noPrazo(dateString: string): boolean {
  const date = parse(dateString, 'dd/MM/yyyy', new Date());
  const diff = differenceInBusinessDays(date, new Date());
  return diff <= 2;
}

const ViagemPrestacao = () => {
    const hasFetchedData = useRef(false);
    const { id } = useParams<{id: string}>();
    const { user } = useUserContext();
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [viagem, setViagem] = useState<Viagem | null>();
    const [contas, setContas] = useState<PrestacaoContas | null>();
    const [info, setInfo] = useState<HelperProps>();
    const [tipoConta, setTipoConta] = useState('');
    const [refVlrDif, setRefDif] = useState(0);
    const [valor, setValor] = useState(0);
    const [anexo, setAnexo] = useState<string | null>(null);
    const [notas, setNotas] = useState<Nota[]>([]);
    const [obsGlosa, setObsGlosa] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [daySelected, setDaySelected] = useState('');
    const [toggleCopy, setToggleCopy] = useState(false);
    const [tipo, setTipo] = useState([
        { value: '', label: 'Selecione...' },
        { value: 'alimentação', label: 'Alimentação' },
        { value: 'transporte', label: 'Transporte' },
        { value: 'outros', label: 'Outros' }
    ]);

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchData = async () => {
            if (!id) return;

            const viagemRes = await getViagem(id);
            if (!viagemRes) return;
            setViagem(viagemRes);

            if (viagemRes.contrato === '4600679817'){
                setTipo([
                    { value: '', label: 'Selecione...' },
                    { value: 'alimentação', label: 'Alimentação' },
                    { value: 'transporte', label: 'Transporte' },
                    { value: 'transporte corporativo', label: 'Transporte Corporativo' },
                    { value: 'outros', label: 'Outros' }
                ])
            }

            const resconta = await getContas(id);
            const resadiant = await getAdiantamento(id);

            if (resconta) {
                setContas(resconta);
                setRefDif(resconta.valorDiferenca);
                if(resconta.notas) {
                    setNotas(resconta.notas);
                }
            } else {
                setContas({
                    idDoc: '',
                    idViagem: id,
                    status: 'Pendente no prazo',
                    valorTotal: 0,
                    valorAdiantamento: resadiant?.totalAdiantamento ?? 0,
                    valorDiferenca: 0,
                    notas: notas
                });
            }
            const snapinfo = await helperPrestacao();
            setInfo(snapinfo);
        };

        fetchData();
    }, []);

    const handleSelectedDay = (date: string) => {
        setDaySelected(date);
    }

    const handleSelectChange = (selected: SingleValue<OptionType>) => {
        setTipoConta(selected?.value || '');
    };

    const handleRemoveImage = () => {
        setImage(null); // Reseta o estado da imagem
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (validTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = () => {
            setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG ou JPEG).");
        }
        }
    };

    const comprovanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const atualizarPrestacao = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        document.body.style.cursor = "wait";
        let url = '';
        if (image) {
            try {
                if (image.includes('https://')) {
                    url = image;
                } else {
                    const parsedDate = formatDate(parse(daySelected, "dd/MM/yyyy", new Date()), 'dd-MM-yyyy');
                    const imageRef = ref(storage, `viagens/${viagem?.id}/prestacao-de-contas/${parsedDate}/${tipoConta}`);
                    const response = await fetch(image);
                    const blob = await response.blob();
                    await uploadBytes(imageRef, blob);
                    url = await getDownloadURL(imageRef);
                }
            } catch (err) {
            setMessage('Erro ao enviar imagem. Verifique sua conexão.');
            setShow(true);
            document.body.style.cursor = "default";
            return;
            }
        } else {
            setRes(false);
            setMessage('Insira um arquivo de comprovação dos gastos');
            setShow(true);
            document.body.style.cursor = "default";
            return;
        }

        const countSameDate = notas.filter(n => n.diaViagem === daySelected).length;
        //const idx = notas.findIndex(n => n.diaViagem === daySelected && n.tipo === tipoConta);

        if(countSameDate >=3) {
            setRes(false);
            setMessage('Só é possível cadastrar 3 notas no mesmo dia');
            setShow(true);
            document.body.style.cursor = "default";
            return;
        }
        
        await upsertNota({
            tipo: tipoConta,
            diaViagem: daySelected,
            urlImagem: url,
            valor: valor
        });
    }

    const salvarPrestacao = async () => {
        let url: string = "";
        try {
            if (viagem && contas && contas.idDoc !== '') {
                if(contas.valorDiferenca > 0 && anexo){
                    const fileRef = ref(storage, `viagens/${viagem.id}/comprovante-devolucao`);
                    
                    const response = await fetch(anexo);
                    const blob = await response.blob(); 
                    await uploadBytes(fileRef, blob);
                    url = await getDownloadURL(fileRef);
                    setContas({...contas, urlReciboPix: url });
                }

                const docRef = doc(prestacoesDeContas, contas.idDoc);
                await updateDoc(docRef, {
                    ...contas,
                    urlReciboPix: url,
                    status: noPrazo(viagem.dataVolta) ? 'Enviada no prazo' : 'Enviada em atraso'
                });
                setContas({
                    ...contas,
                    status: noPrazo(viagem.dataVolta) ? 'Enviada no prazo' : 'Enviada em atraso'
                });

                await NotificaPreposto({ ...viagem, status: contas.valorDiferenca !== 0 ? 'Prestação de contas enviada' : 'Sem pendências' });

                await updateDoc(doc(viagens, viagem.id.toString()), { status: contas.valorDiferenca !== 0 ? 'Prestação de contas enviada' : 'Sem pendências' })

                setDaySelected('');
                setTipoConta('');
                setValor(0);
                setRes(true);
                handleRemoveImage();
                setMessage(`Prestação de contas salva!`);
                setShow(true);
            } else if (contas && viagem) {
                if(contas.valorDiferenca > 0 && anexo){
                    const fileRef = ref(storage, `viagens/${viagem.id}/comprovante-devolucao`);
                    
                    const response = await fetch(anexo);
                    const blob = await response.blob(); 
                    await uploadBytes(fileRef, blob);
                    url = await getDownloadURL(fileRef);
                    setContas({...contas, urlReciboPix: url });
                }

                const docRef = await addDoc(prestacoesDeContas, {
                    ...contas,
                    urlReciboPix: url,
                    status: noPrazo(viagem.dataVolta) ? 'Enviada no prazo' : 'Enviada em atraso'
                });
                setContas({
                    ...contas,
                    idDoc: docRef.id,
                    status: noPrazo(viagem.dataVolta) ? 'Enviada no prazo' : 'Enviada em atraso'
                });

                await NotificaPreposto({ ...viagem, status: contas.valorDiferenca !== 0 ? 'Prestação de contas enviada' : 'Sem pendências' });
                
                await updateDoc(doc(viagens, viagem.id.toString()), { status: contas.valorDiferenca !== 0 ? 'Prestação de contas enviada' : 'Sem pendências' })

                setDaySelected('');
                setTipoConta('');
                setValor(0);
                setRes(true);
                handleRemoveImage();
                setMessage(`Prestação de contas salva!`);
                setShow(true);
            }
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao atualizar prestação de contas: ' + error.message);
            setShow(true);
        }
    }

    const upsertNota = async (novaNota: Nota) => {
        if (!contas) return;

        // 1) calcula novas notas
        const notasAtualizadas = [...notas, novaNota];
        const totalLocal = notasAtualizadas.reduce((sum, n) => sum + n.valor, 0);
        const diferenca = contas.valorAdiantamento - totalLocal;

        // 2) atualiza estados com os novos dados
        setNotas(notasAtualizadas);
        const novasContas = {
            ...contas,
            notas: notasAtualizadas,
            valorTotal: totalLocal,
            valorDiferenca: diferenca
        };
        setContas(novasContas);

        // 3) salva no Firestore com os valores corretos
        if (contas.idDoc !== '') {
            const docRef = doc(prestacoesDeContas, contas.idDoc);
            await updateDoc(docRef, novasContas);
        } else {
            const ref = await addDoc(prestacoesDeContas, novasContas);
            setContas({ ...novasContas, idDoc: ref.id });
        }

        // 4) limpa inputs e dá feedback
        setTipoConta('');
        setValor(0);
        setRes(true);
        handleRemoveImage();
        setMessage(`Prestação de contas do dia ${daySelected} atualizada!`);
        setDaySelected('');
        setShow(true);
        document.body.style.cursor = 'default';
    };

    const removerNota = async (index: number) => {
        if (!contas || !notas) return;
        const novasNotas = notas.filter((_, i) => i !== index); // já remove aqui
        const totalLocal = novasNotas.reduce((sum, n) => sum + n.valor, 0);

        setNotas(novasNotas); // atualiza o estado com a lista nova
        
        const docRef = doc(prestacoesDeContas, contas.idDoc);
        await updateDoc(docRef, { ...contas,  notas: novasNotas,
            valorTotal: totalLocal,
            valorDiferenca: contas.valorAdiantamento - totalLocal});

        // atualiza contas
        setContas(prevContas => {
            if (!prevContas) return prevContas;
            const diferenca = prevContas.valorAdiantamento - totalLocal;
            return {
            ...prevContas,
            valorTotal: totalLocal,
            valorDiferenca: diferenca
            };
        });
    };

    const copiarChavePix = () => {
        navigator.clipboard.writeText("eef6e0e2-875b-4c14-9751-ee2e4e734dec").then(() => {
            setToggleCopy(true);
        })
    }

    const atualizarNota = (valor: number, tipo: string, url: string, data: string) => {
        setDaySelected(data);
        setValor(valor);
        setTipoConta(tipo);
        setImage(url);
    }

    const aprovarPrestacao = async () => {
        if (!viagem || !contas) return;
        try { 
            await NotificarFinanceiroPrestacao(
                { ...viagem, status: contas.valorDiferenca < 0 ? 'Pendente financeiro' : 'Concluída' }, 
                contas,
                contas.urlReciboPix || ''
            );
            await updateDoc(doc(viagens, viagem.id.toString()), { status: contas.valorDiferenca < 0 ? 'Pendente financeiro' : 'Concluída' })
            setDaySelected('');
            setTipoConta('');
            setValor(0);
            setRes(true);
            handleRemoveImage();
            setMessage(`Prestação de contas salva!`);
            setShow(true);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao atualizar prestação de contas: ' + error.message);
            setShow(true);
        }
    }

    const salvarNotificar = async () => {
        if (!contas || !viagem) return;
        if (refVlrDif !== 0 && refVlrDif !== contas.valorDiferenca) {
            let dif: number = 0;
            dif = (refVlrDif - contas.valorDiferenca) < 0 ? (refVlrDif - contas.valorDiferenca) * -1 : (refVlrDif - contas.valorDiferenca);
            await updateDoc(doc(viagens, viagem.id.toString()), 
            { status: contas.valorDiferenca !== 0 ? 'Pendente prestação de contas' : 'Sem pendências' });
            const jus = window.prompt("Digite a justificativa:");
            await NotificaPendentePrestacao(viagem, dif, jus || '');
        }
        
        /* const docRef = doc(prestacoesDeContas, contas.idDoc);
        await updateDoc(docRef, contas); */
        setMessage(`Prestação de contas salva!`);
        setShow(true);
    }

    if (viagem) {
        if (viagem.status === 'Pendente prestação de contas' || isBefore(parse(viagem.dataVolta, 'dd/MM/yyyy', new Date()), new Date())){
            return (
                <ViagemContainer>
                    <div className="mt-2 d-flex justify-content-between">
                        <div>
                            <div className="d-flex align-items-center">
                                <h5 onClick={() => console.log(contas)}>Prestação de contas: {contas?.status}</h5>
                                {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
                            </div>
                            <div className="text-ease">Viagem id {id} para {viagem.destino}</div>
                        </div>
                        <div>
                            <div className="text-end"><label className="text-ease">Valor adiantamento:</label> R$ {contas?.valorAdiantamento.toFixed(2)}</div>
                            <div className="text-end"><label className="text-ease">Valor contas:</label> R$ {contas?.valorTotal.toFixed(2)}</div>
                        </div>
                    </div>
                    <hr/>
                    <div className="row mt-3">
                        <div className="col-12 col-md-6">
                            <CalendarRange startDate={viagem.dataIda} endDate={viagem.dataVolta} handleClick={handleSelectedDay} />
                        </div>
                         {daySelected !== '' && 
                        <div className="col-12 col-md-6">
                                <div className="mt-4">
                                    <div className="d-flex">Dia da prestação de contas: <h6 className="ms-2">{daySelected}</h6></div>
                                    <hr/>
                                    <form onSubmit={atualizarPrestacao}>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label htmlFor="valor">Valor da nota</label>
                                                <input type="number" id="valor" name="valor" placeholder="Valor total em (R$)" onChange={(e) => setValor(e.currentTarget.valueAsNumber)} value={valor} required/>
                                            </div>
                                            <div className="mb-4 col-6">
                                                <div className="form-group">
                                                    <label htmlFor="hotel">Tipo de conta</label>
                                                </div>
                                                <Select
                                                    name="tipo"
                                                    value={tipo.find(opt => opt.value === tipoConta)  || tipo[0]}
                                                    onChange={handleSelectChange}
                                                    options={tipo}
                                                    styles={customSelectStyles()}
                                                    noOptionsMessage={() => "Não encontrado"}
                                                />
                                            </div>
                                            <div className="form-group col-6 mb-4">
                                                <label htmlFor="image">Imagem da nota</label>
                                                <input className="form-control" type="file" id="image" accept=".png, .jpg, .jpeg" onChange={handleFileChange}/>
                                            </div>
                                            <div className="form-group mb-4">
                                                <button className="btn btn-danger" type="submit"><i className="bi bi-floppy-fill me-2"/>Enviar</button>
                                                <button className="btn btn-secondary ms-2" type="reset" onClick={() => setDaySelected('')}>Fechar</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                        </div>}
                        <div className="mt-4 col-12 col-md-6">
                            <h5>Notas </h5>
                            <hr/>
                            <table className="table table-striped table-dark">
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ width: "25%" }}>Dia</th>
                                        <th scope="col" style={{ width: "30%" }}>Tipo de nota</th>
                                        <th scope="col" style={{ width: "20%" }}>Foto</th>
                                        <th scope="col" style={{ width: "25%" }}>Valor</th>
                                        <th scope="col" style={{ width: "10%"}}>{(viagem.status === 'Pendente prestação de contas' || user?.nivelAcesso === 'ADM') ? 'Editar' : ''}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { notas.length > 0 ? 
                                        notas.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.diaViagem}</td>
                                                <td>{item.tipo}</td>
                                                <td><a href={item.urlImagem} target="_blank"><i className="bi bi-image"/></a></td>
                                                <td>R$ {item.valor}</td>
                                                <td>{(viagem.status === 'Pendente prestação de contas' || user?.nivelAcesso === 'ADM') ? 
                                                    <>    
                                                        <i className="bi bi-pencil me-2" style={{ cursor: "pointer" }} onClick={() => atualizarNota(item.valor, item.tipo, item.urlImagem, item.diaViagem)} />
                                                        <i className="bi bi-trash" style={{ cursor: "pointer" }} onClick={() => removerNota(index)} />
                                                    </> 
                                                    : 
                                                    <>
                                                    </>
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                        :
                                        <tr>
                                            <td colSpan={5}>Nenhuma nota cadastrada</td>
                                        </tr>
                                    }
                                    <tr>
                                        <td className="text-end">{contas && contas.valorDiferenca === 0 ? 'Sem diferença' : contas && contas.valorDiferenca > 0 ? 'Devolver via pix' : 'Reembolso de'}</td>
                                        <td>R$ {contas && contas.valorDiferenca < 0 ? (contas.valorDiferenca * -1).toFixed(2) : contas?.valorDiferenca.toFixed(2)}</td>
                                        <td className="text-end">Total</td>
                                        <td>R$ {contas?.valorTotal.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                            {notas.length > 0 && (viagem.status === 'Pendente prestação de contas') &&
                            <div className="d-flex">
                                {contas && contas.valorDiferenca > 0 &&
                                    <div className="me-3">
                                            <label onClick={() => copiarChavePix()} style={{ cursor: 'pointer'}}>Copiar chave PIX <i className={`bi ${toggleCopy ? 'bi-clipboard-check' : 'bi-copy'}`}/></label>
                                            <input className="form-control" type="file" id="anexo" accept=".png, .jpg, .jpeg, .pdf" onChange={comprovanteChange} />
                                    </div>
                                }
                                <button className="btn btn-success" onClick={salvarPrestacao} disabled={contas && contas.valorDiferenca > 0 ? anexo ? false : true : false}>Salvar e notificar prestação de contas</button>
                            </div>
                            }
                            {contas?.urlReciboPix && 
                            <a href={contas?.urlReciboPix} className="me-2 btn btn-secondary" target="_blank">Comprovante de devolução</a>
                            }
                            {viagem.status === 'Prestação de contas enviada' && (user?.nivelAcesso === 'ADM' || user?.nivelAcesso === 'AEM') && 
                                <button className="btn btn-outline-success" onClick={() => aprovarPrestacao()}>Aprovar prestação</button>
                            }
                            {user?.nivelAcesso === 'ADM' &&
                                <button className="btn btn-success mt-2" onClick={() => salvarNotificar()}><i className="bi bi-floppy-fill me-2"/>Notificar colaborador</button>
                            }
                        </div>
                    </div>

                    <Modal show={show} onHide={() => setShow(false)} >
                        <Modal.Header closeButton>
                            <Modal.Title>{res ? 'Sucesso' : 'Erro'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {message}
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-danger" onClick={() => setShow(false)}>Ok</button>
                        </Modal.Footer>
                    </Modal>
                </ViagemContainer>
            )
        } else {
            return (
                <ViagemContainer>
                    <div className="d-flex mt-4">
                        <h5>Não é possivel prestar contas para esta viagem. Status: <StatusBadge status={viagem.status}/></h5>
                    </div>
                </ViagemContainer>
            )
        }
    }  else {
        return (
            <ViagemContainer>
                <div className="d-flex justify-content-center mt-4">
                    <Spinner/>
                </div>
            </ViagemContainer>
        )
    }
}

export default ViagemPrestacao;