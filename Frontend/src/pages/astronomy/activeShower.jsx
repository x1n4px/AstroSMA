import React, { useEffect, useMemo, useState, useRef } from 'react';
import { getAllShower } from '@/services/activeShower.jsx';
import { Table, Button, Container, Row, Col, Tab, Tabs, Form } from "react-bootstrap";
import { formatDate } from '@/pipe/formatDate.jsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const getStartYear = (shower) => {
    const startDate = shower?.Fecha_Inicio ? new Date(shower.Fecha_Inicio) : null;
    const year = startDate?.getFullYear();

    return Number.isInteger(year) ? String(year) : '';
};

const getAvailableStartYears = (showers = []) => {
    return Array.from(new Set(showers.map(getStartYear).filter(Boolean)))
        .sort((yearA, yearB) => Number(yearB) - Number(yearA));
};

const ActiveShower = () => {
    const { t } = useTranslation(['text']);

    const [showerDetails, setShowerDetails] = useState();
    const [IAUShowerDetails, setIAUShowerDetails] = useState([]);
    const [selectedShower, setSelectedShower] = useState(null);
    const [selectedIMOYears, setSelectedIMOYears] = useState([]);
    const [, setLoading] = useState(true);
    const [, setError] = useState(null);
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
                    setSelectedIMOYears(getAvailableStartYears(response.shower));
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

    const availableIMOYears = useMemo(() => getAvailableStartYears(showerDetails || []), [showerDetails]);

    const groupedIMOShowers = useMemo(() => {
        const selectedYears = new Set(selectedIMOYears);

        return (showerDetails || []).reduce((groups, shower) => {
            const startYear = getStartYear(shower);

            if (!startYear || !selectedYears.has(startYear)) {
                return groups;
            }

            return {
                ...groups,
                [startYear]: [...(groups[startYear] || []), shower]
            };
        }, {});
    }, [selectedIMOYears, showerDetails]);

    const handleIMOYearChange = (year) => {
        setSelectedIMOYears(currentYears => (
            currentYears.includes(year)
                ? currentYears.filter(currentYear => currentYear !== year)
                : [...currentYears, year].sort((yearA, yearB) => Number(yearB) - Number(yearA))
        ));
    };

    const handleSelectAllIMOYears = () => {
        setSelectedIMOYears(availableIMOYears);
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
                            {availableIMOYears.length > 0 && (
                                <div className="mb-3 mt-4">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                                        <h2 className="h5 mb-0">Años de inicio</h2>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleSelectAllIMOYears}
                                            disabled={selectedIMOYears.length === availableIMOYears.length}
                                        >
                                            Seleccionar todos
                                        </Button>
                                    </div>
                                    <div className="d-flex flex-wrap gap-3">
                                        {availableIMOYears.map(year => (
                                            <Form.Check
                                                key={year}
                                                id={`imo-year-${year}`}
                                                type="checkbox"
                                                label={year}
                                                checked={selectedIMOYears.includes(year)}
                                                onChange={() => handleIMOYearChange(year)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="table-responsive mb-4 mt-4">
                                {availableIMOYears.length > 0 && selectedIMOYears.length > 0 ? (
                                    availableIMOYears
                                        .filter(year => selectedIMOYears.includes(year))
                                        .map(year => (
                                            <div key={year} className="mb-4">
                                                <h3 className="h5 mb-3">Año {year}</h3>
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
                                                        {groupedIMOShowers[year]?.map((shower) => (
                                                            <tr key={`${shower.Identificador}-${shower.Año || year}`}>
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
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ))
                                ) : selectedIMOYears.length === 0 && availableIMOYears.length > 0 ? (
                                    <Table striped bordered hover>
                                        <tbody>
                                            <tr>
                                                <td colSpan="6" className="text-center">Selecciona al menos un año para ver datos.</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                ) : (
                                    <Table striped bordered hover>
                                        <tbody>
                                            <tr>
                                                <td colSpan="6" className="text-center">No hay lluvias de meteoros activas.</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                )}
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
                                <p className="mt-3">
                                    Visualización de lluvias de meteoros cortesía de{' '}
                                    <a href="https://www.meteorshowers.org/" target="_blank" rel="noopener noreferrer">
                                        MeteorShowers.org
                                    </a>
                                    , desarrollada por Ian Webster.
                                </p>
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
                                            <td>{formatDate(shower.SubDate)}</td>
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
                                <p className="mt-3">
                                    Visualización de lluvias de meteoros cortesía de{' '}
                                    <a href="https://www.meteorshowers.org/" target="_blank" rel="noopener noreferrer">
                                        MeteorShowers.org
                                    </a>
                                    , desarrollada por Ian Webster.
                                </p>
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
