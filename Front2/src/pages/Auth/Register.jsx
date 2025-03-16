import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TermsAndConditions from '../../components/legal/TermsAndCondition'; // Asegúrate de crear este componente
import { registerUser } from '../../services/authService';

// Internationalization
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation(['text']);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false); // Estado para mostrar el modal
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();



    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      const token = await registerUser(email, password, firstName, lastName);
      onLogin(token);
      navigate('/dashboard');
    } catch (error) {
      setError('Credenciales incorrectas');
    }


  };

  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleCloseTermsModal = () => setShowTermsModal(false);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', position: 'relative' }}>
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row className="justify-content-center">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title className="text-center mb-4">{t('REGISTER.TITLE')}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.EMAIL')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('REGISTER.PLACEHOLDER.EMAIL')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.NAME')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('REGISTER.PLACEHOLDER.NAME')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.SURNAME')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('REGISTER.PLACEHOLDER.SURNAME')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.PASSWORD')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="****"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('REGISTER.PASSWORD_CONFIRM')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="****"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={
                        <>
                          {t('REGISTER.TERM.ACEPT')} <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleShowTermsModal}>{t('REGISTER.TERM.TERMS_AND_CONDITIONS')}</span>
                        </>
                      }
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                  </Form.Group>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Button variant="primary" type="submit" className="w-100">
                    Registrarse
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showTermsModal} onHide={handleCloseTermsModal}>
          <Modal.Header closeButton>
            <Modal.Title>Términos y condiciones</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TermsAndConditions />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseTermsModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Register;