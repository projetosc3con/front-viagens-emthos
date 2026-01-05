import { Modal } from "react-bootstrap";
import { Agente, getAgentes } from "../../types/Agente";
import { useState, useEffect, useRef } from "react";
import { useUserContext } from "../../context/UserContext";
import { doc, updateDoc } from "firebase/firestore";
import { createCollection } from "../../util/FirebaseConnection";

const Agentes = () => {
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useUserContext();
    const hasFetchedData = useRef(false);
    const [agentes, setAgentes] = useState<Agente[]>([]);

    useEffect(() => {
            if (hasFetchedData.current) return;
            hasFetchedData.current = true;
    
            const fetchData = async () => {
                if (user?.nivelAcesso === 'ADM') {
                    const snap = await getAgentes();
                    setAgentes(snap);
                }
            }
    
            fetchData();
        }, []);
    

    const handleChange = (funcao: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setAgentes(prev =>
            prev.map(a =>
                a.funcao === funcao
                ? { ...a, [name]: value }
                : a
            )
        );
    };

    const atualizarAgente = async(editado: Agente) => {
        try {
            const docRef = doc(createCollection('AGENTES'), editado.funcao);
            await updateDoc(docRef, editado);
            setRes(true);
            setMessage(`Agente ${editado.funcao} atualizado com sucesso!`);
            setShow(true);
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao editar aprovador: ' + error.message);
            setShow(true);
        }
    }

    return (
        <div className="row">
            {agentes.map((item, index) => (
                <div className="col-12 col-lg-6 col-xxl-4" key={index}>
                    <div className="card">
                    <div className="card-body">
                        <h5>{item.funcao.charAt(0).toUpperCase() + item.funcao.slice(1)}</h5>
                        <hr/>
                        <div className="form-group mb-2">
                            <label htmlFor={`email-${index}`}>Email agente</label>
                            <input type="email" id={`email-${index}`} name="email" placeholder="E-mail do agente" value={item.email} onChange={handleChange(item.funcao)} required/>
                        </div>
                        <div className="form-group mb-2">
                            <label htmlFor={`nome-${index}`}>Nome</label>
                            <input type="text" id={`nome-${index}`} name="nome" placeholder="Nome do agente" value={item.nome} onChange={handleChange(item.funcao)} required/>
                        </div>
                    </div>
                        <button className="btn btn-danger mx-5" onClick={() => atualizarAgente(item)}><i className="bi bi-pencil me-2"/>Alterar</button>
                        </div>
                </div>
            ))}

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
        </div>
    )
}

export default Agentes;