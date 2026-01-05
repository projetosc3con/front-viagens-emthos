import { Container } from "./styles";
import Adiantamento from "../../types/Adiantamento";
import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getViagem } from "../../controller/Viagem";
import { format, addDays, parse } from "date-fns";
import { Spinner } from "react-bootstrap";
import { addAdiantamento, getAdiantamento, updateAdiantamento } from "../../controller/Adiantamento";
import Viagem from "../../types/Viagem";
import Helper, { HelperProps } from "../helper";
import { helperAdiantamento } from "../../controller/Helper";

const PedirAdiantamento = () => {
    const [adiantamento, setAdiantamento] = useState<Adiantamento>();
    const navigate = useNavigate();
    const [viagem, setViagem] = useState<Viagem>();
    const [totalAlimentacao, setTotalAlimentacao] = useState(0);
    const [totalDeslocamento, setTotalDeslocamento] = useState(0);
    const [res, setRes] = useState(false);
    const [info, setInfo] = useState<HelperProps>();
    const [message, setMessage] = useState('');
    const [show, setShow] = useState(false);
    const [totalGeral, setTotalGeral] = useState(0);
    const { id } = useParams<{id: string}>();
    const hasFetchedData = useRef(false);
    const [lockButtons, setLockButtons] = useState(false);

    useEffect(() => {
        if (hasFetchedData.current) return; 
        hasFetchedData.current = true;
    
        const fetchData = async () => {
            if (id) {
                const snap = await getViagem(id);
                if (snap) {
                    setViagem(snap);
                    const adiant = await getAdiantamento(id);
                    const dataIda = parse(snap.dataIda, "dd/MM/yyyy", new Date());
                    const itens = Array.from({ length: snap.duracao }, (_, i) => {
                        const dataRef = addDays(dataIda, i);
                        return {
                            alimentacao: 0,
                            deslocamento: 0,
                            lavanderia: 0,
                            total: 0,
                            dataReferencia: format(dataRef, "dd/MM/yyyy")
                        };
                    });

                    if (adiant) {
                        setAdiantamento(adiant);
                        recalcularTotais(adiant.itens);
                    } else {
                        setAdiantamento({
                            idDoc: "",
                            idViagem: snap.id.toString(),
                            totalAdiantamento: 0,
                            itens
                        });
                    }
                }
                const snapinfo = await helperAdiantamento();
                setInfo(snapinfo);
            }
        }

        fetchData();
    }, []);

    const recalcularTotais = (itens: Adiantamento["itens"]) => {
        const alimentacao = itens.reduce((acc, item) => acc + item.alimentacao, 0);
        const deslocamento = itens.reduce((acc, item) => acc + item.deslocamento, 0);
        setTotalAlimentacao(alimentacao);
        setTotalDeslocamento(deslocamento);
        setTotalGeral(alimentacao + deslocamento);
    };

    const handleInputChange = (index: number, field: "alimentacao" | "deslocamento", value: string) => {
        if(!viagem) return;
        if (viagem.status !== 'Aprovada' && viagem.status !== 'Triagem' && viagem.status !== 'Programada') return;
        const numValue = parseFloat(value.replace(",", ".")) || 0;
        if (numValue > 205) return;

        if (adiantamento) {
            const novosItens = [...adiantamento.itens];
            novosItens[index][field] = numValue;
            novosItens[index].total = novosItens[index].alimentacao + novosItens[index].deslocamento;

            setAdiantamento({ ...adiantamento, itens: novosItens });
            recalcularTotais(novosItens);
        }
    };

    const gerarLinhas = () => {
        if (!adiantamento) return null;

        return adiantamento.itens.map((item, index) => (
            <tr key={index}>
                <th scope="row">{item.dataReferencia}</th>
                <td>
                    <input type="text" value={item.alimentacao.toString().replace('.', ',')}
                        onChange={e => handleInputChange(index, "alimentacao", e.target.value)} />
                </td>
                <td>
                    <input type="text" value={item.deslocamento.toString().replace('.', ',')}
                        onChange={e => handleInputChange(index, "deslocamento", e.target.value)} />
                </td>
                <td>
                    <input type="text" value={item.total.toString().replace('.', ',')} readOnly />
                </td>
            </tr>
        ));
    };

    const toggleLockBtn = async () => {
        setLockButtons(!lockButtons);
    }

    const handleSubmit = async () => {
        //notificações estão no controller
        if(adiantamento) {
            await toggleLockBtn();
            if (adiantamento.idDoc !== "") {
                const { res, msg } = await updateAdiantamento({ 
                    ...adiantamento,
                    totalAdiantamento: totalGeral
                }) 
                setRes(res);
                setMessage(msg);
                setShow(true);
            } else {
                const { res, msg } = await addAdiantamento({ 
                    ...adiantamento,
                    totalAdiantamento: totalGeral
                }) 
                setRes(res);
                setMessage(msg);
                setShow(true);
            }
            await toggleLockBtn();
        }
    }

    if (adiantamento) {
        return (
            <Container className="mt-2">
                <div className="d-flex">
                <h4>Adiantamento</h4>
                {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
            </div>
                <hr/>
                <div className="card-body table-responsive">
                    <table className="table table-dark table-striped-columns table-bordered">
                        <thead>
                            <tr>
                                <th scope="col" style={{ width: "15%" }}>Data</th>
                                <th scope="col" style={{ width: "25%" }}>Alimentação</th>
                                <th scope="col" style={{ width: "25%" }}>Deslocamento</th>
                                <th scope="col" style={{ width: "15%" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gerarLinhas()}
                            <tr className="table-active">
                                <th scope="row">Total</th>
                                <td><input type="text" value={totalAlimentacao.toString().replace('.', ',')} readOnly /></td>
                                <td><input type="text" value={totalDeslocamento.toString().replace('.', ',')} readOnly /></td>
                                <td><input type="text" value={totalGeral.toString().replace('.', ',')} readOnly /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {viagem && (viagem.status === 'Aprovada' || viagem.status === 'Triagem' || viagem.status === 'Programada') && 
                    <div className="ps-3 mt-3">
                        <button className="btn btn-danger" onClick={handleSubmit} disabled={lockButtons}>Salvar {adiantamento.idDoc === '' ? 'e notificar' : ''}<i className=" ms-2 bi bi-floppy-fill"/></button>
                    </div>
                }

                <Modal show={show} onHide={() => setShow(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>{res ? 'Sucesso' : 'Erro'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => navigate('/consultar')}>Concluir</button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    } else {
        return (
            <div className="d-flex justify-content-center pt-4">
                <Spinner/>
            </div>
        )
    }
}

export default PedirAdiantamento;