import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';

const Navbar = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <BootstrapNavbar bg="primary" variant="dark" expand="lg" expanded={expanded}>
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgba(255, 255, 255, 1)", marginRight: "0.5rem" }}>
                        <path d="M20.92 2.38A15.72 15.72 0 0 0 17.5 2a8.26 8.26 0 0 0-6 2.06Q9.89 5.67 8.31 7.27c-1.21-.13-4.08-.2-6 1.74a1 1 0 0 0 0 1.41l11.3 11.32a1 1 0 0 0 1.41 0c1.95-2 1.89-4.82 1.77-6l3.21-3.2c3.19-3.19 1.74-9.18 1.68-9.43a1 1 0 0 0-.76-.73zm-2.36 8.75L15 14.67a1 1 0 0 0-.27.9 6.81 6.81 0 0 1-.54 3.94L4.52 9.82a6.67 6.67 0 0 1 4-.5A1 1 0 0 0 9.39 9s1.4-1.45 3.51-3.56A6.61 6.61 0 0 1 17.5 4a14.51 14.51 0 0 1 2.33.2c.24 1.43.62 5.04-1.27 6.93z"></path><circle cx="15.73" cy="8.3" r="2"></circle><path d="M5 16c-2 1-2 5-2 5a7.81 7.81 0 0 0 5-2z"></path></svg>
                        <span className="font-weight-bold text-uppercase" style={{ fontSize: '1.5rem' }}>AstroExample</span>
                    </BootstrapNavbar.Brand>
                    <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
                    <BootstrapNavbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)} style={{ color: 'lightblue' }}>Inicio</Nav.Link>
                            <Nav.Link as={Link} to="/estaciones" onClick={() => setExpanded(false)} style={{ color: 'lightblue' }}>Estaciones</Nav.Link>
                            {/* <Nav.Link as={Link} to="/videos" onClick={() => setExpanded(false)} style={{ color: 'lightblue' }}>Videos</Nav.Link> */}
                        </Nav>
                    </BootstrapNavbar.Collapse>
                </Container>
            </BootstrapNavbar>
    );
};

export default Navbar;