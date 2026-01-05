import styled from "styled-components";

const Container = styled.div`
    background-color: #444;
    border-radius: 0 0 6px 6px;
    border: 1px solid rgba(145, 158, 171, .32);
    border-top: none;
    padding: 1rem 2rem;
    margin-top: -1px;

    hr {
        color: rgba(145, 158, 171, .32);
        opacity: 1;
    }

    .form-group label {
        text-wrap: nowrap;
    }
`;

type Props = {
    children: React.ReactNode;
}
const ViagemContainer = ({children}: Props) => {
    return(
        <Container>
            {children}
        </Container>
    );
}

export default ViagemContainer;