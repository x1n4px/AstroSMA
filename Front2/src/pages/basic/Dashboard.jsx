import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav} from 'react-bootstrap';

function Dashboard() {
  const navigate = useNavigate();


  return (
    <Container fluid>
      <Row className="justify-content-center  mt-4">
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Gráfica 1</Card.Title>
              {/* Aquí iría el componente de la gráfica 1 */}
              <div style={{ height: '300px', backgroundColor: '' }}>
                {/* Simulamos la gráfica con un div */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Gráfica 2</Card.Title>
              {/* Aquí iría el componente de la gráfica 2 */}
              <div style={{ height: '300px', backgroundColor: '#e0e0e0' }}>
                {/* Simulamos la gráfica con un div */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Gráfica 3</Card.Title>
              {/* Aquí iría el componente de la gráfica 3 */}
              <div style={{ height: '300px', backgroundColor: '#d0d0d0' }}>
                {/* Simulamos la gráfica con un div */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Gráfica 4</Card.Title>
              {/* Aquí iría el componente de la gráfica 4 */}
              <div style={{ height: '300px', backgroundColor: '#c0c0c0' }}>
                {/* Simulamos la gráfica con un div */}
              </div>
              <Nav.Link as={Link} to="/report/4/bolide/1" style={{ color: 'black' }}>boton</Nav.Link>
            </Card.Body>
          </Card>
        </Col>
        
      </Row>
    </Container>
  );
}

export default Dashboard;