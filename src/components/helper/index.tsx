import styled from "styled-components";
import { Modal } from "react-bootstrap";
import { useState } from "react";

export type HelperProps = {
    titulo: string;
    passos: PassosProps[];
    observacoes?: string[];
}

type PassosProps = {
    descricao: string;
    urlFoto: string;
}

const Container = styled.div`
    i {
        cursor: pointer;
        color: #a1a1a1ff;
    }

    i:hover {
        color: #edf6f9;
    }

    .obs {
        background-color: #999;
    }

`;

const Helper = ({titulo, passos, observacoes}: HelperProps) => {
    const [show, setShow] = useState(false);

    return (
        <Container className="d-flex jutify-content-center align-items-center ps-2">
            <i className="bi bi-info-circle" onClick={() => setShow(true)}></i>
            <Modal size="lg" show={show} onHide={() => setShow(false)} aria-labelledby="example-modal-sizes-title-lg" >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        {titulo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {observacoes &&
                    <div style={{ backgroundColor: '#636363', padding: '.5rem .5rem'}}>
                        <h5>Observações:</h5>
                        <ul>
                            {observacoes?.map((o) => (
                                <li>{o}</li>
                            ))}
                        </ul>
                    </div>
                    }

                    <div >
                        {passos.map((p) => (
                            <div className="mt-3">
                                <p>{p.descricao}</p>
                                <div className="d-flex justify-content-center">
                                    <img src={p.urlFoto} style={{ maxWidth: '90%', maxHeight: '50vh'}}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    )
}

export default Helper;