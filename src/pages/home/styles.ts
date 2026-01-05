import styled from "styled-components";

export const Container = styled.div`
    .card-overflow {
        max-height: 250px;
        overflow-y: auto;
    }

    .card-overflow::-webkit-scrollbar {
            width: .65rem;
        }
    .card-overflow::-webkit-scrollbar-thumb {
        background: #888;        /* Cor da "bolinha" */
        border-radius: 0.5rem;
        border: 2px solid #888; 
    }
`;