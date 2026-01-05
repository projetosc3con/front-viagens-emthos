import styled from "styled-components";

export const Container = styled.div`
    i {
        cursor: pointer;
    }
    
    .tree-root {
        background-color: #444;
        margin-bottom: 2rem;
        border-radius: .25rem;
        border: 1px solid rgba(145, 158, 171, .32);
        padding: 1rem 0rem;
    }

    .tree-root > span {
        margin-left: 1.75rem;
    }    

    .tree-children {
        border-left: 2px solid #B85A5A;
        margin-left: 2.2rem;
        padding-top: .5rem;
    }

    .tree-children > .last-children {
        border-left: 2px solid transparent !important;
        border-image: linear-gradient(to bottom, #B85A5A 68%, transparent 50%) 1 100%;
    }

    .tree-children > .main-tree {
        border-left: 2px solid transparent !important;
        border-image: linear-gradient(to bottom, #B85A5A 10%, transparent 10%) 1 100%;
    }

    .node-line {
        height: 2px;
        width: 1.25rem;
        border-top: 2px solid #B85A5A;
        position: absolute;
        margin-top: .75rem;
    }

    .node-label {
        margin-left: 1.75rem;
    }

    
`;