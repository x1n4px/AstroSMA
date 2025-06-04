import React from 'react';
import { Card, Button, Container, Row, Col, Badge, Form, Stack, Alert } from "react-bootstrap"
import { Calendar, Clock, EvStation, Pencil, Person, ExclamationTriangle } from "react-bootstrap-icons"
import MoonPhase from '@/components/Image/MoonPhase.jsx';
import { getReportZListFromRain } from '@/services/reportService'
import { useEffect, useState } from 'react';
import { useLogicDistance } from '@/pipe/useLogicDistance';
import { formatDate } from '@/pipe/formatDate.jsx';
import { Link, useParams } from 'react-router-dom';
import { getAllShower } from '@/services/activeShower'
import { useTranslation } from 'react-i18next';
import CurveLineChart from '@/components/chart/CurveLineChart.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';

// Componente Skeleton para tarjetas
const CardSkeleton = () => (
    <Card className="h-100 shadow-sm border-0">
        <Card.Body className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="skeleton skeleton-badge" style={{ width: '80px', height: '20px' }}></div>
                <div className="skeleton skeleton-badge" style={{ width: '70px', height: '20px' }}></div>
            </div>
            <div className="text-center my-3">
                <div className="skeleton skeleton-circle mx-auto mb-2" style={{ width: '60px', height: '60px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px', margin: '0 auto' }}></div>
            </div>
            <div className="mt-auto text-center">
                <div className="skeleton skeleton-button" style={{ width: '120px', height: '32px', margin: '0 auto' }}></div>
            </div>
        </Card.Body>
    </Card>
);

