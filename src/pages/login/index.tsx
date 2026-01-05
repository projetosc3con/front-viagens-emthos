import styled from "styled-components";
import { useEffect, useState, FormEvent } from "react";
import { auth, usuarios } from "../../util/FirebaseConnection";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Modal } from "react-bootstrap";

const Container = styled.div`
    color: #edf6f9;
    background-image: url(https://firebasestorage.googleapis.com/v0/b/viagens-emthos.firebasestorage.app/o/assets%2Fbackground-emthos.jpeg?alt=media&token=affc8676-313d-483b-b5e4-e57149c9867e);
    background-position: center right;
    background-repeat: no-repeat;
    background-size: cover;
    height: 100vh;

    .background-overlay {
        background-color: #fff0;
        background-image: linear-gradient(81deg, #363636ff 0%, #4e4b4bff 100%);
        opacity: .19;
        transition: background 0.3s, border-radius 0.3s, opacity 0.3s;
        inset: 0;
        position: absolute;
    }

    .card-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
`;

const Login = () => {
    const [user, setUser] = useState<User>();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [senha2, setSenha2] = useState('');
    const [message, setMessage] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [nomeAbreviado, setNomeAbreviado] = useState('');
    const [res, setRes] = useState(false);
    const [show, setShow] = useState(false);
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            }
        });
    }, []);

    const login = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const docRef = doc(usuarios, email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await signInWithEmailAndPassword(auth, email, senha).then(async (userCredential) => {
            
            }).catch((e) => {
                if (e.code === 'auth/user-not-found') {
                    setMessage('Usuário não encontrado! Faça o cadastro clicando na aba abaixo.');
                    setRes(false);
                    setShow(true);
                }
                else if (e.code === 'auth/too-many-requests') {
                    setMessage('Muitas tentativas!');
                    setRes(false);
                    setShow(true);
                }
                else if (e.code === 'auth/invalid-credential') {
                    setMessage('E-mail ou senha incorretos!');
                    setRes(false);
                    setShow(true);
                }
                else if (e.code === 'auth/invalid-email') {
                    setMessage('Insira um e-mail valido!');
                    setRes(false);
                    setShow(true);
                }
                else {
                    setMessage('Erro ao logar: ' + e.code);
                    setRes(false);
                    setShow(true);
                }
            });
        } else {
            setMessage('Usuário não encontrado!');
            setRes(false);
            setShow(true);
        }
    }

    const registrar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (email === '' || senha === '' || senha2 === '') {
            setMessage('Preencha todos os campos!');
            setRes(false);
            setShow(true);
        } else {
            if (senha !== senha2) {
                setMessage('Senhas não coincidem!');
                setRes(false);
                setShow(true);
            } else {
                const docRef = doc(usuarios, email);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    await createUserWithEmailAndPassword(auth, email, senha).then(async (userCredential) => {
                        await updateDoc(docRef, {
                            uid: userCredential.user.uid,
                        });
                    }).catch((e) => {
                        if (e.code === 'auth/email-already-in-use') {
                            setMessage('Email já cadastrado!');
                            setRes(false);
                            setShow(true);
                        }
                        if (e.code === 'auth/weak-password') {
                            setMessage('Sua senha deve conter no minimo 6 caracteres!');
                            setRes(false);
                            setShow(true);
                        }
                        if (e.code === 'auth/invalid-email') {
                            setMessage('Insira um e-mail valido!');
                            setRes(false);
                            setShow(true);
                        }
                    });
                } else {
                    setRes(false);
                    setMessage('Email não liberado para cadastro!');
                    setShow(true);
                }
            }
        }
    };

    const recuperar = async () => {
        if (email === '') {
            setRes(false);
            setMessage('Preencha o email');
            setShow(true);
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setRes(true);
            setMessage('E-mail de recuperação de senha enviado. Verifique sua caixa de spam!');
            setShow(true);           
        } catch (error: any) {
            setRes(false);
            setMessage('Erro ao tentar enviar email de recuperação: ' + error.message);
            setShow(true);
        }
    }

    if (!toggle) {
        return (
            <Container>
                <div className="background-overlay"></div>
                <div className="card-container container">
                    <div className="card col-12 col-sm-8 col-lg-5 col-xxl-3">
                        <div className="d-flex justify-content-between">
                            <h5 className="mt-auto mb-0">Login</h5>
                            <small className="mt-auto" onClick={() => setToggle(true)}><span>primeiro acesso</span></small>
                        </div>
                        <hr/>
                        <form className="d-flex flex-column align-items-center" onSubmit={login}>
                            <div className="form-group mb-4 col-12 col-sm-9 col-md-6 col-lg-9">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" autoComplete="off" placeholder="Insira o e-mail cadastrado" onChange={(e) => setEmail(e.target.value)} value={email} required/>
                            </div>
                            <div className="form-group mb-2 col-12 col-sm-9 col-md-6 col-lg-9">
                                <label htmlFor="origem">Senha <i onClick={() => setShowPassword(!showPassword)} className={`cursor-pointer ms-2 bi bi-eye${!showPassword ? '-slash' : ''}`} /></label>
                                <input type={showPassword ? 'text' : 'password'} id="senha" autoComplete="off" placeholder="Insira sua senha" onChange={(e) => setSenha(e.target.value)} value={senha} required/>
                            </div>
                            <div className="form-group mb-4 col-12 col-sm-9 col-md-6 col-lg-9">
                                <small onClick={() => recuperar()}><span>Recuperar senha</span></small>
                            </div>
                            <div className="d-flex">
                                <button className="btn btn-danger">Acessar</button>
                                
                            </div>
                        </form>
                    </div>
                </div>

                <Modal show={show} onHide={() => setShow(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>{!toggle ? 'Login' : 'Primeiro acesso'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => setShow(false)}>Ok</button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    } else {
        return (
            <Container>
                <div className="background-overlay"></div>
                <div className="card-container container">
                    <div className="card col-12 col-sm-8 col-lg-5 col-xxl-3">
                        <div className="d-flex justify-content-between">
                            <h5 className="mt-auto mb-0">Primeiro acesso</h5>
                            <small className="mt-auto" onClick={() => setToggle(false)}><span>login</span></small>
                        </div>
                        <hr/>
                        <form className="d-flex flex-column align-items-center" onSubmit={registrar}>
                            <div className="form-group mb-4 col-12 col-sm-9 col-md-6 col-lg-9">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" autoComplete="off" placeholder="Insira o e-mail cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                            </div>
                            <div className="form-group mb-4 col-12 col-sm-9 col-md-6 col-lg-9">
                                <label htmlFor="senha">Senha<i onClick={() => setShowPassword(!showPassword)} className={`cursor-pointer ms-2 bi bi-eye${!showPassword ? '-slash' : ''}`} /></label>
                                <input type={showPassword ? 'text' : 'password'} id="senha" autoComplete="off" placeholder="Insira sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required/>
                            </div>
                            <div className="form-group mb-4 col-12 col-sm-9 col-md-6 col-lg-9">
                                <label htmlFor="senha2">Repita a senha</label>
                                <input type={showPassword ? 'text' : 'password'} id="senha2" autoComplete="off" placeholder="Repita sua senha" value={senha2} onChange={(e) => setSenha2(e.target.value)} required/>
                            </div>
                            <div className="d-flex">
                                <button className="btn btn-danger" type="submit">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>

                <Modal show={show} onHide={() => setShow(false)} >
                    <Modal.Header closeButton>
                        <Modal.Title>{res ? 'Cadastrada com sucesso' : 'Erro ao cadastrar'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-danger" onClick={() => setShow(false)}>Ok</button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

export default Login;