import React from 'react';
import { Card, Button, Container, Row, Col, Badge, Form, Stack } from "react-bootstrap"
import { Calendar, Clock, EvStation, Pencil, Person } from "react-bootstrap-icons"
import MoonPhase from '@/components/Image/MoonPhase.jsx';
import { getReportZListFromRain } from '@/services/reportService'
import { useEffect, useState } from 'react';
import { useLogicDistance } from '@/pipe/useLogicDistance';
import { formatDate } from '@/pipe/formatDate.jsx';
import { Link, useParams } from 'react-router-dom';
import { getAllShower } from '@/services/activeShower'
import { useTranslation } from 'react-i18next';
import CurveLineChart from '@/components/chart/CurveLineChart.jsx'

const MoonReport = () => {
    const { selectedCode: selectedCodeFromParams } = useParams(); // Get selectedCode from URL params
    const { t } = useTranslation(['text']);
    const [selectedCode, setSelectedCode] = useState(selectedCodeFromParams || '');
    const [dateIn, setDateIn] = useState(null);
    const [dateOut, setDateOut] = useState(null);
    const [report, setReport] = useState([]);
    const [radiantReport, setRadiantReport] = useState([]);
    const [rain, setRain] = useState(null);
    const [phaseName, setPaseName] = useState('new moon');
    const { getDistanceLabel } = useLogicDistance();
    const [lluvias, setLluvias] = useState([]);
    const [selectedLluvia, setSelectedLluvia] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDualStationReports, setShowDualStationReports] = useState(true);
    const [showRadiantReports, setShowRadiantReports] = useState(true);
    const [showCurveGraph, setShowCurveGraph] = useState(true);
    const [showerGraph, setShowerGraph] = useState([]);
    const [membershipThreshold, setMembershipThreshold] = useState(1);
    const [distanceThreshold, setDistanceThreshold] = useState(80);


    // Cargar la lista de lluvias al inicio
    useEffect(() => {
        const fetchLluvias = async () => {
            try {
                const data = await getAllShower();
                setLluvias(data.shower);
                if (selectedCodeFromParams && data.shower.length > 0) {
                    // If we have a selectedCode from params, find and select it
                    const lluviaFromParams = data.shower.find(l => l.Identificador === selectedCodeFromParams);
                    if (lluviaFromParams) {
                        setSelectedCode(selectedCodeFromParams);
                    }
                } else if (data.shower.length > 0) {
                    setSelectedCode(data.shower[0].Identificador); // Seleccionar la primera lluvia por defecto
                }
            } catch (error) {
                console.error('Error fetching lluvias:', error);
            }
        };
        fetchLluvias();
    }, [selectedCodeFromParams]);


    // Call fetchMoonData when selectedCode is set from params
    useEffect(() => {
        if (selectedCodeFromParams && selectedCode === selectedCodeFromParams) {
            fetchMoonData();
        }
    }, [selectedCode, selectedCodeFromParams]);


    const handleLimpiar = () => {
        setSelectedCode('');
        setDateIn();
        setDateOut();
        setReport([]);
        setRadiantReport([]);
        setRain(null);
        setShowerGraph([]);
        setShowDualStationReports(false);
        setShowRadiantReports(false);
        setShowCurveGraph(false);
    };


    // Cuando cambia la lluvia seleccionada, cargar sus datos

    const fetchMoonData = async () => {
        setLoading(true);
        try {
            const data = await getReportZListFromRain(selectedCode, dateIn, dateOut, membershipThreshold, distanceThreshold);
            setReport(data.reportResults);
            setRain(data.establishedShowerDataUsed);
            setRadiantReport(data.radiantReport);
            setShowerGraph(data.showerGraph);
            // Encontrar la lluvia seleccionada en la lista
            const lluvia = lluvias.find(l => l.Code === selectedCode);
            setSelectedLluvia(data.shower);
        } catch (error) {
            handleLimpiar
            console.error('Error fetching moon data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMembershipThresholdChange = ((value) => {
        setMembershipThreshold(value);
    });

    const handleDistanceThresholdChange = ((value) => {
        setDistanceThreshold(value);
    });


    const handleSelectChange = (e) => {
        setSelectedCode(e.target.value);
    };

    return (
        <div className='min-h-screen'>
            <Container className="my-4 p-4 border rounded shadow-sm">
                <Row>
                    <Col md={6}>
                        <Form.Group controlId="lluviaSelect">
                            <Form.Label>{t('SHOWER_INFO.TITLE')}</Form.Label>
                            <Form.Select
                                value={selectedCode}
                                onChange={handleSelectChange}
                                disabled={loading}
                            >
                                <option value="">{t('SHOWER_INFO.TITLE')}</option>
                                {Array.isArray(lluvias) && lluvias.map((lluvia) => (
                                    <option key={lluvia.Identificador} value={lluvia.Identificador}>
                                        {lluvia.Identificador} - {lluvia.Nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group controlId="anioInicio">
                            <Form.Label>{t('SHOWER_INFO.START_YEAR')}</Form.Label>
                            <Form.Control
                                type="number"
                                min="1900"
                                max="2100"
                                placeholder="Ej: 2023"
                                value={dateIn}
                                onChange={(e) => setDateIn(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group controlId="anioFin">
                            <Form.Label>{t('SHOWER_INFO.END_YEAR')}</Form.Label>
                            <Form.Control
                                type="number"
                                min="1900"
                                max="2100"
                                placeholder="Ej: 2024"
                                value={dateOut}
                                onChange={(e) => setDateOut(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group controlId="membershipThreshold">
                            <Form.Label>{t('SHOWER_INFO.MEMBERSHIP_THRESHOLD')}</Form.Label>
                            <Form.Control
                                as="select"
                                value={membershipThreshold}
                                onChange={(e) => handleMembershipThresholdChange(Number(e.target.value))}
                            >
                                <option value="1">{t('DISTANCE.VERYFAR')}</option>
                                <option value="3">{t('DISTANCE.FAR')}</option>
                                <option value="5">{t('DISTANCE.CLOSE')}</option>
                                <option value="7">{t('DISTANCE.VERYCLOSE')}</option>
                            </Form.Control>
                        </Form.Group>

                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="distanceThreshold">
                            <Form.Label>{t('SHOWER_INFO.DISTANCE_THRESHOLD')}</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="200"
                                step="1"
                                placeholder="80"
                                value={distanceThreshold}
                                onChange={(e) => handleDistanceThresholdChange(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col className="d-flex justify-content-end gap-2">
                        <Button
                            variant="outline-secondary"
                            onClick={handleLimpiar}
                            disabled={loading}
                        >
                            <i className="bi bi-eraser me-2"></i>
                            {t('SHOWER_INFO.CLEAR_BTN')}
                        </Button>

                        <Button
                            style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                            onClick={fetchMoonData}
                            disabled={loading || !selectedCode}
                        >
                            <i className="bi bi-search me-2"></i>
                            {t('SHOWER_INFO.SEARCH_BTN')}
                        </Button>
                    </Col>
                </Row>
                {selectedLluvia && (
                    <Row className="mt-4 pt-4">
                        <Form className="mb-3">
                            <Stack direction="horizontal" gap={4}>
                                <Form.Check
                                    type="switch"
                                    id="dual-station-switch"
                                    label={t('SHOWER_INFO.CHECKBOX.SHOW_REPORT_Z')}
                                    value={showDualStationReports}
                                    checked={showDualStationReports}
                                    onChange={(e) => setShowDualStationReports(e.target.checked)}
                                />

                                <Form.Check
                                    type="switch"
                                    id="radiant-switch"
                                    label={t('SHOWER_INFO.CHECKBOX.SHOW_RADIANT_REPORT')}
                                    value={showRadiantReports}
                                    checked={showRadiantReports}
                                    onChange={(e) => setShowRadiantReports(e.target.checked)}
                                />

                                <Form.Check
                                    type="switch"
                                    id="radiant-switch"
                                    label={t('SHOWER_INFO.CHECKBOX.SHOW_GRAPH')}
                                    value={showCurveGraph}
                                    checked={showCurveGraph}
                                    onChange={(e) => setShowCurveGraph(e.target.checked)}
                                />
                            </Stack>
                        </Form>
                    </Row>
                )}
            </Container>

            <Container className="py-4" >
                {showCurveGraph && report.length > 0 && (
                    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                        <CurveLineChart data={showerGraph} />
                    </div>
                )}
            </Container>
            <Container className="my-4 p-4 ">
                {selectedLluvia && (
                    <div className="mt-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="p-2 rounded me-3" style={{ backgroundColor: '#980100' }}>
                                <i className="bi bi-droplet text-white fs-4"></i>
                            </div>
                            <h4 className="mb-0 " style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.TITLE')}: {selectedLluvia.Code} - {selectedLluvia.ShowerNameDesignation}</h4>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Header className="text-white" style={{ backgroundColor: '#980100' }}>
                                        <h5 className="mb-0">{t('SHOWER_INFO.DATA.BASIC_INFO')}</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.ACTIVITY')}:</strong>
                                                <span className="ms-2">{selectedLluvia.Activity}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.DATE')}:</strong>
                                                <span className="ms-2">{selectedLluvia.SubDate}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>AR:</strong>
                                                <span className="ms-2">{selectedLluvia.Ar}</span>
                                            </li>
                                            <li>
                                                <strong style={{ color: '#980100' }}>DE:</strong>
                                                <span className="ms-2">{selectedLluvia.De}</span>
                                            </li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Header className="text-white" style={{ backgroundColor: '#980100' }}>
                                        <h5 className="mb-0">{t('SHOWER_INFO.DATA.ORBITAL_PARAMS')}:</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.EXCENTRICITY')} (e):</strong>
                                                <span className="ms-2">{selectedLluvia.e}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.MAX_SEMIEJE')} (a):</strong>
                                                <span className="ms-2">{selectedLluvia.a}</span>
                                            </li>
                                            <li className="mb-2">
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.PERIHELION')} (q):</strong>
                                                <span className="ms-2">{selectedLluvia.q}</span>
                                            </li>
                                            <li>
                                                <strong style={{ color: '#980100' }}>{t('SHOWER_INFO.DATA.MIN_DISTANCE')}:</strong>
                                                <span className="ms-2">{selectedLluvia.Distancia_mínima_entre_radianes_y_trayectoria}</span>
                                            </li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Container>

            {
                loading && (
                    <Container className="text-center my-4">
                        <p>Cargando datos...</p>
                    </Container>
                )
            }

            {
                !loading && report && (
                    <Container className="py-4">

                        <Row xs={2} md={3} lg={5} className="g-4">
                            {showDualStationReports && report.map((r) => (
                                <Col key={r.hora}>
                                    <Card className="h-100 shadow-sm border-0 hover-shadow transition-all">
                                        <Card.Body className="d-flex flex-column">
                                            {/* Header con fecha y hora */}
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg='#980100' style={{ backgroundColor: '#980100' }} pill>
                                                    <Calendar className="me-1" /> {formatDate(r.fecha)}
                                                </Badge>
                                                <Badge bg="secondary" pill>
                                                    <Clock className="me-1" /> {r.hora.substring(0, 8)}
                                                </Badge>
                                            </div>

                                            {/* Contenido principal */}
                                            <div className="text-center my-3">
                                                <MoonPhase
                                                    phaseName={r.moonPhase}
                                                    eheight={60}
                                                    ewidth={60}
                                                    className="mb-2"
                                                />
                                                <Card.Title className="h6 d-flex flex-column">
                                                    <small className="text-secondary">{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</small>
                                                    {getDistanceLabel(r?.orbitalMemberships)}
                                                </Card.Title>
                                            </div>

                                            {/* Footer con botón */}
                                            <div className="mt-auto text-center">
                                                <Link
                                                    targer="_blank"
                                                    to={`/report/${r?.reportId}`}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: '#980100 1px solid',
                                                        borderRadius: '30px',
                                                        color: '#980100',
                                                        padding: '0.3rem 1rem',
                                                        textDecoration: 'none',
                                                    }}
                                                    variant="outline-primary"
                                                    size="sm"
                                                >
                                                    {t('SHOWER_INFO.SHOW_DETAILS_BTN')}
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}

                            {showRadiantReports && radiantReport?.map((r) => (
                                <Col key={r.hora}>
                                    <Card className="h-100 shadow-sm border-0 hover-shadow transition-all">
                                        <Card.Body className="d-flex flex-column">
                                            {/* Header con fecha y hora */}
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg='#980100' style={{ backgroundColor: '#980100' }} pill>
                                                    <Calendar className="me-1" /> {formatDate(r.fecha)}
                                                </Badge>
                                                <Badge bg="secondary" pill>
                                                    <Clock className="me-1" /> {r.hora.substring(0, 8)}
                                                </Badge>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Badge bg="#804000" style={{ backgroundColor: '#804000' }} pill>
                                                    <EvStation className="me-1" /> I.Radiante
                                                </Badge>
                                            </div>

                                            {/* Contenido principal */}
                                            <div className="text-center my-3">
                                                <MoonPhase
                                                    phaseName={r.moonPhase}
                                                    eheight={60}
                                                    ewidth={60}
                                                    className="mb-2"
                                                />
                                                <Card.Title className="h6 d-flex flex-column">
                                                    <small className="text-secondary">{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</small>
                                                    {getDistanceLabel(r?.distance)}
                                                </Card.Title>
                                            </div>

                                            {/* Footer con botón */}
                                            <div className="mt-auto text-center">
                                                <Link
                                                    targer="_blank"
                                                    to={`/radiant-report/${r?.reportId}`}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: '#980100 1px solid',
                                                        borderRadius: '30px',
                                                        color: '#980100',
                                                        padding: '0.3rem 1rem',
                                                        textDecoration: 'none',
                                                    }}
                                                    variant="outline-primary"
                                                    size="sm"
                                                >
                                                    {t('SHOWER_INFO.SHOW_DETAILS_BTN')}
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                )
            }
        </div >
    );
};

export default MoonReport;