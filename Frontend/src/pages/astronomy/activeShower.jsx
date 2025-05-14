import React, { useEffect, useState, useRef } from 'react';
import { getAllShower } from '@/services/activeShower.jsx';
import { Table, Button, Container, Row, Col, Tab, Tabs } from "react-bootstrap";
import { formatDate } from '@/pipe/formatDate.jsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ActiveShower = () => {
    const { t } = useTranslation(['text']);

    const [showerDetails, setShowerDetails] = useState();
    const [IAUShowerDetails, setIAUShowerDetails] = useState([]);
    const [selectedShower, setSelectedShower] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('tabA'); // Estado para controlar la pestaña activa
    const iframeRef = useRef(null);

    const showerCode = {
        "CAP": "Alpha-Capricornids",
        "ETA": "Eta-Aquariids",
        "GEM": "Geminids",
        "LEO": "Leonids",
        "LYR": "Lyrids",
        "NTA": "Northern-Taurids",
        "ORI": "Orionids",
        "PER": "Perseids",
        "QUA1": "Quadrantids",
        "QUA2": "Quadrantids",
        "QUA": "Quadrantids",
        "SDA": "Southern-Delta-Aquariids",
        "STA": "Southern-Taurids",
        "URS": "Ursids"
    }

    useEffect(() => {
        const fetchShowerDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAllShower();
                console.log('API Response:', response);
                if (response && response.shower) {
                    setShowerDetails(response.shower);
                    setIAUShowerDetails(response.IAUShower);
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
    }, []);

    const handleShowDetails = (shower) => {
        setSelectedShower(shower);
        setTimeout(() => {
            iframeRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    };

    return (
        <Container className="mb-4 mt-4">
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="tabA" title="IMO">
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
                                                    <td> <Link to={`/shower-info/${shower.Identificador}`} target="_blank" rel="noopener noreferrer">
                                                        {shower.Nombre}
                                                    </Link></td>
                                                    <td>{shower.Fecha_Inicio ? formatDate(shower.Fecha_Inicio) : ''}</td>
                                                    <td>{shower.Fecha_Fin ? formatDate(shower.Fecha_Fin) : ''}</td>
                                                    <td>{shower.Velocidad}</td>
                                                    <td>
                                                        {showerCode[shower.Identificador] ? (
                                                            <Button
                                                                style={{ backgroundColor: '#980100', border: '#980100' }}
                                                                onClick={() => handleShowDetails({
                                                                    ...shower,
                                                                    src: showerCode[shower.Identificador]
                                                                })}
                                                                size="sm"
                                                            >
                                                                {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
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
                </Tab>

                <Tab eventKey="tabB" title="IAU">
                    <div className="table-responsive mb-4 mt-4">
                        <Table striped bordered hover>
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">Code</th>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Actividad</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {IAUShowerDetails && IAUShowerDetails.length > 0 ? (
                                    IAUShowerDetails.map((shower, index) => (
                                        <tr key={index}>
                                            <td>{shower.Code}</td>
                                            <td>{shower.ShowerNameDesignation}</td>
                                            <td>{(shower.SubDate)}</td>
                                            <td>{shower.Activity}</td>
                                            <td>
                                                {showerCode[shower.Code] ? (
                                                    <Button
                                                        style={{ backgroundColor: '#980100', border: '#980100' }}
                                                        onClick={() => handleShowDetails({
                                                            ...shower,
                                                            src: showerCode[shower.Code]
                                                        })}
                                                        size="sm"
                                                    >
                                                        {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
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
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ActiveShower;