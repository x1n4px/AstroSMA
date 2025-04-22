import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
// Internationalization
import { useTranslation } from 'react-i18next';
import { isNotQRUser, isAdminUser } from '../../utils/roleMaskUtils';

const Navbar = () => {
  const { t, i18n } = useTranslation(['text']);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
    window.location.reload();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const roleMask = (localStorage.getItem('rol'));

  return (
    <BootstrapNavbar style={{ backgroundColor: '#980100' }} expand="lg" expanded={expanded} >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="https://www.astromalaga.es/" className="d-flex align-items-center">
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgba(255, 255, 255, 1)", marginRight: "0.5rem" }}>
            <path d="M20.92 2.38A15.72 15.72 0 0 0 17.5 2a8.26 8.26 0 0 0-6 2.06Q9.89 5.67 8.31 7.27c-1.21-.13-4.08-.2-6 1.74a1 1 0 0 0 0 1.41l11.3 11.32a1 1 0 0 0 1.41 0c1.95-2 1.89-4.82 1.77-6l3.21-3.2c3.19-3.19 1.74-9.18 1.68-9.43a1 1 0 0 0-.76-.73zm-2.36 8.75L15 14.67a1 1 0 0 0-.27.9 6.81 6.81 0 0 1-.54 3.94L4.52 9.82a6.67 6.67 0 0 1 4-.5A1 1 0 0 0 9.39 9s1.4-1.45 3.51-3.56A6.61 6.61 0 0 1 17.5 4a14.51 14.51 0 0 1 2.33.2c.24 1.43.62 5.04-1.27 6.93z"></path><circle cx="15.73" cy="8.3" r="2"></circle><path d="M5 16c-2 1-2 5a7.81 7.81 0 0 0 5-2z"></path>
          </svg> */}
          <img src="/Logo-50-SMA.webp" alt="AstroUMA" style={{ width: '100px', height: 'auto', marginRight: '0.5rem' }} />
          {/* <span className="font-weight-bold text-uppercase text-white" style={{ fontSize: '1.5rem' }}>AstroUMA</span> */}
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" onClick={() => setExpanded(expanded ? false : "expanded")} />
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/dashboard" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_HOME')}</Nav.Link>
            <Nav.Link as={Link} to="/active-rain" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_ACTIVE_RAIN')}</Nav.Link>
            <Nav.Link as={Link} to="/station" onClick={() => setExpanded(false)} style={{ color: 'white' }}>{t('NAVBAR.BTN_STATIONS')}</Nav.Link>
            {(isNotQRUser(roleMask)) ? (
              <Dropdown style={{ marginRight: '1rem' }}>
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
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                <img src={`/flag/${i18n.language}.webp`} alt={i18n.language.toUpperCase()} style={{ width: '20px' }} />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: 'auto' }}>
                <Dropdown.Item onClick={() => changeLanguage('en')}>
                  <img src="/flag/en.webp" alt="English" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('es')}>
                  <img src="/flag/es.webp" alt="Spanish" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('fr')}>
                  <img src="/flag/fr.webp" alt="French" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ge')}>
                  <img src="/flag/ge.webp" alt="Germany" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('jp')}>
                  <img src="/flag/jp.webp" alt="日本語" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('rs')}>
                  <img src="/flag/rs.webp" alt="Russian" style={{ width: '20px' }} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ua')}>
                  <img src="/flag/ua.webp" alt="Ukrainian" style={{ width: '20px' }} />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;