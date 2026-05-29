import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BolideEarthRangeViewer from '@/components/three/BolideEarthRangeViewer.jsx';
import { getBolideTrajectoriesForEarthGlobe } from '@/services/bolideService.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import './bolideGlobe.css';

const QUICK_RANGES = [7, 30, 90, 180];

function subtractDays(dateString, days) {
    const baseDate = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(baseDate.getTime())) {
        return dateString;
    }

    baseDate.setUTCDate(baseDate.getUTCDate() - days);
    return baseDate.toISOString().slice(0, 10);
}

function formatMetric(value, suffix = '', decimals = 2) {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
        return 'N/D';
    }

    return `${Number(value).toFixed(decimals)}${suffix}`;
}

function formatCoordinate(point) {
    if (!point) {
        return 'N/D';
    }

    const latitude = Number(point.latitude);
    const longitude = Number(point.longitude);
    const altitude = point.altitudeKm !== null && point.altitudeKm !== undefined
        ? `, ${Number(point.altitudeKm).toFixed(2)} km`
        : '';

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return 'N/D';
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}${altitude}`;
}

function buildObservatoryLabel(observatory) {
    if (!observatory) {
        return '';
    }

    if (observatory.id && observatory.name) {
        return `${observatory.id} - ${observatory.name}`;
    }

    return observatory.name || observatory.id || '';
}

function Metric({ label, value }) {
    return (
        <div className="bolide-globe-page__metric">
            <span className="bolide-globe-page__metric-label">{label}</span>
            <span className="bolide-globe-page__metric-value">{value}</span>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bolide-globe-page__stat">
            <span className="bolide-globe-page__stat-label">{label}</span>
            <span className="bolide-globe-page__stat-value">{value}</span>
        </div>
    );
}

export default function BolideGlobe() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payload, setPayload] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });
    const [focusedMeteorId, setFocusedMeteorId] = useState(null);
    const [selectedMeteorIds, setSelectedMeteorIds] = useState([]);

    const loadTrajectories = async (requestedFilters = {}) => {
        setLoading(true);
        setError('');

        try {
            const response = await getBolideTrajectoriesForEarthGlobe(requestedFilters);
            setPayload(response);
            setFilters({
                startDate: response?.queryRange?.startDate || '',
                endDate: response?.queryRange?.endDate || ''
            });
            setFocusedMeteorId((currentMeteorId) => {
                const ids = new Set((response?.data || []).map(item => item.meteorId));
                if (currentMeteorId && ids.has(currentMeteorId)) {
                    return currentMeteorId;
                }

                return null;
            });
            setSelectedMeteorIds((currentSelectedIds) => {
                const ids = new Set((response?.data || []).map(item => item.meteorId));
                return currentSelectedIds.filter(id => ids.has(id));
            });
        } catch (requestError) {
            setError(requestError?.response?.data?.error || 'No se ha podido cargar el visor 3D de bólidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrajectories();
    }, []);

    const selectedSet = useMemo(() => new Set(selectedMeteorIds), [selectedMeteorIds]);

    const selectedBolide = useMemo(() => {
        const allItems = payload?.data || [];
        if (!allItems.length) {
            return null;
        }

        if (!selectedSet.size) {
            return null;
        }

        const focusedItem = allItems.find(item => item.meteorId === focusedMeteorId);
        if (focusedItem && selectedSet.has(focusedItem.meteorId)) {
            return focusedItem;
        }

        return allItems.find(item => selectedSet.has(item.meteorId)) || null;
    }, [focusedMeteorId, payload, selectedSet]);

    const averageMeasuredPoints = useMemo(() => {
        if (!payload?.data?.length) {
            return '0';
        }

        const total = payload.data.reduce((sum, item) => sum + (item.measuredPointCount || 0), 0);
        return (total / payload.data.length).toFixed(1);
    }, [payload]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await loadTrajectories(filters);
    };

    const handleQuickRange = async (days) => {
        const fallbackEndDate = payload?.availableRange?.maxDate || filters.endDate;
        if (!fallbackEndDate) {
            return;
        }

        const nextFilters = {
            startDate: subtractDays(fallbackEndDate, days - 1),
            endDate: fallbackEndDate
        };

        setFilters(nextFilters);
        await loadTrajectories(nextFilters);
    };

    const selectedObservatories = selectedBolide?.observatories?.map(buildObservatoryLabel).filter(Boolean) || [];
    const hasScene = Boolean(payload?.data?.length);
    const hasSelection = selectedSet.size > 0;
    const hasLoadedData = hasScene;
    const introSequenceKey = `${payload?.queryRange?.startDate || 'none'}-${payload?.queryRange?.endDate || 'none'}-${payload?.meta?.totalBolides || 0}`;

    const toggleMeteorSelection = (meteorId) => {
        setSelectedMeteorIds((currentIds) => {
            const nextIds = new Set(currentIds);
            const wasSelected = nextIds.has(meteorId);

            if (wasSelected) {
                nextIds.delete(meteorId);
            } else {
                nextIds.add(meteorId);
            }

            const nextSelectedIds = Array.from(nextIds);
            if (!nextSelectedIds.length) {
                setFocusedMeteorId(null);
            } else if (wasSelected) {
                setFocusedMeteorId((currentFocusedId) => {
                    if (currentFocusedId && nextIds.has(currentFocusedId)) {
                        return currentFocusedId;
                    }

                    return nextSelectedIds[0];
                });
            } else {
                setFocusedMeteorId(meteorId);
            }

            return nextSelectedIds;
        });
    };

    const focusMeteorFromScene = (meteorId) => {
        setFocusedMeteorId(meteorId);
    };

    const selectAllMeteors = () => {
        const ids = (payload?.data || []).map(item => item.meteorId);
        setSelectedMeteorIds(ids);
        if (!focusedMeteorId && ids.length) {
            setFocusedMeteorId(ids[0]);
        }
    };

    const clearSelection = () => {
        setSelectedMeteorIds([]);
        setFocusedMeteorId(null);
    };

    return (
        <div className={`bolide-globe-page ${hasScene ? 'bolide-globe-page--immersive' : ''}`}>
            {hasScene ? (
                <>
                    <div className="bolide-globe-page__background">
                        <BolideEarthRangeViewer
                            items={payload.data}
                            selectedMeteorIds={selectedSet}
                            focusedMeteorId={focusedMeteorId}
                            onSelectMeteor={focusMeteorFromScene}
                            introSequenceKey={introSequenceKey}
                        />
                    </div>
                    <div className="bolide-globe-page__backdrop" />
                </>
            ) : null}

            <Container fluid className={`bolide-globe-page__shell ${!hasLoadedData ? 'bolide-globe-page__shell--idle' : ''}`}>
                <div className={`bolide-globe-page__topbar ${!hasLoadedData ? 'bolide-globe-page__topbar--centered' : ''} ${hasLoadedData ? 'bolide-globe-page__topbar--compact' : ''}`}>
                    <Card className="bolide-globe-page__hero">
                        <Card.Body>
                            <div className="bolide-globe-page__eyebrow">Visor planetario</div>
                            <h1>Tierra 3D con trayectorias completas de bólidos</h1>
                            <p>
                                Filtra por fecha y explora las trayectorias sobre el globo. Al seleccionar un meteoro, su ficha queda
                                abierta en la interfaz mientras el visor permanece como fondo interactivo.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className={`bolide-globe-page__panel ${hasLoadedData ? 'bolide-globe-page__panel--compact' : ''}`}>
                        <Card.Body>
                            <h2 className="mb-3">Filtro temporal</h2>
                            {hasLoadedData ? (
                                <div className="bolide-globe-page__panel-summary">
                                    {filters.startDate && filters.endDate ? `${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}` : 'Pasa el cursor para editar el rango'}
                                </div>
                            ) : null}
                            <div className="bolide-globe-page__panel-popover">
                                <Form onSubmit={handleSubmit} className="bolide-globe-page__filters">
                                    <div className="bolide-globe-page__date-grid">
                                        <div>
                                            <Form.Label>Fecha inicial</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.startDate}
                                                min={payload?.availableRange?.minDate || undefined}
                                                max={payload?.availableRange?.maxDate || undefined}
                                                onChange={(event) => setFilters(current => ({ ...current, startDate: event.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Form.Label>Fecha final</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.endDate}
                                                min={payload?.availableRange?.minDate || undefined}
                                                max={payload?.availableRange?.maxDate || undefined}
                                                onChange={(event) => setFilters(current => ({ ...current, endDate: event.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="bolide-globe-page__quick-actions">
                                        {QUICK_RANGES.map(days => (
                                            <Button
                                                key={days}
                                                type="button"
                                                variant="outline-secondary"
                                                onClick={() => handleQuickRange(days)}
                                            >
                                                Últimos {days} días
                                            </Button>
                                        ))}
                                        <Button type="submit" style={{ backgroundColor: '#980100', borderColor: '#980100' }}>
                                            Actualizar visor
                                        </Button>
                                    </div>

                                    <div className="bolide-globe-page__stats">
                                        <Stat label="Bólidos" value={payload?.meta?.totalBolides ?? 0} />
                                        <Stat label="Informes de dos estaciones" value={payload?.meta?.totalReports ?? 0} />
                                        <Stat label="Promedio de puntos" value={averageMeasuredPoints} />
                                        <Stat
                                            label="Rango cargado"
                                            value={payload?.queryRange?.startDate && payload?.queryRange?.endDate
                                                ? `${formatDate(payload.queryRange.startDate)} a ${formatDate(payload.queryRange.endDate)}`
                                                : 'N/D'}
                                        />
                                    </div>

                                    <div className="bolide-globe-page__text-block mb-0">
                                        Rango disponible en la base: <strong>{formatDate(payload?.availableRange?.minDate) || 'N/D'}</strong> a{' '}
                                        <strong>{formatDate(payload?.availableRange?.maxDate) || 'N/D'}</strong>.
                                    </div>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {error ? <Alert variant="danger" className="bolide-globe-page__alert">{error}</Alert> : null}

                {loading && !hasScene ? (
                    <Card className="bolide-globe-page__empty">
                        <Card.Body>
                            <Spinner animation="border" role="status" className="mb-3" />
                            <div>Cargando trayectorias y preparando el globo 3D…</div>
                        </Card.Body>
                    </Card>
                ) : null}

                {!loading && !hasScene ? (
                    <Card className="bolide-globe-page__empty">
                        <Card.Body>
                            <h2 className="mb-3">Sin trayectorias para ese rango</h2>
                            <p className="mb-0">
                                No hay informes de dos estaciones con geometría suficiente entre <strong>{formatDate(filters.startDate) || 'N/D'}</strong> y{' '}
                                <strong>{formatDate(filters.endDate) || 'N/D'}</strong>. Prueba con un intervalo más amplio.
                            </p>
                        </Card.Body>
                    </Card>
                ) : null}

                {hasScene ? (
                    <div className="bolide-globe-page__hud">
                        <div className="bolide-globe-page__info-column">
                            {hasSelection ? (
                                <Card className="bolide-globe-page__selected">
                                <Card.Body>
                                    {selectedBolide ? (
                                        <>
                                            <div className="bolide-globe-page__selected-header">
                                                <div>
                                                    <p className="bolide-globe-page__selected-title">{`MET-${selectedBolide.meteorId}`}</p>
                                                    <p className="bolide-globe-page__selected-subtitle">
                                                        {formatDate(selectedBolide.date)} a las {selectedBolide.time || 'N/D'} UTC
                                                    </p>
                                                </div>
                                                <Badge bg="dark">{`Informe principal de dos estaciones ${selectedBolide.selectedReportId}`}</Badge>
                                            </div>

                                            <div className="bolide-globe-page__metrics">
                                                <Metric label="Velocidad media" value={formatMetric(selectedBolide.velocityKmS, ' km/s', 3)} />
                                                <Metric label="Velocidad angular" value={formatMetric(selectedBolide.angularVelocityDegS, ' º/s', 3)} />
                                                <Metric label="Longitud estimada" value={formatMetric(selectedBolide.trajectoryLengthKm, ' km', 2)} />
                                                <Metric label="Duración" value={formatMetric(selectedBolide.durationSeconds, ' s', 3)} />
                                                <Metric label="Puntos medidos" value={selectedBolide.measuredPointCount ?? 'N/D'} />
                                                <Metric label="Masa fotométrica" value={formatMetric(selectedBolide.photometricMass, ' g', 3)} />
                                            </div>

                                            <div className="bolide-globe-page__text-block">
                                                <strong>Inicio:</strong> {formatCoordinate(selectedBolide.startPoint)}
                                                <br />
                                                <strong>Final:</strong> {formatCoordinate(selectedBolide.endPoint)}
                                                <br />
                                                <strong>Impacto previsto:</strong> {formatCoordinate(selectedBolide.impactPoint)}
                                            </div>

                                            <div className="bolide-globe-page__text-block">
                                                <strong>Observatorios implicados:</strong>{' '}
                                                {selectedObservatories.length ? selectedObservatories.join(' | ') : 'N/D'}
                                            </div>

                                            <div className="bolide-globe-page__badge-group mb-3">
                                                {selectedBolide.associatedShowers?.length ? (
                                                    selectedBolide.associatedShowers.map((shower) => (
                                                        <Badge bg="secondary" key={shower}>{shower}</Badge>
                                                    ))
                                                ) : (
                                                    <Badge bg="light" text="dark">Sin lluvia asociada</Badge>
                                                )}
                                            </div>

                                            <div className="bolide-globe-page__badge-group mb-3">
                                                {selectedBolide.reportSummaries?.map((report) => (
                                                    <Badge bg="light" text="dark" key={report.reportId}>
                                                        {`Z-${report.reportId} · ${report.measuredPointCount} pts`}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="bolide-globe-page__actions">
                                                <Button
                                                    as={Link}
                                                    to={`/bolide/${selectedBolide.meteorId}`}
                                                    style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                                >
                                                    Abrir ficha del bólido
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    to={`/report/${selectedBolide.selectedReportId}/INFERRED_DATA_TAB`}
                                                    variant="outline-dark"
                                                >
                                                    Abrir informe de dos estaciones
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div>No hay un bólido seleccionado.</div>
                                    )}
                                </Card.Body>
                            </Card>
                            ) : null}
                        </div>

                        <aside className="bolide-globe-page__sidebar">
                            <Card className="bolide-globe-page__list-card">
                                <Card.Body>
                                    <div className="bolide-globe-page__sidebar-header">
                                        <div>
                                            <h2 className="mb-1">Bólidos del rango</h2>
                                            <p className="bolide-globe-page__list-meta mb-0">
                                                Sin selección se muestran todas. Al marcar una o varias, el visor se centra en esas trayectorias.
                                            </p>
                                        </div>
                                        <Badge bg="dark">{payload.data.length}</Badge>
                                    </div>

                                    <div className="bolide-globe-page__sidebar-actions">
                                        <Button variant="outline-light" size="sm" onClick={selectAllMeteors}>
                                            Seleccionar todas
                                        </Button>
                                        <Button variant="outline-light" size="sm" onClick={clearSelection}>
                                            Quitar selección
                                        </Button>
                                    </div>

                                    <div className="bolide-globe-page__list">
                                        {payload.data.map((item) => {
                                            const isActive = hasSelection && item.meteorId === selectedBolide?.meteorId;
                                            const isSelected = selectedSet.has(item.meteorId);
                                            return (
                                                <button
                                                    key={item.meteorId}
                                                    type="button"
                                                    className={`bolide-globe-page__list-item ${isActive ? 'bolide-globe-page__list-item--active' : ''} ${isSelected ? 'bolide-globe-page__list-item--selected' : ''}`}
                                                    onClick={() => toggleMeteorSelection(item.meteorId)}
                                                >
                                                    <div className="bolide-globe-page__list-head">
                                                        <div>
                                                            <p className="bolide-globe-page__list-title">{`MET-${item.meteorId}`}</p>
                                                            <p className="bolide-globe-page__list-meta">
                                                                {formatDate(item.date)} · {item.time || 'N/D'} UTC
                                                            </p>
                                                        </div>
                                                        <div className="bolide-globe-page__item-badges">
                                                            <Badge bg={isSelected ? 'warning' : 'secondary'} text={isSelected ? 'dark' : undefined}>
                                                                {isSelected ? 'Marcado' : 'Visible'}
                                                            </Badge>
                                                            <Badge bg={isActive ? 'danger' : 'secondary'}>
                                                                {item.measuredPointCount || 0} pts
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="bolide-globe-page__list-meta mb-0">
                                                        {`Informe de dos estaciones ${item.selectedReportId} · ${formatMetric(item.velocityKmS, ' km/s', 3)} · ${item.reportCount} soluciones`}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>
                        </aside>
                    </div>
                ) : null}
            </Container>
        </div>
    );
}
