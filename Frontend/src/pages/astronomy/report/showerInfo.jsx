import React from 'react';
import { Card, Button, Container, Row, Col, Badge, Form, Alert } from "react-bootstrap"
import { Calendar, Clock, EvStation, ExclamationTriangle } from "react-bootstrap-icons"
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
import './showerInfo.css';

const MOON_PHASES = [
    { name: 'New Moon', translationKey: 'NEW_MOON' },
    { name: 'Waxing Crescent', translationKey: 'WAXING_CRESCENT' },
    { name: 'First Quarter', translationKey: 'FIRST_QUARTER' },
    { name: 'Waxing Gibbous', translationKey: 'WAXING_GIBBOUS' },
    { name: 'Full Moon', translationKey: 'FULL_MOON' },
    { name: 'Waning Gibbous', translationKey: 'WANING_GIBBOUS' },
    { name: 'Last Quarter', translationKey: 'LAST_QUARTER' },
    { name: 'Waning Crescent', translationKey: 'WANING_CRESCENT' },
];

const getMoonPhaseLabel = (t, phaseName) => {
    const phase = MOON_PHASES.find((item) => item.name === phaseName);
    return phase
        ? t(`SHOWER_INFO.MOON_PHASE_GUIDE.PHASES.${phase.translationKey}.NAME`)
        : phaseName;
};

const MoonPhaseGuide = ({
    reports,
    radiantReports,
    showDualStationReports,
    showRadiantReports,
    showCurveGraph,
    selectedMoonPhases,
    onToggleDualStationReports,
    onToggleRadiantReports,
    onToggleCurveGraph,
    onTogglePhase,
    onClearPhases,
}) => {
    const { t } = useTranslation(['text']);
    const visibleReports = [
        ...(showDualStationReports ? reports : []),
        ...(showRadiantReports ? radiantReports : []),
    ];
    const phaseCounts = visibleReports.reduce((counts, item) => {
        counts[item.moonPhase] = (counts[item.moonPhase] || 0) + 1;
        return counts;
    }, {});

    return (
        <section className="moon-phase-guide mb-4" aria-labelledby="moon-phase-guide-title">
            <div className="moon-phase-guide__intro">
                <span className="shower-info__section-icon" aria-hidden="true">
                    <i className="bi bi-moon-stars" />
                </span>
                <div>
                    <h3 id="moon-phase-guide-title" className="mb-1">
                        {t('SHOWER_INFO.MOON_PHASE_GUIDE.TITLE')}
                    </h3>
                    <p className="mb-0">{t('SHOWER_INFO.MOON_PHASE_GUIDE.DESCRIPTION')}</p>
                </div>
                {selectedMoonPhases.length > 0 && (
                    <Button className="moon-phase-guide__clear" variant="link" size="sm" onClick={onClearPhases}>
                        <i className="bi bi-x-circle" aria-hidden="true" />
                        {t('SHOWER_INFO.MOON_PHASE_GUIDE.CLEAR_FILTER')}
                    </Button>
                )}
            </div>

            <div className="moon-phase-guide__view-options">
                <div className="shower-info__toggle-grid">
                    <label htmlFor="dual-station-switch">
                        <span><i className="bi bi-diagram-3" /><strong>{t('SHOWER_INFO.CHECKBOX.SHOW_REPORT_Z')}</strong></span>
                        <span className="shower-info__toggle-meta">
                            <Badge bg="light" text="dark">{reports.length}</Badge>
                            <Form.Check type="switch" id="dual-station-switch" checked={showDualStationReports} onChange={onToggleDualStationReports} />
                        </span>
                    </label>
                    <label htmlFor="radiant-switch">
                        <span><i className="bi bi-broadcast" /><strong>{t('SHOWER_INFO.CHECKBOX.SHOW_RADIANT_REPORT')}</strong></span>
                        <span className="shower-info__toggle-meta">
                            <Badge bg="light" text="dark">{radiantReports.length}</Badge>
                            <Form.Check type="switch" id="radiant-switch" checked={showRadiantReports} onChange={onToggleRadiantReports} />
                        </span>
                    </label>
                    <label htmlFor="curve-switch">
                        <span><i className="bi bi-graph-up" /><strong>{t('SHOWER_INFO.CHECKBOX.SHOW_GRAPH')}</strong></span>
                        <span className="shower-info__toggle-meta">
                            <Form.Check type="switch" id="curve-switch" checked={showCurveGraph} onChange={onToggleCurveGraph} />
                        </span>
                    </label>
                </div>
            </div>

            <div className="moon-phase-guide__grid">
                {MOON_PHASES.map((phase) => {
                    const isSelected = selectedMoonPhases.includes(phase.name);
                    const classNames = [
                        'moon-phase-guide__phase',
                        phaseCounts[phase.name] ? 'moon-phase-guide__phase--available' : '',
                        isSelected ? 'moon-phase-guide__phase--selected' : '',
                    ].filter(Boolean).join(' ');

                    return (
                    <button
                        type="button"
                        className={classNames}
                        key={phase.name}
                        aria-pressed={isSelected}
                        disabled={!phaseCounts[phase.name]}
                        onClick={() => onTogglePhase(phase.name)}
                    >
                        <img
                            src={`/moon/${phase.name}.webp`}
                            alt={t(`SHOWER_INFO.MOON_PHASE_GUIDE.PHASES.${phase.translationKey}.NAME`)}
                            width="54"
                            height="54"
                            loading="lazy"
                        />
                        <strong>{t(`SHOWER_INFO.MOON_PHASE_GUIDE.PHASES.${phase.translationKey}.NAME`)}</strong>
                        <small>{t(`SHOWER_INFO.MOON_PHASE_GUIDE.PHASES.${phase.translationKey}.DESCRIPTION`)}</small>
                        <Badge bg={phaseCounts[phase.name] ? 'dark' : 'light'} text={phaseCounts[phase.name] ? 'white' : 'dark'} pill>
                            {t('SHOWER_INFO.MOON_PHASE_GUIDE.VISIBLE_RESULTS', {
                                count: phaseCounts[phase.name] || 0,
                            })}
                        </Badge>
                        <span className="moon-phase-guide__selected-mark" aria-hidden="true">
                            <i className="bi bi-check" />
                        </span>
                    </button>
                    );
                })}
            </div>
        </section>
    );
};

