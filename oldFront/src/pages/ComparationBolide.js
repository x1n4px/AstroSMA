import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form } from 'react-bootstrap';
import RadarChart from '../components/chart/RadarChart';
import { getLastTenBolide } from '../services/bolideService';

const ComparationBolide = () => {
    const [bolides, setBolides] = useState([]);
    const [error, setError] = useState(null);
    const [bolido1, setBolido1] = useState(null);
    const [bolido2, setBolido2] = useState(null);
    const [bolidosSeleccionados, setBolidosSeleccionados] = useState([]);

    

    useEffect(() => {
        const fetchBolides = async () => {
            try {
                const data = await getLastTenBolide();
                setBolides(data);
                if (data.length >= 2) {
                    setBolido1(data[data.length - 2].id);
                    setBolido2(data[data.length - 1].id);
                }
            } catch (err) {
                setError(err);
            }
        };

        fetchBolides();
    }, []);

    useEffect(() => {
        if (bolides.length > 0 && bolido1 && bolido2) {
            const nuevosBolidos = bolides.filter(
                (bolido) => bolido.id === bolido1 || bolido.id === bolido2
            );
            console.log(nuevosBolidos)
            setBolidosSeleccionados(nuevosBolidos);
        }
    }, [bolido1, bolido2, bolides]);

    const handleBolido1Change = (event) => {
        setBolido1(parseInt(event.target.value));
    };

    const handleBolido2Change = (event) => {
        setBolido2(parseInt(event.target.value));
    };

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (bolides.length === 0) {
        return <p>Cargando bólidos...</p>;
    }

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <h2 className="text-center mb-4">Comparación de Bólidos</h2>
                    <p className="text-center mb-4">
                        Selecciona dos bólidos para comparar sus características.
                    </p>
                </Col>
            </Row>
            <Row className="justify-content-center align-items-center mb-4">
                <Col xs={12} md={4}>
                    <Form.Select
                        aria-label="Selecciona el primer bólido"
                        value={bolido1}
                        onChange={handleBolido1Change}
                    >
                        <option>Selecciona el primer bólido</option>
                        {bolides.map((bolido) => (
                            <option key={bolido.id} value={bolido.id}>
                                {bolido.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Select
                        aria-label="Selecciona el segundo bólido"
                        value={bolido2}
                        onChange={handleBolido2Change}
                    >
                        <option>Selecciona el segundo bólido</option>
                        {bolides.map((bolido) => (
                            <option key={bolido.id} value={bolido.id}>
                                {bolido.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <RadarChart meteoros={bolidosSeleccionados} />
                </Col>
            </Row>
        </Container>
    );
};

export default ComparationBolide;