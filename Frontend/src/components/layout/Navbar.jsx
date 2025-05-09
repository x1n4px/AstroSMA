import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
// Internationalization
import { useTranslation } from 'react-i18next';
import { isNotQRUser, isAdminUser } from '../../utils/roleMaskUtils';

// You will need to import a CSS file where you define the
// .navbar-70-width-container class, for example:
// import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation(['text']);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('config');
    localStorage.removeItem('loginTime');
    navigate('/');
    window.location.reload();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const roleMask = (localStorage.getItem('rol'));

  return (
    <BootstrapNavbar style={{ backgroundColor: '#980100' }} expand="lg" expanded={expanded} onToggle={setExpanded}> {/* Use onToggle */}
      {/* Add the custom class 'navbar-70-width-container' to the Container */}
      <Container className="navbar-70-width-container">
        <BootstrapNavbar.Brand as={Link} to="https://www.astromalaga.es/" className="d-flex align-items-center">
          <img src="/Logo-50-SMA.webp" alt="AstroUMA" style={{ width: '100px', height: 'auto', marginRight: '0.5rem' }} />
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" /> {/* onToggle on Navbar handles expanded state */}
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/dashboard" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_HOME')}</Nav.Link>
            <Nav.Link as={Link} to="/active-rain" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_ACTIVE_RAIN')}</Nav.Link>
            <Nav.Link as={Link} to="/station" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_STATIONS')}</Nav.Link>
            {(isNotQRUser(roleMask)) ? (
              <Dropdown align="end" style={{ marginRight: '1rem' }}> {/* Added align="end" to keep dropdown on the right */}
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  {t('NAVBAR.BTN_PROFILE')}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                    {t('NAVBAR.BTN_PROFILE')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    {t('NAVBAR.BTN_LOGOUT')}
                  </Dropdown.Item>
                  {isAdminUser(roleMask) && (
                    <Dropdown.Item as={Link} to="/admin-panel" onClick={() => setExpanded(false)}>
                      Panel de administrador
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link onClick={handleLogout} style={{ color: 'white' }}> {t('NAVBAR.BTN_LOGOUT')}</Nav.Link>
            )}
            {/* Language Dropdown */}
            <Dropdown align="end"> {/* Added align="end" to keep dropdown on the right */}
              <Dropdown.Toggle variant="outline-light" id="language-dropdown"> {/* Changed id for clarity */}
                <img src={`/flag/${i18n.language}.webp`} alt={i18n.language.toUpperCase()} style={{ width: '20px' }} />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: 'auto' }}>
                <Dropdown.Item onClick={() => changeLanguage('en')}>
                  <img src="/flag/en.webp" alt="English" style={{ width: '20px', marginRight: '0.5rem' }} /> English
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('es')}>
                  <img src="/flag/es.webp" alt="Spanish" style={{ width: '20px', marginRight: '0.5rem' }} /> Español
                </Dropdown.Item>
                {/* Uncomment and add more language options as needed */}
                {/*
                <Dropdown.Item onClick={() => changeLanguage('fr')}>
                  <img src="/flag/fr.webp" alt="French" style={{ width: '20px', marginRight: '0.5rem' }} /> Français
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('de')}> {/* Use 'de' for German code */}
                {/* <img src="/flag/ge.webp" alt="German" style={{ width: '20px', marginRight: '0.5rem' }} /> Deutsch
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ja')}> {/* Use 'ja' for Japanese code */}
                {/* <img src="/flag/jp.webp" alt="Japanese" style={{ width: '20px', marginRight: '0.5rem' }} /> 日本語
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ru')}> {/* Use 'ru' for Russian code */}
                {/* <img src="/flag/rs.webp" alt="Russian" style={{ width: '20px', marginRight: '0.5rem' }} /> Русский
                </Dropdown.Item>
                 <Dropdown.Item onClick={() => changeLanguage('uk')}> {/* Use 'uk' for Ukrainian code */}
                {/* <img src="/flag/ua.webp" alt="Ukrainian" style={{ width: '20px', marginRight: '0.5rem' }} /> Українська
                </Dropdown.Item>
                */}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;