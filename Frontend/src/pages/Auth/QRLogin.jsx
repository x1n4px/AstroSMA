import React, { useEffect, useState } from 'react';
import { QRLogin } from '@/services/authService.jsx';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getNextEvent } from '../../services/eventService'
import { formatDate } from '../../pipe/formatDate'

function QRLoginC({ onLogin }) {
  const navigate = useNavigate();
  const [isEventTime, setIsEventTime] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [eventPassed, setEventPassed] = useState(false);
  const [eventDate, setEventDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventDescription, setEventDescription] = useState(null);
  const [noEventScheduled, setNoEventScheduled] = useState(false);

  const fetchData = async () => {
    try {
      const responseD = await getNextEvent();

      if (responseD) {
        setEventDate(new Date(responseD.event_date));
        setStartTime(responseD.startTime || '00:00');
        setEndTime(responseD.endTime || '23:59');
        setEventDescription(responseD.description);
      } else {
        setNoEventScheduled(true);
      }
    }
    catch (error) {
      console.error('Error fetching event date:', error);
      setNoEventScheduled(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (eventDate && startTime && endTime) {
      const checkEventStatus = () => {
        const now = new Date();
        const today = new Date(now.toDateString());
        
        // Parse start and end times
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const eventStart = new Date(eventDate);
        eventStart.setHours(startHours, startMinutes, 0, 0);
        
        const eventEnd = new Date(eventDate);
        eventEnd.setHours(endHours, endMinutes, 0, 0);
        
        if (now >= eventStart && now <= eventEnd) {
          setIsEventTime(true);
          setEventPassed(false);
        } else if (now > eventEnd) {
          setEventPassed(true);
          setIsEventTime(false);
        } else {
          setIsEventTime(false);
          setEventPassed(false);
          calculateTimeLeft(eventStart);
        }
      };

      checkEventStatus();
      const interval = setInterval(checkEventStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [eventDate, startTime, endTime]);

  useEffect(() => {
    if (isEventTime) {
      const fetchQRCode = async () => {
        try {
          const { token, rol } = await QRLogin('1234');
          onLogin(token, rol);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error fetching QR Code:', error);
          setErrorMessage(
            <Card className="text-center" style={{ backgroundColor: '#fff', color: '#333', borderColor: '#980100' }}>
              <Card.Body>
                <Card.Title style={{ color: '#980100' }}>¡Houston, tenemos un problema!</Card.Title>
                <Card.Text>Parece que hubo un error al conectar con el servidor.</Card.Text>
                <Card.Text>Por favor, inténtalo de nuevo más tarde.</Card.Text>
              </Card.Body>
            </Card>
          );
        }
      };

      fetchQRCode();
    }
  }, [isEventTime, onLogin, navigate]);

  const calculateTimeLeft = (eventStart) => {
    const difference = eventStart.getTime() - new Date().getTime();
    if (difference > 0) {
      setTimeLeft(difference);
    } else {
      setTimeLeft(0);
    }
  };

  const formatTimeLeft = () => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const addToGoogleCalendar = () => {
    if (eventDate && eventDescription && startTime && endTime) {
      const startDateTime = new Date(eventDate);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const endDateTime = new Date(eventDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Format for Google Calendar (YYYYMMDDTHHMMSSZ)
      const startISO = startDateTime.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');
      const endISO = endDateTime.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');
      
      const eventTitle = encodeURIComponent(eventDescription);
      const eventDetails = encodeURIComponent("Evento astronómico organizado por AstroUMA");
      const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startISO}/${endISO}&details=${eventDetails}`;
      window.open(calendarUrl, '_blank');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card style={{ backgroundColor: '#fff', color: '#333', borderColor: '#980100', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <Card.Body className="text-center">
                <img src="/Logo-50-SMA.webp" alt="Logo" className="mb-4" style={{ maxWidth: '150px' }} />
                <Card.Title className="mb-4" style={{ color: '#980100', fontSize: '24px' }}>Acceso al Evento</Card.Title>
                {errorMessage ? (
                  errorMessage
                ) : noEventScheduled ? (
                  <Card.Text>No hay eventos programados por el momento. Por favor, vuelve a consultar más tarde.</Card.Text>
                ) : isEventTime ? (
                  <Card.Text>El evento está en curso. Por favor, escanea el código QR para acceder.</Card.Text>
                ) : eventPassed ? (
                  <Card.Text>El evento ha finalizado. Gracias por tu interés.</Card.Text>
                ) : (
                  <>
                    <Card.Text className="mb-4">El evento comenzará en:</Card.Text>
                    <div style={{ fontSize: '2em', color: '#980100', fontWeight: 'bold' }}>{formatTimeLeft()}</div>
                    <Card.Text className="mt-3">
                      Horario del evento: {startTime} - {endTime}
                    </Card.Text>
                    <Button 
                      style={{ color: '#980100', borderColor: '#980100' }}
                      variant="outline-danger" 
                      onClick={addToGoogleCalendar} 
                      className="mt-3"
                    >
                      Añadir a Google Calendar
                    </Button>
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