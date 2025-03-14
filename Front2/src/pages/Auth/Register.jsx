import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TermsAndConditions from '../../components/legal/TermsAndCondition'; // Asegúrate de crear este componente

function Register() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false); // Estado para mostrar el modal
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    // Simula un registro exitoso
    console.log('Registro exitoso');
    navigate('/dashboard');
  };

  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleCloseTermsModal = () => setShowTermsModal(false);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="justify-content-center">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Registrarse</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Introduce tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Introduce tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Introduce tus apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Introduce tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Repite tu contraseña"
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
                        Acepto los <span style={{ color: 'blue', cursor: 'pointer' }} onClick={handleShowTermsModal}>términos y condiciones</span>
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
  );
}

export default Register;