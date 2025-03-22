import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getAllShower } from '@/services/activeShower.jsx';
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { formatDate } from '@/pipe/formatDate.jsx';

const ActiveShower = () => {
    const [showerDetails, setShowerDetails] = useState();
    const [selectedShower, setSelectedShower] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        const fetchShowerDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAllShower();
                console.log(response);
                if (response && response.shower) {
                    setShowerDetails(response.shower);
                } else {
                    setError('Error: No se recibieron datos de la API.');
                }
            } catch (error) {
                console.error('Error fetching meteor shower details:', error);
                setError('Error al obtener los detalles de la lluvia de meteoros.');
            } finally {
                setLoading(false);
            }
        };

        fetchShowerDetails();
    },);

    const handleShowDetails = (shower) => {
        setSelectedShower(shower);
        // Scroll to the iframe section after the state has been updated and the iframe is rendered
        setTimeout(() => {
            iframeRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    };

    return (
        <Container className="mb-4">
            <Row>
                <Col>
                    <div className="table-responsive mb-4 mt-4">
                        <Table striped bordered hover>
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">Identificador</th>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Fecha inicio</th>
                                    <th scope="col">Fecha fin</th>
                                    <th scope="col">Velocidad</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {showerDetails && showerDetails.length > 0 ? (
                                    showerDetails.map((shower, index) => (
                                        <tr key={index}>
                                            <td>{shower.Identificador}</td>
                                            <td>{shower.Nombre}</td>
                                            <td>{shower.Fecha_Inicio ? formatDate(shower.Fecha_Inicio) : ''}</td>
                                            <td>{shower.Fecha_Fin ? formatDate(shower.Fecha_Fin) : ''}</td>
                                            <td>{shower.Velocidad}</td>
                                            <td>
                                                {shower.src ? (
                                                    <Button
                                                        style={{ backgroundColor: '#980100', border: '#980100' }}
                                                        onClick={() => handleShowDetails(shower)}
                                                        size="sm"
                                                    >
                                                        Mostrar
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted"></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">No hay lluvias de meteoros activas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

            {selectedShower?.src && (
                <Row ref={iframeRef}>
                    <Col>
                        <h2 className="mb-3">Lluvia de meteoros: {selectedShower.Identificador} - {selectedShower.Nombre}</h2>
                        <div className="position-relative" style={{ height: '800px' }}>
                            <iframe
                                src={`https://www.meteorshowers.org/view/${selectedShower.src}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title={`Información de la lluvia de meteoros ${selectedShower.Identificador}`}
                            ></iframe>
                        </div>
                        <div className="mt-3">
                            <Button variant="secondary" onClick={() => setSelectedShower(null)}>
                                Ocultar
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ActiveShower;