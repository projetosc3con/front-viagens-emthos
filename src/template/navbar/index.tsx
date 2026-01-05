import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import NavLink from '../../components/navlink';
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth } from "../../util/FirebaseConnection";
import { Modal, Form, Alert } from 'react-bootstrap';
import { useState } from 'react';

const NavbarTop = () => {
    const location = useLocation();
    const { user } = useUserContext();
    const [showModal, setShowModal] = useState(false);
    const [toggleType, setToggle] = useState(false);
    const [novaSenha, setNovaSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');

    const logout = async () => {
    if (user) {
            await signOut(auth);
        }
    }

    const alterarSenha = async () => {
        if (novaSenha !== confirmarSenha) {
        setMensagem('As senhas não coincidem');
        return;
        }
        const usuario = auth.currentUser;

        if (user && usuario) {
        try {
            const credential = EmailAuthProvider.credential(user.email, senhaAtual);
            await reauthenticateWithCredential(usuario, credential);

            await updatePassword(usuario, novaSenha);
            setMensagem('Senha atualizada com sucesso!');
        } catch (error: any) {
            setMensagem(`Erro ao atualizar senha: ${error.message}`);
        }
        } else {
        setMensagem('Usuário não autenticado');
        }
    };

    return (
        <>
        <Navbar bg="dark" expand="lg"> {/* ou "md", "sm", conforme seu design */}
            <Container>
                <Navbar.Brand href="#"><img width="154" height="57" src="https://emthos.com/wp-content/uploads/2025/02/logo-emthos.svg" className="attachment-large size-large wp-image-18" alt=""/></Navbar.Brand>
                <Navbar.Toggle aria-controls="offcanvasNavbar" />
                <Navbar.Offcanvas
                id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel"
                placement="end"
                >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="offcanvasNavbarLabel">
                    Viagens Emthos
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className='justify-content-between flex-grow-1 pe-3'>
                        {user?.nivelAcesso === 'COL' &&
                        <div className='d-flex flex-column flex-lg-row'>
                            <NavLink className='nav-link' to='/' ativo={location.pathname === '/'}>
                                Home
                            </NavLink>
                            <NavLink className='nav-link' to='/consultar' ativo={location.pathname === '/consultar' || location.pathname.includes('/viagens')}>
                                Consultar
                            </NavLink>
                            <NavLink className='nav-link' to='/nova' ativo={location.pathname.includes('/nova')}>
                                Nova
                            </NavLink>
                        </div>}
                        {user?.nivelAcesso === 'ADM' && 
                        <div className='d-flex flex-column flex-lg-row'>
                            <NavLink className='nav-link' to='/' ativo={location.pathname === '/'}>
                                Home
                            </NavLink>
                            <NavLink className='nav-link' to='/consultar' ativo={location.pathname === '/consultar' || location.pathname.includes('/viagens')}>
                                Consultar
                            </NavLink>
                            <NavLink className='nav-link' to='/nova' ativo={location.pathname.includes('/nova')}>
                                Nova
                            </NavLink>
                            <NavLink className='nav-link' to='/usuarios' ativo={location.pathname.includes('/usuarios')}>
                                Usuarios
                            </NavLink>
                            <NavLink className='nav-link' to='/relatorios' ativo={location.pathname.includes('/relatorios')}>
                                Relatorios
                            </NavLink>
                            <NavLink className='nav-link' to='/notificacoes' ativo={location.pathname.includes('/notificacoes')}>
                                Notificações
                            </NavLink>
                            <NavLink className='nav-link' to='/configuracoes' ativo={location.pathname.includes('/configuracoes')}>
                                Configurações
                            </NavLink>
                        </div>}
                        <NavDropdown title={user?.nomeAbreviado}>
                            <NavDropdown.Item onClick={() => setShowModal(true)}>
                                Alterar senha <i className='bi bi-key'/>
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={logout}>
                                Sair <i className='bi bi-door-open'/>
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
        <Modal show={showModal} onHide={() => setShowModal(false)} size='sm'>
        <Modal.Header closeButton>
          <Modal.Title>Altere sua senha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Insira sua senha atual <i onClick={() => setToggle(!toggleType)} className={`bi bi-eye${toggleType ? '' : '-slash'}`}/></Form.Label>
              <Form.Control type={toggleType ? 'text' : 'password'} autoFocus onChange={(e) => setSenhaAtual(e.target.value)} value={senhaAtual}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Nova senha <i onClick={() => setToggle(!toggleType)} className={`bi bi-eye${toggleType ? '' : '-slash'}`}/></Form.Label>
              <Form.Control type={toggleType ? 'text' : 'password'} autoFocus onChange={(e) => setNovaSenha(e.target.value)} value={novaSenha}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Confirmar senha</Form.Label>
              <Form.Control type={toggleType ? 'text' : 'password'} onChange={(e) => setConfirmarSenha(e.target.value)} value={confirmarSenha}/>
            </Form.Group>
          </Form>
          {mensagem !== '' &&
            <Alert variant='secondary' dismissible>
                {mensagem}
            </Alert>
        }
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-danger' onClick={alterarSenha}>
            Alterar <i className='bi bi-floppy-fill'/>
          </button>
        </Modal.Footer>
      </Modal>
      </>
    );
}

export default NavbarTop;