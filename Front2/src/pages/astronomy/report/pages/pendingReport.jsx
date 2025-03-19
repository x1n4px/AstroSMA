import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Pending from '@/components/chart/Pending.jsx'

const pointA = {
    lat: 40.4168,
    lon: -3.7038,
    altitude: 120,
};

const pointB = {
    lat: 41.3851,
    lon: 2.1734,
    altitude: 45,
};
const PendingReport = (data2) => {
    return (
        <Container>
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Punto A - Latitud:</Form.Label>
                        <Form.Control type="text" value={pointA.lat} readOnly />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Punto A - Longitud:</Form.Label>
                        <Form.Control type="text" value={pointA.lon} readOnly />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Punto A - Altitud:</Form.Label>
                        <Form.Control type="text" value={pointA.altitude} readOnly />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Punto B - Latitud:</Form.Label>
                        <Form.Control type="text" value={pointB.lat} readOnly />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Punto B - Longitud:</Form.Label>
                        <Form.Control type="text" value={pointB.lon} readOnly />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Punto B - Altitud:</Form.Label>
                        <Form.Control type="text" value={pointB.altitude} readOnly />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div >
                        {/* <GlobeWithComet pointA={pointA} pointB={pointB} /> */}
                        <Pending data={data2} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PendingReport