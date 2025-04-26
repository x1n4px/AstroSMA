import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '@/services/authService';

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

      const { token, rol } = await loginUser(email, password, isMobile);
      onLogin(token, rol);
      navigate('/dashboard');
    } catch (error) {
      setError(<>
        {t('REGISTER.ERROR.CREDENTIALS')}
      </>);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
      <Container className="d-flex justify-content-center align-items-center vh-100">
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
                <Button variant="outline-secondary" className="w-100" as={Link} to="/register" style={{ color: '#980100', borderColor: '#980100' }}>
                  {t('LOGIN.REGISTER_BTN')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {showLogos && (
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          {/*<Image src={'/logoSMA.webp'} alt="SMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />
          <Image src={'/logoUMA.webp'} alt="UMA Logo" style={{ maxWidth: '100px', margin: '0 5px' }} />*/}
        </div>
      )}
    </div>
  );
}

export default Login;