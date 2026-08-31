import './Station.css';

import StationMapChart from '@/components/map/StationMapChart';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Badge, Button, Col, Form, ListGroup, Modal, Row, Table } from 'react-bootstrap';
import { LocateFixed, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createStation, deleteStation, getStations, updateStation, updateStationStatus } from '@/services/stationService';
import { isAdminUser } from '@/utils/roleMaskUtils';
import { useLocation } from "react-router-dom";
import BackToAdminPanel from '@/components/admin/BackToAdminPanel.jsx'; // Asegúrate de que la ruta sea correcta
import {
    formatResolution,
    formatSexagesimalDisplay,
    sexagesimalToRadians,
    sortStationsByObservatoryAndId,
} from '@/utils/stationDisplay';

// Internationalization
import { useTranslation } from 'react-i18next';

const EMPTY_STATION = {
    id: '',
    stationName: '',
    name: '',
    description: '',
    longitudeSexagesimal: '',
    latitudeSexagesimal: '',
    height: '',
    localDirectory: '',
    cloudDirectory: '',
    chipSize: '',
    chipOrientation: '',
    filter: '',
    credit: '',
    state: 1
};

const toStationForm = (station) => ({
    id: station.id ?? '',
    stationName: station.stationName ?? '',
    name: station.name ?? '',
    description: station.description ?? '',
    longitudeSexagesimal: station.longitudeSexagesimal ?? '',
    latitudeSexagesimal: station.latitudeSexagesimal ?? '',
    height: station.height ?? '',
    localDirectory: station.localDirectory ?? '',
    cloudDirectory: station.cloudDirectory ?? '',
    chipSize: station.chipSize ?? '',
    chipOrientation: station.chipOrientation ?? '',
    filter: station.filter ?? '',
    credit: station.credit ?? '',
    state: station.state ?? 1
});

const formatStationCoordinates = (station) => (
    `${formatSexagesimalDisplay(station.latitudeSexagesimal)} / ${formatSexagesimalDisplay(station.longitudeSexagesimal)}`
);

const computeStationRadians = (stationForm) => ({
    longitude_Radianes: sexagesimalToRadians(stationForm.longitudeSexagesimal) ?? '',
    latitude_Radianes: sexagesimalToRadians(stationForm.latitudeSexagesimal) ?? '',
});

const hasCoordinate = (coordinate) => coordinate !== null
    && coordinate !== undefined
    && coordinate !== ''
    && Number.isFinite(Number(coordinate));

const hasMapCoordinates = (station) => (
    hasCoordinate(station?.latitude) && hasCoordinate(station?.longitude)
);

function Station() {
    const { t } = useTranslation(['text']);
    const location = useLocation();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latitude, setLat] = useState(40.415417);
    const [longitude, setLon] = useState(-3.695642);
    const [zoom, setZoom] = useState(6);
    const [showAdminMap, setShowAdminMap] = useState(false);
    const mapRef = useRef(null);
    const mapInstance = useRef(null); // Para almacenar la instancia del mapa
   
    const rol = localStorage.getItem('rol');
    const isStationAdminPanel = isAdminUser(rol) && location.pathname === '/admin-panel/station-panel';
    const [stationToDelete, setStationToDelete] = useState(null);
    const [stationForm, setStationForm] = useState(EMPTY_STATION);
    const [editingStationId, setEditingStationId] = useState(null);
    const [savingStation, setSavingStation] = useState(false);
    const [crudError, setCrudError] = useState(null);
    const [stationSearch, setStationSearch] = useState('');


const fetchStations = async ({ showLoading = false } = {}) => {
    try {
        if (showLoading) {
            setLoading(true);
        }

        setError(null);

        const data = await getStations();

        setStations(
            [...data].sort(sortStationsByObservatoryAndId)
        );
    } catch (err) {
        setError(err);
    } finally {
        if (showLoading) {
            setLoading(false);
        }
    }
};

