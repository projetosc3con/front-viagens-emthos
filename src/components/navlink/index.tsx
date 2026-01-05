import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav } from 'react-bootstrap';

interface NavLinkProps {
    to: string;
    eventKey?: string;
    children: React.ReactNode;
    className: string;
    ativo: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, eventKey, children, className, ativo}) => {
    return (
        <LinkContainer to={to} className={className}>
            <Nav.Link eventKey={eventKey} active={ativo}>{children}</Nav.Link>
        </LinkContainer>
    )
}

export default NavLink;