import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Bienvenido a la página principal</Card.Title>
              <Card.Text>
                Aquí puedes encontrar información importante y acceso a las funcionalidades principales de la aplicación.
              </Card.Text>
              <Link to="/dashboard">
                <Button variant="primary">Ir al Dashboard</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Información adicional</Card.Title>
              <Card.Text>
                Aquí puedes mostrar información adicional o widgets útiles para el usuario.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Últimas noticias</Card.Title>
              <Card.Text>
                Lista de las últimas noticias o actualizaciones de la aplicación.
              </Card.Text>
              <ul>
                <li>Noticia 1</li>
                <li>Noticia 2</li>
                <li>Noticia 3</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;