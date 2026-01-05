import styled from "styled-components";

export const Container = styled.div`
    .breadcrumb-item.active {
    color:#d1d1d1bf !important;
    }

    .breadcrumb-item+.breadcrumb-item::before {
    color: #d1d1d1bf !important;
    }

    .nav-tabs .nav-link.active {
    color: #edf6f9;
    background-color: #444;
    border: 1px solid rgba(145, 158, 171, .32);
    border-bottom: none;
    }


    .nav-tabs {
    --bs-nav-tabs-border-color: rgba(145, 158, 171, .32);
    --bs-nav-tabs-border-radius: 0.6rem;
    }

    .nav-tabs .nav-link:hover {
    border-color: rgba(145, 158, 171, .32);
    }

    .nav-item .nav-link {
    background-color: #2d2d2dbf;
    color: #5f5f5fbf;
    }
`;