// Componente Skeleton para el gráfico
const ChartSkeleton = () => (
    <div style={{ height: '400px', width: '100%', overflow: 'hidden' }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
    </div>
);

// Componente Skeleton para datos básicos
const DataSkeleton = () => (
    <Card className="mb-3 shadow-sm">
        <Card.Header className="text-white" style={{ backgroundColor: '#980100' }}>
            <div className="skeleton skeleton-text" style={{ width: '150px', height: '20px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
        </Card.Header>
        <Card.Body>
            <ul className="list-unstyled">
                {[1, 2, 3, 4].map((item) => (
                    <li key={item} className="mb-2 d-flex">
                        <div className="skeleton skeleton-text" style={{ width: '80px', height: '16px', marginRight: '10px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '120px', height: '16px' }}></div>
                    </li>
                ))}
            </ul>
        </Card.Body>
    </Card>
);

// Componente para mostrar errores
const ErrorAlert = ({ message, onRetry }) => (
    <Alert variant="danger" className="d-flex align-items-center">
        <ExclamationTriangle className="me-2" size={20} />
        <div className="flex-grow-1">
            <strong>Error:</strong> {message}
        </div>
        {onRetry && (
            <Button variant="outline-danger" size="sm" onClick={onRetry}>
                Reintentar
            </Button>
        )}
    </Alert>
);

// Componente para mostrar "sin datos"
const NoDataAlert = ({ message = "No se encontraron datos para mostrar" }) => (
    <Alert variant="info" className="text-center">
        <div className="mb-2">
            <i className="bi bi-info-circle" style={{ fontSize: '2rem' }}></i>
        </div>
        <strong>{message}</strong>
    </Alert>
);

const MoonReport = () => {
    const { selectedCode: selectedCodeFromParams } = useParams();
    const { t } = useTranslation(['text']);
    const [selectedCode, setSelectedCode] = useState(selectedCodeFromParams || '');
    const [dateIn, setDateIn] = useState('');
    const [dateOut, setDateOut] = useState('');
    const [report, setReport] = useState([]);
    const [radiantReport, setRadiantReport] = useState([]);
    const [rain, setRain] = useState(null);
    const [phaseName, setPaseName] = useState('new moon');
    const { getDistanceLabel } = useLogicDistance();
    const [lluvias, setLluvias] = useState([]);
    const [selectedLluvia, setSelectedLluvia] = useState(null);

    // Estados de carga separados
    const [loadingShowers, setLoadingShowers] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    // Estados de error
    const [showersError, setShowersError] = useState(null);
    const [dataError, setDataError] = useState(null);

    const [showDualStationReports, setShowDualStationReports] = useState(true);
    const [showRadiantReports, setShowRadiantReports] = useState(true);
    const [showCurveGraph, setShowCurveGraph] = useState(true);
    const [showerGraph, setShowerGraph] = useState([]);
    const [membershipThreshold, setMembershipThreshold] = useState(1);
    const [distanceThreshold, setDistanceThreshold] = useState(80);

    // Cargar la lista de lluvias al inicio
    useEffect(() => {
        const fetchLluvias = async () => {
            setLoadingShowers(true);
            setShowersError(null);
            try {
                const data = await getAllShower();
                setLluvias(data.shower);
                if (selectedCodeFromParams && data.shower.length > 0) {
                    const lluviaFromParams = data.shower.find(l => l.Identificador === selectedCodeFromParams);
                    if (lluviaFromParams) {
                        setSelectedCode(selectedCodeFromParams);
                    }
                } else if (data.shower.length > 0) {
                    setSelectedCode(data.shower[0].Identificador);
                }
            } catch (error) {
                console.error('Error fetching lluvias:', error);
                setShowersError('Error al cargar la lista de lluvias meteorológicas');
            } finally {
                setLoadingShowers(false);
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
        setDateIn('');
        setDateOut('');
        setReport([]);
        setRadiantReport([]);
        setRain(null);
        setShowerGraph([]);
        setSelectedLluvia(null);
        setShowDualStationReports(false);
        setShowRadiantReports(false);
        setShowCurveGraph(false);
        setDataError(null);
    };

    const fetchMoonData = async () => {
        setLoadingData(true);
        setDataError(null);
        try {
            const data = await getReportZListFromRain(selectedCode, dateIn, dateOut, membershipThreshold, distanceThreshold);
            console.log('Fetched data:', data); // Log para depuración
            setReport(data.reportResults || []);
            setRain(data.establishedShowerDataUsed);
            setRadiantReport(data.radiantReport || []);
            setShowerGraph(data.showerGraph || []);
            setSelectedLluvia(data.shower);

            // Mostrar secciones solo si hay datos
            setShowDualStationReports(data.reportResults && data.reportResults.length > 0);
            setShowRadiantReports(data.radiantReport && data.radiantReport.length > 0);
            setShowCurveGraph(data.showerGraph && data.showerGraph.length > 0);

        } catch (error) {
            console.error('Error fetching moon data:', error);
            setDataError('Error al cargar los datos del reporte. Por favor, intenta nuevamente.');
            handleLimpiar();
        } finally {
            setLoadingData(false);
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

    const retryLoadShowers = () => {
        // Reintentar cargar lluvias
        const fetchLluvias = async () => {
            setLoadingShowers(true);
            setShowersError(null);
            try {
                const data = await getAllShower();
                setLluvias(data.shower);
                if (data.shower.length > 0) {
                    setSelectedCode(data.shower[0].Identificador);
                }
            } catch (error) {
                console.error('Error fetching lluvias:', error);
                setShowersError('Error al cargar la lista de lluvias meteorológicas');
            } finally {
                setLoadingShowers(false);
            }
        };
        fetchLluvias();
    };

    return (
        <div className='min-h-screen'>
            {/* CSS para skeletons */}
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }
                
                .skeleton-badge {
                    border-radius: 12px;
                }
                
                .skeleton-circle {
                    border-radius: 50%;
                }
                
                .skeleton-button {
                    border-radius: 20px;
                }
                
                .skeleton-text {
                    border-radius: 4px;
                }
                
                @keyframes loading {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
            `}</style>

            <Container className="my-4 p-4 border rounded shadow-sm">
                {/* Error al cargar lluvias */}
                {showersError && (
                    <ErrorAlert message={showersError} onRetry={retryLoadShowers} />
                )}

                <Row>
                    <Col md={6}>
                        <Form.Group controlId="lluviaSelect">
                            <Form.Label>{t('SHOWER_INFO.TITLE')}</Form.Label>
                            {loadingShowers ? (
                                <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '6px' }}></div>
                            ) : (
                                <Form.Select
                                    value={selectedCode}
                                    onChange={handleSelectChange}
                                    disabled={loadingData}
                                >
                                    <option value="">{t('SHOWER_INFO.TITLE')}</option>
                                    {Array.isArray(lluvias) && lluvias.map((lluvia) => (
                                        <option key={lluvia.Identificador} value={lluvia.Identificador}>
                                            {lluvia.Identificador} - {lluvia.Nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
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
                                disabled={loadingData}
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
                                disabled={loadingData}
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
                                disabled={loadingData}
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
                                disabled={loadingData}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col className="d-flex justify-content-end gap-2">
                        <Button
                            variant="outline-secondary"
                            onClick={handleLimpiar}
                            disabled={loadingData || loadingShowers}
                        >
                            <i className="bi bi-eraser me-2"></i>
                            {t('SHOWER_INFO.CLEAR_BTN')}
                        </Button>

                        <Button
                            style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                            onClick={fetchMoonData}
                            disabled={loadingData || loadingShowers || !selectedCode}
                        >
                            {loadingData ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-search me-2"></i>
                                    {t('SHOWER_INFO.SEARCH_BTN')}
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>

                {/* Switches de visualización */}
                {(selectedLluvia || loadingData) && (
                    <>
                        <hr />
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
                                        disabled={loadingData}
                                    />
                                    {(report.length > 0 ? ` (${report.length})` : '')}
                                    <Form.Check
                                        type="switch"
                                        id="radiant-switch"
                                        label={t('SHOWER_INFO.CHECKBOX.SHOW_RADIANT_REPORT')}
                                        value={showRadiantReports}
                                        checked={showRadiantReports}
                                        onChange={(e) => setShowRadiantReports(e.target.checked)}
                                        disabled={loadingData}
                                    />
                                    {(report.length > 0 ? ` (${radiantReport.length})` : '')}
                                    <Form.Check
                                        type="switch"
                                        id="curve-switch"
                                        label={t('SHOWER_INFO.CHECKBOX.SHOW_GRAPH')}
                                        value={showCurveGraph}
                                        checked={showCurveGraph}
                                        onChange={(e) => setShowCurveGraph(e.target.checked)}
                                        disabled={loadingData}
                                    />
                                </Stack>
                            </Form>
                        </Row>
                    </>
                )}
            </Container>

            {/* Error en la carga de datos */}
            {dataError && (
                <Container className="my-4">
                    <ErrorAlert message={dataError} onRetry={fetchMoonData} />
                </Container>
            )}

            {/* Gráfico */}
            <Container className="py-4">
                {loadingData && showCurveGraph && <ChartSkeleton />}
                {!loadingData && showCurveGraph && showerGraph.length > 0 && (
                    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                        <CurveLineChart data={showerGraph} />
                    </div>
                )}
                {!loadingData && showCurveGraph && showerGraph.length === 0 && selectedLluvia && (
                    <NoDataAlert message="No hay datos suficientes para mostrar el gráfico" />
                )}
            </Container>

            {/* Información básica */}
            <Container className="my-4 p-4">
                {loadingData && (
                    <div className="mt-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="p-2 rounded me-3" style={{ backgroundColor: '#980100' }}>
                                <i className="bi bi-droplet text-white fs-4"></i>
                            </div>
                            <div className="skeleton skeleton-text" style={{ width: '300px', height: '24px' }}></div>
                        </div>
                        <Row>
                            <Col md={6}>
                                <DataSkeleton />
                            </Col>
                            <Col md={6}>
                                <DataSkeleton />
                            </Col>
                        </Row>
                    </div>
                )}

                {!loadingData && selectedLluvia && (
                    <div className="mt-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="p-2 rounded me-3" style={{ backgroundColor: '#980100' }}>
                                <i className="bi bi-droplet text-white fs-4"></i>
                            </div>
                            <h4 className="mb-0 " style={{ color: '#980100' }}>
                                {t('SHOWER_INFO.DATA.TITLE')}: {selectedLluvia.Code} - {selectedLluvia.ShowerNameDesignation}
                            </h4>
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
                                                <span className="ms-2">{truncateDecimal(selectedLluvia.Distancia_mínima_entre_radianes_y_trayectoria)}</span>
                                            </li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Container>

            {/* Lista de tarjetas */}
            <Container className="py-4">
                {loadingData && (
                    <Row xs={1} md={2} lg={4} className="g-4">
                        {[...Array(10)].map((_, index) => (
                            <Col key={`skeleton-${index}`}>
                                <CardSkeleton />
                            </Col>
                        ))}
                    </Row>
                )}

                {!loadingData && (report.length > 0 || radiantReport.length > 0) && (
                    <Row xs={1} md={2} lg={4} className="g-4">
                        {showDualStationReports && report.map((r) => (
                            <Col key={r.hora}>
                                <Card className="h-100 shadow-sm border-0 hover-shadow transition-all">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg='#980100' style={{ backgroundColor: '#980100' }} pill>
                                                <Calendar className="me-1" /> {formatDate(r.fecha)}
                                            </Badge>
                                            <Badge bg="secondary" pill>
                                                <Clock className="me-1" /> {r.hora.substring(0, 8)}
                                            </Badge>
                                        </div>

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
                                            {r.azimut !== null && r.distanciaCenital !== null && (
                                                <Card.Title className="h6 d-flex flex-column">
                                                    <small className="">{t('INFERRED_DATA.AZIMUTH.label')}: {truncateDecimal(r.azimut)}º</small>
                                                    <small className="">{t('INFERRED_DATA.ZENITHAL_DISTANCE.label')}: {truncateDecimal(r?.distanciaCenital)}</small>
                                                </Card.Title>
                                            )}
                                        </div>

                                        <div className="mt-auto text-center">
                                            <Link
                                                target="_blank"
                                                to={`/report/${r?.reportId}`}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '#980100 1px solid',
                                                    borderRadius: '30px',
                                                    color: '#980100',
                                                    padding: '0.3rem 1rem',
                                                    textDecoration: 'none',
                                                }}
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

                                        <div className="mt-auto text-center">
                                            <Link
                                                target="_blank"
                                                to={`/radiant-report/${r?.reportId}`}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '#980100 1px solid',
                                                    borderRadius: '30px',
                                                    color: '#980100',
                                                    padding: '0.3rem 1rem',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {t('SHOWER_INFO.SHOW_DETAILS_BTN')}
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {!loadingData && report.length === 0 && radiantReport.length === 0 && selectedLluvia && (
                    <NoDataAlert message="No se encontraron reportes para los criterios seleccionados" />
                )}
            </Container>
        </div>
    );
};

export default MoonReport;