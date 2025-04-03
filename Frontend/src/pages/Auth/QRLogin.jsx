import React, { useEffect, useState } from 'react';
import { QRLogin } from '@/services/authService.jsx';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function QRLoginC({ onLogin }) {
  const navigate = useNavigate();
  const [isEventDay, setIsEventDay] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [eventPassed, setEventPassed] = useState(false);

  const eventDate = new Date('2025-04-02T12:00:00Z'); // Reemplaza con la fecha real del evento (UTC)

  useEffect(() => {
    const today = new Date();

    if (today.getUTCDate() === eventDate.getUTCDate() &&
        today.getUTCMonth() === eventDate.getUTCMonth() &&
        today.getUTCFullYear() === eventDate.getUTCFullYear()) {
      setIsEventDay(true);
    } else if (today > eventDate) {
        setEventPassed(true);
    }else {
      setIsEventDay(false);
      calculateTimeLeft(); // Inicia el cálculo del tiempo restante
    }
  }, []);

  useEffect(() => {
    if (isEventDay) {
      const fetchQRCode = async () => {
        try {
          const { token, rol } = await QRLogin('1234');
          onLogin(token, rol);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error fetching QR Code:', error);
          setErrorMessage(
            <Card className="text-center" style={{ backgroundColor: '#111', color: '#eee', borderColor: '#980100' }}>
              <Card.Body>
                <Card.Title style={{ color: '#ff4500' }}>¡Houston, tenemos un problema!</Card.Title>
                <Card.Text>Parece que las estrellas no se alinearon correctamente.</Card.Text>
                <Card.Text>Inténtalo de nuevo, ¡quizás con la próxima luna llena!</Card.Text>
              </Card.Body>
            </Card>
          );
        }
      };

      fetchQRCode();
    }
  }, [isEventDay, onLogin, navigate]);

  useEffect(() => {
    if (!isEventDay && !eventPassed) {
      const interval = setInterval(calculateTimeLeft, 1000); // Actualiza cada segundo
      return () => clearInterval(interval);
    }
  }, [isEventDay, eventPassed]);

  const calculateTimeLeft = () => {
    const difference = eventDate - new Date();
    if (difference > 0) {
      setTimeLeft(difference);
    } else {
      setTimeLeft(0);
    }
  };

  const formatTimeLeft = () => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`; // Solo horas, minutos y segundos
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card style={{ backgroundColor: '#111', color: '#eee', borderColor: '#980100' }}>
              <Card.Body className="text-center">
                <img src="/Logo-50-SMA.webp" alt="Logo" className="mb-4" style={{ maxWidth: '150px' }} />
                <Card.Title className="mb-4">¡Acceso Estelar!</Card.Title>
                {errorMessage ? (
                  errorMessage
                ) : isEventDay ? (
                  <Card.Text>¡Escanea el código QR y prepárate para el despegue!</Card.Text>
                ) : eventPassed ? (
                    <Card.Text>¡El evento ya ha orbitado la Tierra! ¡Nos vemos en la próxima lluvia de estrellas!</Card.Text>
                ) : (
                  <>
                    <Card.Text className="mb-4">¡El portal estelar se abrirá en!</Card.Text>
                    {timeLeft > (1000 * 60 * 60 * 24) ? ( // Muestra los días solo si faltan más de 24 horas
                      <div style={{ fontSize: '2.5em', color: '#fff' }}>{Math.floor(timeLeft / (1000 * 60 * 60 * 24))} días, {formatTimeLeft()}</div>
                    ) : (
                      <div style={{ fontSize: '4.5em', color: '#fff' }}>{formatTimeLeft()}</div> // Resalta el temporizador sin días
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default QRLoginC;