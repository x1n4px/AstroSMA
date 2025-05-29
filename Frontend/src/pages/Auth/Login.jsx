import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '@/services/authService';
import LanguageNavbar from '@/components/layout/LanguageNavbar';

// Internationalization
import { useTranslation } from 'react-i18next';

function Login({ onLogin }) {
  const { t } = useTranslation(['text']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogos, setShowLogos] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setShowLogos(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

      const { token, rol, config } = await loginUser(email, password, isMobile);
      if (config) {
        localStorage.setItem('config', JSON.stringify(config));
      }

      onLogin(token, rol);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.response.status === 403);
      if (error.response.status === 403) {
        setError(t('REGISTER.ERROR.FORBIDDEN'));
      } else if (error.response.status === 404) {
        setError(t('REGISTER.ERROR.NOT_FOUND'));
      } else if (error.response.status === 401) {
        setError(t('REGISTER.ERROR.CREDENTIALS'));
      } else {
        setError(t('REGISTER.ERROR.GENERAL'));
      }
    }
  };

  return (
    // Apply flexbox to the root div to manage vertical space
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LanguageNavbar />
      {/* The main content area will now take up the remaining vertical space */}
      <Container className="d-flex justify-content-center align-items-center flex-grow-1">
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card style={{ borderColor: '#980100', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <Card.Body>
                <div className="text-center mb-4">
                  <Image src="/Logo-50-SMA.webp" alt="Logo" style={{ maxWidth: '150px' }} />
                </div>
                <Card.Title className="text-center mb-4" style={{ color: '#980100', fontSize: '24px' }}>{t('LOGIN.TITLE')}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('LOGIN.EMAIL')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="abc@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('LOGIN.PASSWORD')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="****"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Button variant="primary" type="submit" className="w-100 mb-3" style={{ backgroundColor: '#980100', borderColor: '#980100' }}>
                    {t('LOGIN.TITLE')}
                  </Button>
                </Form>
                <Button variant="outline-secondary" className="w-100 mb-3" as={Link} to="/register" style={{ color: '#980100', borderColor: '#980100' }}>
                  {t('LOGIN.REGISTER_BTN')}
                </Button>
                <Button variant="outline-secondary" className="w-100" as={Link} to="/qr-login" style={{ color: '#980100', borderColor: '#980100' }}>
                  {t('LOGIN.LOGIN_PASSWORLESS')}
                </Button>
                <div className="text-center mt-3">
                  <a href="/reset-password" className=" d-inline-block" style={{ color: '#980100', borderColor: '#980100' }}>
                    {t('LOGIN.FORGOT_PASSWORD')}
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {showLogos && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}> {/* Use position: fixed */}
          {/*<Image src={'/logoSMA.webp'} alt="SMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />
          <Image src={'/logoUMA.webp'} alt="UMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />*/}
        </div>
      )}
    </div>
  );
}

export default Login;