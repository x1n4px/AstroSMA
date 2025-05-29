import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageNavbar = () => {
  const { i18n } = useTranslation(); // No need for 't' if only changing language
  const [expanded, setExpanded] = useState(false);

  // Function to change the application's language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setExpanded(false); // Close the navbar menu after selecting a language
  };

  return (
    <BootstrapNavbar style={{ backgroundColor: '#f8f9fa' }} expand="lg" expanded={expanded} onToggle={setExpanded}>
      <Container className="navbar-70-width-container">
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            {/* English Language Option */}
            <Nav.Link onClick={() => changeLanguage('en')} style={{ color: 'white' }}>
              <img src="/flag/en.webp" alt="English" style={{ width: '20px', marginRight: '0.1rem' }} />
            </Nav.Link>
            {/* Spanish Language Option */}
            <Nav.Link onClick={() => changeLanguage('es')} style={{ color: 'white' }}>
              <img src="/flag/es.webp" alt="Español" style={{ width: '20px', marginRight: '0.5rem' }} />
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default LanguageNavbar;