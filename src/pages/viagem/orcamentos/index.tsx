import { FormEvent, useEffect, useRef, useState } from "react";
import ViagemContainer from "../../../components/viagemContainer";
import Viagem from "../../../types/Viagem";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Triagem from "../../../types/Triagem";
import { storage, triagens } from "../../../util/FirebaseConnection";
import { addTriagem, getTriagem } from "../../../controller/Triagem";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getViagem } from "../../../controller/Viagem";
import { NotificaPreposto, NotificarProgramacao } from "../../../controller/Mail";
import { Modal } from "react-bootstrap";
import { useUserContext } from "../../../context/UserContext";
import { getGerencia } from "../../../controller/Gerencia";
import Gerencia from "../../../types/Gerencia";

const ViagemOrcamentos = () => {
    const { id } = useParams<{id: string}>();
    const hasFetchedData = useRef(false);
    const [anexoEmail, setAnexoEmail] = useState<string | null>(null);
    const [anexoProg, setAnexoProg] = useState<string | null>(null);
    const [viagem, setViagem] = useState<Viagem | null>();
    const [triagem, setTriagem] = useState<Triagem>();
    const [gerencia, setGerencia] = useState<Gerencia | null>();
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useUserContext();

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchData = async () => {
            if (id) {
                const res = await getTriagem(id);
                const snap = await getViagem(id);
                if (snap) {
                    setViagem(snap);
                    const gerRes = await getGerencia(snap.gerencia);
                    setGerencia(gerRes);
                }
                if (res) {
                    setTriagem(res);
                } else {
                    setTriagem({
                        idDoc: '',
                        idViagem: id,
                        emailDownloadUrl: '',
                        progDownloadUrl: '',
                        valorProgramado: 0,
                        valorValidado: 0
                    })
                }
            }
        }

        fetchData();
    }, []);

    const handleFileChange = (fieldName: 'anexoEmail' | 'anexoProg') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'anexoEmail') {
                    setAnexoEmail(reader.result as string);
                } else {
                    setAnexoProg(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const atualizarTriagem  = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let url = '';
        if(anexoEmail) {
            console.log('aqui');
            try {
                const anexoRef = ref(storage, `viagens/${id}/triagem/anexo-petrobras`);
                const response = await fetch(anexoEmail);
                const blob = await response.blob();
                const snap = await uploadBytes(anexoRef, blob);
                url = await getDownloadURL(anexoRef);    
                console.log(snap)
            } catch (error: any) {
                setRes(false);
                setMessage('Erro ao atualizar triagem: ' + error.message);
                console.log(message);
                setShow(true);
            }
        }

        if (triagem?.idDoc === '') {
            const { res, msg, id } = await addTriagem({ ...triagem, emailDownloadUrl: url });
            setTriagem({
                ...triagem,
                idDoc: id,
                emailDownloadUrl: url
            });
            setRes(res);
            setMessage(msg);
            setShow(true);
        } else {
            if (!triagem) return;
            const docRef = doc(triagens, triagem.idDoc);
            try {
                await updateDoc(docRef, {
                    emailDownloadUrl: url,
                    idDoc: triagem.idDoc,
                    valorValidado: triagem.valorValidado
                })
                setTriagem({
                    ...triagem,
                    emailDownloadUrl: url
                });
                setRes(true);
                setMessage('Triagem atualizada com sucesso!');
                setShow(true);
            } catch (error: any) {
                setRes(false);
                setMessage('Erro ao atualizar triagem: ' + error.message);
                setShow(true);
            }
        }
    }

    const atualizarProgramacao  = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let url = '';
        if(anexoProg) {
            try {
                const anexoRef = ref(storage, `viagens/${id}/triagem/anexo-programacao`);
                const response = await fetch(anexoProg);
                const blob = await response.blob();
                await uploadBytes(anexoRef, blob);
                url = await getDownloadURL(anexoRef);    
            } catch (error: any) {
                setRes(false);
                setMessage('Erro ao atualizar triagem: ' + error.message);
                setShow(true);
            }
        }

        if (viagem?.status === 'Aprovada' || viagem?.status === 'Triagem') {
            const object = { ...triagem, progDownloadUrl: url } as Triagem;
            await NotificarProgramacao({ ...viagem, status: 'Programada' }, object);
            await NotificaPreposto({ ...viagem, status: 'Programada' });
        }

        if (triagem?.idDoc === '') {
            const { res, msg, id } = await addTriagem({ ...triagem, progDownloadUrl: url });
            setTriagem({
                ...triagem,
                idDoc: id,
                progDownloadUrl: url
            });
            setRes(res);
            setMessage(msg);
            setShow(true);
        } else {
            if (!triagem) return;
            const docRef = doc(triagens, triagem.idDoc);
            try {
                await updateDoc(docRef, {
                    progDownloadUrl: url,
                    valorProgramado: triagem.valorProgramado
                })
                setTriagem({
                    ...triagem,
                    progDownloadUrl: url
                });
                setRes(true);
                setMessage('Triagem atualizada com sucesso!');
                setShow(true);
            } catch (error: any) {
                setRes(false);
                setMessage('Erro ao atualizar triagem: ' + error.message);
                setShow(true);
            }
        }
    }

    if (user?.nivelAcesso === 'COL') {
        return (
            <ViagemContainer>
                Sem acesso a essa área
            </ViagemContainer>
        )
    } else {
        if (triagem) {
            if (gerencia && gerencia.fluxoCompleto) {
                return (
                    <ViagemContainer>
                        <div className="mt-4">
                            <div>
                                <h5>Triagem validada pelo cliente</h5>
                                <hr/>
                                <form onSubmit={atualizarTriagem}>
                                    <div className="row">
                                        <div className="form-group col-12 col-md-8 col-lg-6 mb-4">
                                            <label htmlFor="anexoEmail">E-mail da triagem</label>
                                            <input className="form-control" type="file" id="anexoEmail" accept=".*" onChange={handleFileChange("anexoEmail")}/>
                                        </div>
                                        {triagem.emailDownloadUrl !== '' &&
                                        <div className="col-md-3 col-lg-4 mb-4 d-flex align-items-end">
                                            <a target="_blank" href={triagem.emailDownloadUrl} className="btn btn-secondary"><i className="bi bi-download me-s"/> Visualizar arquivo anexado</a>
                                        </div>
                                        }
                                    </div>
                                    <div className="form-group mb-4 col-6 col-md-3 col-xxl-1">
                                        <label htmlFor="valorValidado">Valor sugerido até (R$)</label>
                                        <input type="number" id="valorValidado" name="valorValidado" placeholder="Valor total em (R$)" onChange={(e) => setTriagem({ ...triagem, valorValidado: e.currentTarget.valueAsNumber})} value={triagem.valorValidado} required/>
                                    </div>
                                    <div>
                                        <button type="submit" className="btn btn-danger"><i className="bi bi-floppy-fill me-2"/>Salvar</button>
                                    </div>
                                </form>
                            </div>
                            <div className="mt-4">
                                <h5>Orçamento final programado</h5>
                                <hr/>
                                <form onSubmit={atualizarProgramacao}>
                                    <div className="row">
                                        <div className="form-group col-12 col-md-8 col-lg-6 mb-4">
                                            <label htmlFor="anexoProg">Evidência da programação</label>
                                            <input className="form-control" type="file" id="anexoProg" accept=".*" onChange={handleFileChange("anexoProg")}/>
                                        </div>
                                        {triagem.progDownloadUrl !== '' &&
                                        <div className="col-md-3 col-lg-4 mb-4 d-flex align-items-end">
                                            <a target="_blank" href={triagem.progDownloadUrl} className="btn btn-secondary"><i className="bi bi-download me-s"/> Visualizar arquivo anexado</a>
                                        </div>
                                        }
                                    </div>
                                    <div className="form-group mb-4 col-6 col-md-3 col-xxl-1">
                                        <label htmlFor="valorProgramado">Valor final (R$)</label>
                                        <input type="number" id="valorProgramado" name="valorProgramado" placeholder="Valor total em (R$)" onChange={(e) => setTriagem({ ...triagem, valorProgramado: e.currentTarget.valueAsNumber})} value={triagem.valorProgramado} required/>
                                    </div>
                                    <div>
                                        <button type="submit" className="btn btn-danger"><i className="bi bi-floppy-fill me-2"/>{viagem?.status === 'Aprovada' || viagem?.status === 'Triagem' ? 'Notificar programação' : 'Salvar'}</button>
                                    </div>
                                </form>
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
                        <div className="mt-4">
                            Não é feita programação da viagem para a gerencia {gerencia?.nome}
                        </div>
                    </ViagemContainer>
                )
            }
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
}

export default ViagemOrcamentos;