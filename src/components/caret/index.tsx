import styled from "styled-components";

const Container = styled.label`
    .asc {
    transform: rotate(0deg);
        }
    
    .desc {
        transform: rotate(180deg);
        }
`;

type Props = {
    direction: string;
}

const Caret = ({direction}: Props) => {
    return (
        <Container>
            <i className={`ms-2 bi bi-caret-${direction === 'asc' ? 'up' : 'down'}-fill`}/>
        </Container>
    );
};

export default Caret;