const SectionHeading = ({ id, icon, title, description, action }) => (
    <div className="shower-info__section-heading">
        <div className="shower-info__section-heading-main">
            <span className="shower-info__section-icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
            </span>
            <div>
                <h2 id={id}>{title}</h2>
                {description && <p>{description}</p>}
            </div>
        </div>
        {action}
    </div>
);

const ResultCard = ({ result, type, getDistanceLabel, t }) => {
    const isDualStation = type === 'dual';
    const membership = isDualStation ? result?.orbitalMemberships : result?.distance;
    const detailPath = isDualStation
        ? `/report/${result?.reportId}`
        : `/radiant-report/${result?.reportId}`;

    return (
        <Card className="report-result-card h-100">
            <Card.Body>
                <div className="report-result-card__topline">
                    <Badge className={`report-result-card__type report-result-card__type--${type}`} pill>
                        {isDualStation ? (
                            <><i className="bi bi-diagram-3 me-1" />{t('SHOWER_INFO.TWO_STATION_BADGE')}</>
                        ) : (
                            <><EvStation className="me-1" />{t('SHOWER_INFO.RADIANT_REPORT_BADGE')}</>
                        )}
                    </Badge>
                    <span className="report-result-card__id">#{result?.reportId}</span>
                </div>

                <div className="report-result-card__datetime">
                    <span><Calendar aria-hidden="true" /> {formatDate(result.fecha)}</span>
                    <span><Clock aria-hidden="true" /> {result.hora.substring(0, 8)}</span>
                </div>

                <div className="report-result-card__moon">
                    <MoonPhase
                        phaseName={result.moonPhase}
                        eheight={68}
                        ewidth={68}
                        alt={getMoonPhaseLabel(t, result.moonPhase)}
                    />
                    <div>
                        <small>{t('SHOWER_INFO.CARD.MOON_PHASE')}</small>
                        <strong>{getMoonPhaseLabel(t, result.moonPhase)}</strong>
                    </div>
                </div>

                <div className="report-result-card__membership">
                    <small>{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</small>
                    <strong>{getDistanceLabel(membership)}</strong>
                </div>

                {isDualStation && result.azimut !== null && result.distanciaCenital !== null && (
                    <div className="report-result-card__metrics">
                        <div>
                            <small>{t('INFERRED_DATA.AZIMUTH.label')}</small>
                            <strong>{truncateDecimal(result.azimut)}º</strong>
                        </div>
                        <div>
                            <small>{t('INFERRED_DATA.ZENITHAL_DISTANCE.label')}</small>
                            <strong>{truncateDecimal(result.distanciaCenital)}º</strong>
                        </div>
                    </div>
                )}

                <Link
                    className="report-result-card__link"
                    target="_blank"
                    rel="noopener noreferrer"
                    to={detailPath}
                >
                    {t('SHOWER_INFO.SHOW_DETAILS_BTN')}
                    <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
            </Card.Body>
        </Card>
    );
};

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
const ErrorAlert = ({ message, onRetry }) => {
    const { t } = useTranslation(['text']);

    return (
        <Alert variant="danger" className="d-flex align-items-center">
            <ExclamationTriangle className="me-2" size={20} />
            <div className="flex-grow-1">
                <strong>{t('SHOWER_INFO.ERRORS.TITLE')}:</strong> {message}
            </div>
            {onRetry && (
                <Button variant="outline-danger" size="sm" onClick={onRetry}>
                    {t('SHOWER_INFO.ERRORS.RETRY')}
                </Button>
            )}
        </Alert>
    );
};

// Componente para mostrar "sin datos"
const NoDataAlert = ({ message }) => {
    const { t } = useTranslation(['text']);

    return (
        <Alert variant="info" className="text-center">
            <div className="mb-2">
                <i className="bi bi-info-circle" style={{ fontSize: '2rem' }}></i>
            </div>
            <strong>{message || t('SHOWER_INFO.NO_DATA.DEFAULT')}</strong>
        </Alert>
    );
};

const MoonReport = () => {
    const { selectedCode: selectedCodeFromParams } = useParams();
    const { t } = useTranslation(['text']);
    const [selectedCode, setSelectedCode] = useState(selectedCodeFromParams || '');
    const [dateIn, setDateIn] = useState('');
    const [dateOut, setDateOut] = useState('');
    const [report, setReport] = useState([]);
    const [radiantReport, setRadiantReport] = useState([]);
    const [, setRain] = useState(null);
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
    const [selectedMoonPhases, setSelectedMoonPhases] = useState([]);
    const selectedShowerOption = lluvias.find((lluvia) => lluvia.Identificador === selectedCode);
    const selectedShowerDisplayName = selectedLluvia
        ? `${selectedLluvia.Code} - ${selectedLluvia.ShowerNameDesignation}`
        : selectedShowerOption
            ? `${selectedShowerOption.Identificador} - ${selectedShowerOption.Nombre}`
            : selectedCode;
    const selectedMembershipLabel = getDistanceLabel(membershipThreshold);
    const invalidDateRange = Boolean(dateIn && dateOut && Number(dateIn) > Number(dateOut));

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
                setShowersError(t('SHOWER_INFO.ERRORS.LOAD_SHOWERS'));
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
        setSelectedMoonPhases([]);
        setDataError(null);
    };

    const fetchMoonData = async () => {
        if (!selectedCode || invalidDateRange) return;

        setLoadingData(true);
        setDataError(null);
        try {
            const data = await getReportZListFromRain(selectedCode, dateIn, dateOut, membershipThreshold, distanceThreshold);
            setReport(data.reportResults || []);
            setRain(data.establishedShowerDataUsed);
            setRadiantReport(data.radiantReport || []);
            setShowerGraph(data.showerGraph || []);
            setSelectedLluvia(data.shower);
            setSelectedMoonPhases([]);

            // Mostrar secciones solo si hay datos
            setShowDualStationReports(data.reportResults && data.reportResults.length > 0);
            setShowRadiantReports(data.radiantReport && data.radiantReport.length > 0);
            setShowCurveGraph(data.showerGraph && data.showerGraph.length > 0);

        } catch (error) {
            console.error('Error fetching moon data:', error);
            setReport([]);
            setRadiantReport([]);
            setRain(null);
            setShowerGraph([]);
            setSelectedLluvia(null);
            setShowDualStationReports(false);
            setShowRadiantReports(false);
            setShowCurveGraph(false);
            setSelectedMoonPhases([]);
            setDataError(t('SHOWER_INFO.ERRORS.LOAD_REPORT_DATA'));
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

    const handleMoonPhaseToggle = (phaseName) => {
        setSelectedMoonPhases((currentPhases) => (
            currentPhases.includes(phaseName)
                ? currentPhases.filter((phase) => phase !== phaseName)
                : [...currentPhases, phaseName]
        ));
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
                setShowersError(t('SHOWER_INFO.ERRORS.LOAD_SHOWERS'));
            } finally {
                setLoadingShowers(false);
            }
        };
        fetchLluvias();
    };

    const totalReports = report.length + radiantReport.length;
    const matchesMoonPhaseFilter = (result) => (
        selectedMoonPhases.length === 0 || selectedMoonPhases.includes(result.moonPhase)
    );
    const filteredDualStationReports = showDualStationReports
        ? report.filter(matchesMoonPhaseFilter)
        : [];
    const filteredRadiantReports = showRadiantReports
        ? radiantReport.filter(matchesMoonPhaseFilter)
        : [];
    const typeVisibleReports = (showDualStationReports ? report.length : 0)
        + (showRadiantReports ? radiantReport.length : 0);
    const visibleReports = filteredDualStationReports.length + filteredRadiantReports.length;

    return (
        <main className="shower-info">
            <header className="shower-info__hero">
                <Container>
                    <span className="shower-info__eyebrow">{t('SHOWER_INFO.EYEBROW')}</span>
                    <h1>{t('SHOWER_INFO.PAGE_TITLE')}</h1>
                    <p>{t('SHOWER_INFO.PAGE_DESCRIPTION')}</p>
                </Container>
            </header>

            <Container className="shower-info__content">
                <section className="shower-info__panel shower-info__search-panel" aria-labelledby="search-title">
                    <SectionHeading
                        id="search-title"
                        icon="bi-sliders"
                        title={t('SHOWER_INFO.FILTERS.TITLE')}
                        description={t('SHOWER_INFO.FILTERS.DESCRIPTION')}
                    />

                    {showersError && <ErrorAlert message={showersError} onRetry={retryLoadShowers} />}

                    <Form onSubmit={(event) => { event.preventDefault(); fetchMoonData(); }}>
                        <Row className="g-3">
                            <Col lg={6}>
                                <Form.Group controlId="lluviaSelect">
                                    <Form.Label>{t('SHOWER_INFO.TITLE')}</Form.Label>
                                    {loadingShowers ? (
                                        <div className="skeleton shower-info__input-skeleton" />
                                    ) : (
                                        <Form.Select value={selectedCode} onChange={handleSelectChange} disabled={loadingData}>
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
                            <Col sm={6} lg={3}>
                                <Form.Group controlId="anioInicio">
                                    <Form.Label>{t('SHOWER_INFO.START_YEAR')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        placeholder={t('SHOWER_INFO.PLACEHOLDERS.START_YEAR')}
                                        value={dateIn}
                                        isInvalid={invalidDateRange}
                                        onChange={(event) => setDateIn(event.target.value)}
                                        disabled={loadingData}
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6} lg={3}>
                                <Form.Group controlId="anioFin">
                                    <Form.Label>{t('SHOWER_INFO.END_YEAR')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        placeholder={t('SHOWER_INFO.PLACEHOLDERS.END_YEAR')}
                                        value={dateOut}
                                        isInvalid={invalidDateRange}
                                        onChange={(event) => setDateOut(event.target.value)}
                                        disabled={loadingData}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {t('SHOWER_INFO.FILTERS.INVALID_DATE_RANGE')}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group controlId="membershipThreshold">
                                    <Form.Label>{t('SHOWER_INFO.MEMBERSHIP_THRESHOLD')}</Form.Label>
                                    <Form.Select
                                        value={membershipThreshold}
                                        onChange={(event) => handleMembershipThresholdChange(Number(event.target.value))}
                                        disabled={loadingData}
                                    >
                                        <option value="1">{t('DISTANCE.VERYFAR')}</option>
                                        <option value="3">{t('DISTANCE.FAR')}</option>
                                        <option value="5">{t('DISTANCE.CLOSE')}</option>
                                        <option value="7">{t('DISTANCE.VERYCLOSE')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group controlId="distanceThreshold">
                                    <Form.Label>{t('SHOWER_INFO.DISTANCE_THRESHOLD')}</Form.Label>
                                    <div className="shower-info__input-suffix">
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="200"
                                            step="1"
                                            placeholder="80"
                                            value={distanceThreshold}
                                            onChange={(event) => handleDistanceThresholdChange(event.target.value)}
                                            disabled={loadingData}
                                        />
                                        <span>°</span>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="shower-info__form-actions">
                            <Button variant="outline-secondary" type="button" onClick={handleLimpiar} disabled={loadingData || loadingShowers}>
                                <i className="bi bi-eraser me-2" />{t('SHOWER_INFO.CLEAR_BTN')}
                            </Button>
                            <Button className="shower-info__primary-button" type="submit" disabled={loadingData || loadingShowers || !selectedCode || invalidDateRange}>
                                {loadingData ? (
                                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />{t('SHOWER_INFO.LOADING')}</>
                                ) : (
                                    <><i className="bi bi-search me-2" />{t('SHOWER_INFO.SEARCH_BTN')}</>
                                )}
                            </Button>
                        </div>
                    </Form>
                </section>

                {dataError && <ErrorAlert message={dataError} onRetry={fetchMoonData} />}

                {loadingData && (
                    <section className="shower-info__loading" aria-live="polite">
                        <div className="skeleton skeleton-text shower-info__title-skeleton" />
                        <Row className="g-3 mb-4">
                            <Col md={6}><DataSkeleton /></Col>
                            <Col md={6}><DataSkeleton /></Col>
                        </Row>
                        <ChartSkeleton />
                    </section>
                )}

                {!loadingData && selectedLluvia && (
                    <>
                        <section className="shower-info__overview" aria-labelledby="overview-title">
                            <div className="shower-info__overview-title">
                                <span>{selectedLluvia.Code}</span>
                                <div>
                                    <small>{t('SHOWER_INFO.DATA.TITLE')}</small>
                                    <h2 id="overview-title">{selectedLluvia.ShowerNameDesignation}</h2>
                                </div>
                            </div>
                            <div className="shower-info__summary-grid">
                                <div><strong>{totalReports}</strong><span>{t('SHOWER_INFO.SUMMARY.TOTAL')}</span></div>
                                <div><strong>{report.length}</strong><span>{t('SHOWER_INFO.SUMMARY.DUAL')}</span></div>
                                <div><strong>{radiantReport.length}</strong><span>{t('SHOWER_INFO.SUMMARY.RADIANT')}</span></div>
                                <div><strong>{selectedMembershipLabel}</strong><span>{t('SHOWER_INFO.SUMMARY.MIN_MEMBERSHIP')}</span></div>
                            </div>
                        </section>

                        {totalReports > 0 && (
                            <MoonPhaseGuide
                                reports={report}
                                radiantReports={radiantReport}
                                showDualStationReports={showDualStationReports}
                                showRadiantReports={showRadiantReports}
                                showCurveGraph={showCurveGraph}
                                selectedMoonPhases={selectedMoonPhases}
                                onToggleDualStationReports={(event) => setShowDualStationReports(event.target.checked)}
                                onToggleRadiantReports={(event) => setShowRadiantReports(event.target.checked)}
                                onToggleCurveGraph={(event) => setShowCurveGraph(event.target.checked)}
                                onTogglePhase={handleMoonPhaseToggle}
                                onClearPhases={() => setSelectedMoonPhases([])}
                            />
                        )}

                        {showCurveGraph && (
                            <section className="shower-info__panel shower-info__chart" aria-labelledby="chart-title">
                                <SectionHeading id="chart-title" icon="bi-bar-chart-line" title={t('SHOWER_INFO.GRAPH.TITLE')} description={t('SHOWER_INFO.GRAPH.DESCRIPTION')} />
                                {showerGraph.length > 0 ? (
                                    <div className="shower-info__chart-content"><CurveLineChart data={showerGraph} /></div>
                                ) : (
                                    <NoDataAlert message={t('SHOWER_INFO.NO_DATA.GRAPH')} />
                                )}
                            </section>
                        )}

                        {totalReports > 0 ? (
                            <section className="shower-info__results" aria-labelledby="results-title">
                                <SectionHeading
                                    id="results-title"
                                    icon="bi-grid"
                                    title={t('SHOWER_INFO.RESULTS.TITLE')}
                                    description={t('SHOWER_INFO.RESULTS_HEADING', { membership: selectedMembershipLabel, shower: selectedShowerDisplayName })}
                                    action={<Badge className="shower-info__visible-count" pill>{t('SHOWER_INFO.RESULTS.VISIBLE', { visible: visibleReports, total: totalReports })}</Badge>}
                                />

                                {visibleReports > 0 ? (
                                    <Row xs={1} md={2} xl={3} className="g-4">
                                        {filteredDualStationReports.map((result) => (
                                            <Col key={`dual-${result.reportId || result.hora}`}>
                                                <ResultCard result={result} type="dual" getDistanceLabel={getDistanceLabel} t={t} />
                                            </Col>
                                        ))}
                                        {filteredRadiantReports.map((result) => (
                                            <Col key={`radiant-${result.reportId || result.hora}`}>
                                                <ResultCard result={result} type="radiant" getDistanceLabel={getDistanceLabel} t={t} />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <NoDataAlert message={t(
                                        typeVisibleReports === 0
                                            ? 'SHOWER_INFO.NO_DATA.HIDDEN_REPORTS'
                                            : 'SHOWER_INFO.NO_DATA.MOON_PHASE'
                                    )} />
                                )}
                            </section>
                        ) : (
                            <NoDataAlert message={t('SHOWER_INFO.NO_DATA.REPORTS')} />
                        )}
                    </>
                )}
            </Container>
        </main>
    );
};

export default MoonReport;
