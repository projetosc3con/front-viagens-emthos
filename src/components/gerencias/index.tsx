import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import { getGerencias } from "../../controller/Gerencia";
import Gerencia from "../../types/Gerencia";
import { Container } from "./styles";
import { gerencias as Gers} from "../../util/FirebaseConnection";
import { doc, updateDoc } from "firebase/firestore";
import { Modal } from "react-bootstrap";
import { FolderPath, FolderTree } from "../folderTree";
import { Alert } from "react-bootstrap";

 function somarCol(gerencias: Gerencia[], termo: string): number {
  return gerencias
    .filter(g => g.nome.toLowerCase().includes(termo.toLowerCase()))
    .reduce((total, g) => total + g.colaboradores, 0);
}

const Gerencias = () => {
    const { user } = useUserContext();
    const hasFetchedData = useRef(false);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [folderPaths, setFolderPaths] = useState<FolderPath[]>([]);
    const [edited, setEdited] = useState<Gerencia | null>();

    useEffect(() => {
        if (hasFetchedData.current) return; 
        hasFetchedData.current = true;

        const fetchData = async() => {
            if(user && user.nivelAcesso === 'ADM'){
                const data = await getGerencias();
                setGerencias(data);
                let list: FolderPath[] = [];

                data.map((d) => {
                    list.push({
                        files: d.colaboradores,
                        path: d.nome,
                        id: d.id ?? ''
                    });
                })
                setFolderPaths(list);
                console.log(list)
            }
        }

        fetchData();
    }, []);

    const fetchData = async() => {
        if(user && user.nivelAcesso === 'ADM'){
            const data = await getGerencias();
            setGerencias(data);
            let list: FolderPath[] = [];

            data.map((d) => {
                list.push({
                    files: d.colaboradores,
                    path: d.nome,
                    id: d.id ?? ''
                });
            })
            setFolderPaths(list);
            console.log(list)
        }
    }

    const handleAprovadorChange = (id: string, novoEmail: string) => {
        if (!edited) return;
        setEdited({ ...edited, aprovador: novoEmail });
    };

    const handleFluxoChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { type } = e.target;
        if(!edited) return;
        setEdited({ 
            ...edited, 
            fluxoCompleto: type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : false 
        });
    }

    const editarAprovador = async (id: string, gerencia: Gerencia | null | undefined) => {
        if (!gerencia) return;

        try {
            const docRef = doc(Gers, id);
            await updateDoc(docRef, { 
                aprovador: gerencia.aprovador,
                fluxoCompleto: gerencia.fluxoCompleto
            });
            fetchData();
            setRes(true);
            setMessage('Gerencia alterada com sucesso!');
            setShow(true);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao editar gerencia: ' + error.message);
            setShow(true);
        }
    }

    const handleShowForm = (id: string) => {
        const ger = gerencias.find(g => g.id === id);
        if(ger) {
            setEdited(ger);
        } else {
            setEdited(null);
        }
    }

    if (user?.nivelAcesso !== 'ADM') {
        return (
            <>
            Sem acesso a essa área!
            </>
        )
    } else {
        return (
            <Container className="row">
                <div className="card">
                    <FolderTree folders={folderPaths} onItemClick={(id) => handleShowForm(id)}/>
                </div>
                


                {/* {gerencias.map((item, index) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index} id={item.id}>
                        <div className="card">
                            <div className="card-body">
                                <h5>{item.nome}</h5>
                                <div className="form-group mb-3">
                                    <label htmlFor="aprovador">Aprovador</label>
                                    <input type="text" id="aprovador" name="aprovador" placeholder="E-mail do aprovador" value={item.aprovador} onChange={e => handleAprovadorChange(item.id, e.target.value)} required/>
                                </div>
                                <div className="form-group">
                                    <label>Compra de viagens</label>
                                    <div className="form-check form-switch ms-2">
                                        <input type="checkbox" className="form-check-input" name="fluxoCompleto" checked={item.fluxoCompleto} onChange={(e) => handleFluxoChange(e, item.id)}/>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="d-flex justify-content-between">
                                    <small className="fw-lighter">Colaboradores: {item.colaboradores}</small>
                                    <i className="bi bi-pencil" onClick={() => editarAprovador(item.id, item)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                ))} */}

                <Modal show={edited ? true : false} onHide={() => setEdited(null)} >
                    <Modal.Header closeButton>
                        <Modal.Title>Editar gerencia</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <h5>{edited?.nome}</h5>
                            <div className="form-group mb-3">
                                <label htmlFor="aprovador">Aprovador</label>
                                <input type="text" id="aprovador" name="aprovador" placeholder="E-mail do aprovador" value={edited?.aprovador || ''} onChange={e => handleAprovadorChange(edited?.id || '', e.target.value)} required/>
                            </div>
                            <div className="form-group mb-3">
                                <label>Compra de viagens</label>
                                <div className="form-check form-switch ms-2">
                                    <input type="checkbox" className="form-check-input" name="fluxoCompleto" checked={edited?.fluxoCompleto} onChange={(e) => handleFluxoChange(e, edited?.id || '')}/>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="d-flex justify-content-between">
                                <small className="fw-lighter">Colaboradores: {edited?.colaboradores}</small>
                            </div>
                        </div>
                        {show && <Alert className="mt-2" variant={res ? 'success' : 'danger'} onClose={() => setShow(false)} dismissible>{message}</Alert>}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => editarAprovador(edited?.id || '', edited)}><i className="bi bi-floppy me-2" />Alterar</button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    }
}

export default Gerencias;