useEffect(() => {
    fetchStations({ showLoading: true });
}, []);

    useEffect(() => {
        if (!loading && stations.length > 0) {
            // Destruir el mapa anterior antes de crear uno nuevo
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        }
    }, [stations, loading]);

    const cambiarDato = (lat2, lon2, zoom2) => {
        setLat(lat2);
        setLon(lon2);
        setZoom(zoom2);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };


    const fetchUpdateStation = async (id) => {
        try {
            await updateStationStatus(id);
            setStations(prevStations =>
                prevStations.map(st =>
                    st.id === id ? { ...st, state: st.state === 0 ? 1 : 0 } : st
                ).sort(sortStationsByObservatoryAndId)
            );
        } catch (error) {
            console.error('Error fetching report data:', error);
            setError(error);
        }
    }

    const openCreateStation = () => {
        setEditingStationId(null);
        setStationForm(EMPTY_STATION);
        setCrudError(null);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const openEditStation = (station) => {
        setEditingStationId(station.id);
        setStationForm(toStationForm(station));
        setCrudError(null);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleStationInput = (event) => {
        const { name, value } = event.target;
        setStationForm(currentForm => {
            const nextForm = { ...currentForm, [name]: value };

            return nextForm;
        });
    };

    const resetStationEditor = () => {
        if (savingStation) return;

        setEditingStationId(null);
        setStationForm(EMPTY_STATION);
        setCrudError(null);
    };

const saveStation = async () => {
    try {
        setSavingStation(true);
        setCrudError(null);

        const payload = {
            ...stationForm,
            ...computeStationRadians(stationForm),
        };

        if (editingStationId) {
            await updateStation(editingStationId, payload);
        } else {
            await createStation(payload);
        }

        // Volver a obtener los datos actualizados del backend
        await fetchStations();

        setEditingStationId(null);
        setStationForm(EMPTY_STATION);
    } catch (err) {
        setCrudError(
            err.response?.data?.message
            || 'No se pudo guardar la estación. Comprueba que el backend esté reiniciado con las rutas nuevas.'
        );
    } finally {
        setSavingStation(false);
    }
};

    const confirmDeleteStation = async () => {
        if (!stationToDelete) return;

        try {
            setSavingStation(true);
            setCrudError(null);
            await deleteStation(stationToDelete.id);
            setStations(currentStations => currentStations.filter(station => station.id !== stationToDelete.id));
            setStationToDelete(null);
        } catch (err) {
            setCrudError(err.response?.data?.message || 'No se pudo eliminar la estación.');
        } finally {
            setSavingStation(false);
        }
    };

    const mapKey = `${latitude}-${longitude}-${zoom}`;
    const renderedStations = [...stations]
        .filter(station => station?.id !== null && station?.id !== undefined)
        .filter(station => isStationAdminPanel || Number(station?.state) === 1)
        .sort(sortStationsByObservatoryAndId);
    const normalizedStationSearch = stationSearch.trim().toLowerCase();
    const stationSearchResults = normalizedStationSearch
        ? renderedStations.filter((station) => [
            station.stationName,
            station.name,
            station.credit,
            station.id,
            station.longitudeSexagesimal,
            station.latitudeSexagesimal,
        ].some(value => String(value ?? '').toLowerCase().includes(normalizedStationSearch)))
        : renderedStations;
    const selectedStation = editingStationId
        ? renderedStations.find(station => station.id === editingStationId)
        : null;

    const renderDeleteModal = () => (
        <Modal show={!!stationToDelete} onHide={() => !savingStation && setStationToDelete(null)}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar estación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {crudError && <Alert variant="danger">{crudError}</Alert>}
                Se eliminará {stationToDelete?.stationName || `la estación ${stationToDelete?.id}`}.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setStationToDelete(null)} disabled={savingStation}>Cancelar</Button>
                <Button variant="danger" onClick={confirmDeleteStation} disabled={savingStation}>
                    {savingStation ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    if (isStationAdminPanel) {
        return (
            <>
                <BackToAdminPanel />
                <div className="station-page station-admin-shell">
                    <section className="station-admin-hero">
                        <div className="station-admin-hero__copy">
                            <span className="station-admin-hero__eyebrow">Edición prioritaria</span>
                            <h1 className="station-admin-hero__title">Gestión de estaciones</h1>
                            <p className="station-admin-hero__subtitle">
                                Esta vista está pensada para trabajar rápido: edita, crea y corrige datos con el mapa como apoyo secundario.
                            </p>
                        </div>
                        <div className="station-admin-hero__actions">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowAdminMap((currentValue) => !currentValue)}
                            >
                                {showAdminMap ? 'Ocultar mapa de apoyo' : 'Mostrar mapa de apoyo'}
                            </Button>
                            <Button
                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                onClick={openCreateStation}
                            >
                                <Plus size={18} className="me-2" />
                                Nueva estación
                            </Button>
                        </div>
                    </section>

                    {loading ? (
                        <Alert variant="info" className="mb-0">Cargando estaciones...</Alert>
                    ) : error ? (
                        <Alert variant="danger" className="mb-0">No se han podido cargar las estaciones.</Alert>
                    ) : (
                        <div className="station-admin-workbench">
                            <Row className="g-4 align-items-start">
                                <Col xl={4}>
                                    <section className="station-admin-panel station-admin-panel--sticky">
                                        <div className="station-admin-panel__body">
                                            <div className="station-admin-panel__header">
                                                <div>
                                                    <p className="station-admin-panel__label">Editor rápido</p>
                                                    <h2 className="station-admin-panel__title">
                                                        {editingStationId ? `Editar estación ${editingStationId}` : 'Crear nueva estación'}
                                                    </h2>
                                                    <p className="station-admin-panel__text">
                                                        {editingStationId
                                                            ? 'Corrige los datos y guarda sin salir del panel.'
                                                            : 'Rellena los campos básicos para dar de alta una nueva estación.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {crudError && <Alert variant="danger">{crudError}</Alert>}

                                            <div className="station-admin-summary">
                                                <div className="station-admin-summary__label">Estado del formulario</div>
                                                <div className="station-admin-summary__value">
                                                    {selectedStation
                                                        ? `${selectedStation.stationName || 'Observatorio'} · cámara ${selectedStation.id}`
                                                        : 'Sin estación seleccionada'}
                                                </div>
                                            </div>

                                            <Form className="station-admin-form">
                                                <Row className="g-3">
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label>Número</Form.Label>
                                                            <Form.Control
                                                                required
                                                                disabled={!!editingStationId}
                                                                type="number"
                                                                min="1"
                                                                name="id"
                                                                value={stationForm.id}
                                                                onChange={handleStationInput}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={8}>
                                                        <Form.Group>
                                                            <Form.Label>Nombre del observatorio</Form.Label>
                                                            <Form.Control
                                                                required
                                                                name="stationName"
                                                                value={stationForm.stationName}
                                                                onChange={handleStationInput}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <Form.Label>Nombre de cámara</Form.Label>
                                                            <Form.Control name="name" value={stationForm.name} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Visible</Form.Label>
                                                            <Form.Select name="state" value={stationForm.state} onChange={handleStationInput}>
                                                                <option value="1">Visible</option>
                                                                <option value="0">No visible</option>
                                                                <option value="2">Colaboración</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Altitud</Form.Label>
                                                            <Form.Control type="number" step="any" name="height" value={stationForm.height} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <Form.Group>
                                                            <Form.Label>Descripción</Form.Label>
                                                            <Form.Control as="textarea" rows={2} name="description" value={stationForm.description} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Longitud en sexagesimal</Form.Label>
                                                            <Form.Control name="longitudeSexagesimal" value={stationForm.longitudeSexagesimal} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Latitud en sexagesimal</Form.Label>
                                                            <Form.Control name="latitudeSexagesimal" value={stationForm.latitudeSexagesimal} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Horizontal (píxeles)</Form.Label>
                                                            <Form.Control name="chipSize" value={stationForm.chipSize} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Vertical (píxeles)</Form.Label>
                                                            <Form.Control name="chipOrientation" value={stationForm.chipOrientation} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Máscara</Form.Label>
                                                            <Form.Control name="filter" value={stationForm.filter} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Créditos</Form.Label>
                                                            <Form.Control name="credit" value={stationForm.credit} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Directorio local</Form.Label>
                                                            <Form.Control name="localDirectory" value={stationForm.localDirectory} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Directorio nube</Form.Label>
                                                            <Form.Control name="cloudDirectory" value={stationForm.cloudDirectory} onChange={handleStationInput} />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <div className="station-admin-actions">
                                                    <Button variant="outline-secondary" onClick={resetStationEditor} disabled={savingStation}>
                                                        Limpiar
                                                    </Button>
                                                    <Button variant="secondary" onClick={openCreateStation} disabled={savingStation}>
                                                        Nueva estación
                                                    </Button>
                                                    <Button style={{ backgroundColor: '#980100', borderColor: '#980100' }} onClick={saveStation} disabled={savingStation}>
                                                        {savingStation ? 'Guardando...' : editingStationId ? 'Guardar cambios' : 'Crear estación'}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    </section>
                                </Col>

                                <Col xl={8}>
                                    <section className="station-admin-panel">
                                        <div className="station-admin-panel__body">
                                            <div className="station-admin-list__header">
                                                <div>
                                                    <h2 className="station-admin-list__title">Inventario de estaciones</h2>
                                                    <p className="station-admin-list__meta">
                                                        Ordenadas por observatorio para que se vea de un vistazo cada cámara o configuración.
                                                    </p>
                                                </div>
                                                <Badge bg="light" text="dark">
                                                    {renderedStations.length} registros
                                                </Badge>
                                            </div>

                                            <div className="table-responsive">
                                                <Table striped hover responsive className="align-middle station-admin-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Número</th>
                                                            <th>Observatorio</th>
                                                            <th>Cámara</th>
                                                            <th>Latitud y longitud</th>
                                                            <th>Resolución</th>
                                                            <th>Visible</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {renderedStations.map((station) => (
                                                            <tr key={station.id} className={editingStationId === station.id ? 'is-selected' : ''}>
                                                                <td>{station.id}</td>
                                                                <td>
                                                                    <div className="fw-semibold">{station.stationName || '-'}</div>
                                                                    <div className="text-muted small">{station.credit || '-'}</div>
                                                                </td>
                                                                <td>{station.name || '-'}</td>
                                                                <td>{formatStationCoordinates(station)}</td>
                                                                <td>{station.resolution || formatResolution(station.chipSize, station.chipOrientation)}</td>
                                                                <td>
                                                                    <Badge bg={station.state === 1 ? 'success' : station.state === 0 ? 'secondary' : 'primary'}>
                                                                        {station.state === 1 ? 'Visible' : station.state === 0 ? 'No visible' : 'Colaboración'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-wrap gap-2">
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            className="d-inline-flex align-items-center"
                                                                            title="Editar estación"
                                                                            aria-label={`Editar ${station.stationName || station.id}`}
                                                                            onClick={() => openEditStation(station)}
                                                                        >
                                                                            <Pencil size={16} />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            className="d-inline-flex align-items-center"
                                                                            title="Eliminar estación"
                                                                            aria-label={`Eliminar ${station.stationName || station.id}`}
                                                                            onClick={() => {
                                                                                setCrudError(null);
                                                                                setStationToDelete(station);
                                                                            }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </Button>
                                                                        <Button
                                                                            variant={station.state === 1 ? 'warning' : 'success'}
                                                                            size="sm"
                                                                            onClick={() => fetchUpdateStation(station.id)}
                                                                        >
                                                                            {station.state === 1 ? 'Ocultar' : 'Mostrar'}
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </section>
                                </Col>
                            </Row>

                            <section className="station-admin-map-toggle">
                                <div className="station-admin-map-toggle__copy">
                                    <h3 className="station-admin-map-toggle__title">Mapa de apoyo</h3>
                                    <p className="station-admin-map-toggle__text">
                                        Úsalo solo cuando necesites verificar la posición. El trabajo principal se hace en el editor y la tabla.
                                    </p>
                                </div>
                                <Button
                                    variant={showAdminMap ? 'outline-secondary' : 'outline-primary'}
                                    onClick={() => setShowAdminMap((currentValue) => !currentValue)}
                                >
                                    {showAdminMap ? 'Ocultar mapa' : 'Mostrar mapa'}
                                </Button>
                            </section>

                            {showAdminMap ? (
                                <section className="station-admin-map">
                                    <div className="station-admin-map__body">
                                        <StationMapChart
                                            key={mapKey}
                                            data={renderedStations}
                                            activePopUp
                                            latitude={latitude}
                                            longitude={longitude}
                                            zoom={5}
                                            height={520}
                                        />
                                    </div>
                                </section>
                            ) : null}
                        </div>
                    )}
                </div>
                {renderDeleteModal()}
            </>
        );
    }

    return (
        <>
            <div className="station-page station-public-shell">
                <section className="station-map-panel" aria-label="Mapa de estaciones">
                    <div className="station-map-panel__body">
                        {loading ? (
                            <Alert variant="info" className="mb-0">{t('STATION.LOADING_MSG')}</Alert>
                        ) : error ? (
                            <Alert variant="danger" className="mb-0">{t('STATION.ERROR_MSG')}</Alert>
                        ) : (
                            <StationMapChart
                                key={mapKey}
                                data={renderedStations}
                                activePopUp
                                latitude={latitude}
                                longitude={longitude}
                                zoom={zoom}
                                height={560}
                            />
                        )}
                    </div>
                </section>

                <section className="station-list-panel" aria-label={t('STATION.STATION_LIST')}>
                    <div className="station-list-panel__toolbar">
                        <div className="station-list-panel__title-group">
                            <h1 className="station-list-panel__title">{t('STATION.STATION_LIST')}</h1>
                            <p className="station-list-panel__meta">
                                {stationSearchResults.length} de {renderedStations.length} estaciones
                            </p>
                        </div>

                        <div className="station-search">
                            <Search size={17} aria-hidden="true" />
                            <Form.Control
                                type="search"
                                value={stationSearch}
                                onChange={(event) => setStationSearch(event.target.value)}
                                placeholder="Buscar estación, cámara o créditos"
                                aria-label="Buscar estación"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <Alert variant="info">{t('STATION.LOADING_MSG')}</Alert>
                    ) : error ? (
                        <Alert variant="danger">{t('STATION.ERROR_MSG')}</Alert>
                    ) : stationSearchResults.length === 0 ? (
                        <Alert variant="light" className="station-empty-state">
                            No hay estaciones que coincidan con la búsqueda.
                        </Alert>
                    ) : (
                        <ListGroup className="station-public-list">
                            {stationSearchResults.map((station) => (
                                <ListGroup.Item key={station.id} className="station-public-list__item">
                                    <div className="station-public-list__identity">
                                        <Badge bg="light" text="dark" className="station-public-list__id">#{station.id}</Badge>
                                        <div>
                                            <h2 className="station-public-list__name">{station.stationName || '-'}</h2>
                                            <p className="station-public-list__camera">{station.name || 'Cámara sin nombre'}</p>
                                        </div>
                                    </div>

                                    <div className="station-public-list__description">{station.description || '-'}</div>

                                    <dl className="station-public-list__details">
                                        <div className="station-public-list__detail">
                                            <dt>{t('STATION.STATION.COORDINATES')}</dt>
                                            <dd>{formatStationCoordinates(station)}</dd>
                                        </div>
                                        <div className="station-public-list__detail">
                                            <dt>{t('STATION.STATION.RESOLUTION')}</dt>
                                            <dd>{station.resolution || formatResolution(station.chipSize, station.chipOrientation)}</dd>
                                        </div>
                                        <div className="station-public-list__detail">
                                            <dt>{t('STATION.STATION.ALTITUDE')}</dt>
                                            <dd>{station.height ?? '-'} {station.height !== null && station.height !== undefined && station.height !== '' ? t('STATION.STATION.HEIGHT.MEASURE') : ''}</dd>
                                        </div>
                                        <div className="station-public-list__detail">
                                            <dt>{t('STATION.STATION.CREDITS')}</dt>
                                            <dd>{station.credit || '-'}</dd>
                                        </div>
                                    </dl>

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="station-public-list__button"
                                        disabled={!hasMapCoordinates(station)}
                                        onClick={() => cambiarDato(station.latitude, station.longitude, 10)}
                                    >
                                        <LocateFixed size={16} aria-hidden="true" />
                                        <span>{t('STATION.SHOW_BUTTON')}</span>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </section>
            </div>
            {renderDeleteModal()}
        </>
    );
}

export default Station;
