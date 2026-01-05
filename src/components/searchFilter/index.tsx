import React from "react";
import styled from "styled-components";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Container = styled.div`
    .btn-filter {
        background-image: linear-gradient(136deg,#813030 0%,#B85A5A 100%);
        padding: 0 1rem;
        margin-right: 10px;
        color: #fff;
    }

    .dropdown-menu {
        background-color: #444;
        border-color: hsla(0, 0%, 53.3%, 0.4);
    }

    .dropdown-item {
        color: #edf6f9;
    }

    .dropdown-item:active{
        background-color: #B85A5A;
        color:rgb(255, 255, 255);
    }

    .active {
        background-color: #B85A5A;
        color:rgb(255, 255, 255);
    }

    .dropdown-item:hover{
        color: #B85A5A;
    }

    .form-control {
        background-color: transparent;
        border-color: hsla(0, 0%, 53.3%, 0.4);
        color: #edf6f9;
    }

    .form-control::placeholder {
        color: #edf6f9;
        opacity: 0.5;
    }

    .form-control:focus {
        border: 1px solid #B85A5A !important;
        outline: none; /* Remove o contorno padrão do navegador */
        box-shadow: none;
        color: #fff;
    }
`;

type Props = {
    opcoes: string[];
    valor: string;
    setValor: React.Dispatch<React.SetStateAction<string>>;
    selecionado: string;
    setSelecionado: (valor: string) => void;
}

const SearchFilter = ({valor, setValor, opcoes, setSelecionado, selecionado}: Props) => {
    return(
        <Container>
        <div className="input-group mb-3">
        <input type="text" className="form-control" onChange={(e) => setValor(e.target.value)} value={valor} aria-label="Text input with dropdown button" placeholder="Pesquisar..."/>
        <button className="btn btn-filter dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Filtrar por</button>
        <ul className="dropdown-menu dropdown-menu-end">
            {opcoes.map((opcao) => (
                <li key={opcao} className={`dropdown-item ${selecionado === opcao ? 'active' : ''}`} onClick={() => setSelecionado(opcao)}>{opcao}</li>
            ))}
        </ul>
        </div>
        </Container>
    )
}

export default SearchFilter;