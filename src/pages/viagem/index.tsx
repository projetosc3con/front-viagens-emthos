import { Container } from "./styles";
import { useParams, useNavigate, Route, Routes, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import NavLink from "../../components/navlink";
import ViagemBase from "./base";
import ViagemAdiantamento from "./adiantamento";
import ViagemOrcamentos from "./orcamentos";
import ViagemPrestacao from "./prestacao";
import { useUserContext } from "../../context/UserContext";
import { useEffect, useState } from "react";
import { getGerenciaViagem } from "../../controller/Gerencia";
import { getViagem } from "../../controller/Viagem";
import Viagem from "../../types/Viagem";

const ConsultarViagem = () => {
    const { id } = useParams<{id: string}>();
    const location = useLocation();
    const { user } = useUserContext();
    const [compra, setCompra] = useState<boolean>(false);
    const [viagem, setViagem] = useState<Viagem | null>();

    useEffect(() => {
        const fetchData = async() => {
            if (id) {
                const snap = await getGerenciaViagem(id);
                if (!snap) {
                    setCompra(false)
                } else {
                    setCompra(snap.fluxoCompleto)
                }
                const viagSnap = await getViagem(id);
                setViagem(viagSnap);
            }
        }

        fetchData();
    }, []);


    if (user?.email === viagem?.colaborador || user?.nivelAcesso !== 'COL') {
    return (
        <Container>
            <Nav fill variant="tabs" defaultActiveKey={`/viagens/${id}/`}>
                <Nav.Item>
                    <NavLink className="" to={`/viagens/${id}`} ativo={location.pathname === `/viagens/${id}`}>Viagem</NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink className="" to={`/viagens/${id}/adiantamento`} ativo={location.pathname === `/viagens/${id}/adiantamento`}>Adiantamento</NavLink>
                </Nav.Item>
                <Nav.Item >
                    <NavLink className="" to={`/viagens/${id}/prestacao`} ativo={location.pathname === `/viagens/${id}/prestacao`}>Prestação de contas</NavLink>
                </Nav.Item>
                {user?.nivelAcesso !== "COL" && compra && 
                <Nav.Item>
                    <NavLink className="" to={`/viagens/${id}/orcamentos`} ativo={location.pathname === `/viagens/${id}/orcamentos`}>Orçamentos</NavLink>
                </Nav.Item>
                }
            </Nav>
        
            <Routes>
                <Route path="" element={<ViagemBase />} />
                <Route path="adiantamento" element={<ViagemAdiantamento/>} />
                <Route path="prestacao" element={<ViagemPrestacao/>} />
                <Route path="orcamentos" element={<ViagemOrcamentos/>} />
            </Routes>
        </Container>
    )
    } else {
        return (<>Você não possui acesso a essa viagem</>)
    }
}

export default ConsultarViagem;