import styled from 'styled-components';

type Props = {
    children?: React.ReactNode;
}

const Container = styled.div`
    color: #fff;
`

const Content = ({children} : Props) => {
    return (
        <Container className='container-sm pt-5'>
            {children}
        </Container>
    )
}

export default Content;