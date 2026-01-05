import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { getStatusLog } from "../../controller/Viagem";
import { StatusLog } from "../../types/Viagem";
import StatusBadge from "../statusBadge";
import { format } from "date-fns";
type Props = {
  idViagem: string;
  children?: React.ReactNode;
};

const StatusLogViewer = ({ idViagem, children }: Props) => {
  const [show, setShow] = useState(false);
  const [list, setList] = useState<StatusLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getStatusLog(idViagem);
      const sorted = snap.sort(
        (a, b) => a.dateTime.toDate().getTime() - b.dateTime.toDate().getTime()
      );
      setList(sorted);
    };
    fetchData();
  }, []);

  return (
    <div onClick={() => setShow(!show)} style={{cursor: 'pointer'}}>
      {children}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Histórico de alterações de status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {list.map((item, index) => (
            <div key={index}>
                <div  className="d-flex justify-content-around align-items-center">
                    <h5><StatusBadge status={item.valorAnt} /></h5>
                    <i className="bi bi-chevron-right" />
                    <h5><StatusBadge status={item.valorAtt} /></h5>
                </div>
                <div className="d-flex justify-content-end">
                    <small className="text-muted">{format(item.dateTime.toDate(), "dd/MM/yyyy HH:mm:ss")}</small>
                </div>
                <hr/>
            </div>
            
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StatusLogViewer;
