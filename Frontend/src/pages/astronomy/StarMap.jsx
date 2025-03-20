import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import StarMapChart from '@/components/chart/StarMapChart'; // Asegúrate de que la ruta sea correcta

function StarMapPage() {
  const starMapData = [
    { ra: 0, dec: 89, mag: 1 },
    { ra: 180, dec: 80, mag: 2 },
    { ra: 90, dec: 70, mag: 3 },
    { ra: 270, dec: 60, mag: 4 },
    { ra: 45, dec: 50, mag: 5 },
    { ra: 135, dec: 40, mag: 6 },
    { ra: 225, dec: 30, mag: 7 },
    { ra: 315, dec: 20, mag: 8 },
  ];

  return (
    <Container fluid style={{ height: '100vh', padding: 0 }}>
      <Row className="h-100">
        <Col className="h-100">
          <StarMapChart data={starMapData} />
        </Col>
      </Row>
    </Container>
  );
}

export default StarMapPage;