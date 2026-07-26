import './Station.css';

import StationMapChart from '@/components/map/StationMapChart';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Badge, Button, Col, Form, ListGroup, Modal, Row, Table } from 'react-bootstrap';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    longitude_Radianes: '',
    latitude_Radianes: '',
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
    longitude_Radianes: station.longitude_Radianes ?? '',
    latitude_Radianes: station.latitude_Radianes ?? '',
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


    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await getStations();
                setStations(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
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
                )
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

            if (name === 'longitudeSexagesimal' || name === 'latitudeSexagesimal') {
                const computedRadians = computeStationRadians(nextForm);
                nextForm.longitude_Radianes = computedRadians.longitude_Radianes;
                nextForm.latitude_Radianes = computedRadians.latitude_Radianes;
            }

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

            const savedStation = editingStationId
                ? await updateStation(editingStationId, payload)
                : await createStation(payload);

            if (!savedStation?.id) {
                throw new Error('Station save returned an invalid response');
            }

            setStations(currentStations => editingStationId
                ? currentStations.map(station => station.id === editingStationId ? savedStation : station)
                : [...currentStations, savedStation]
            );

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
    const renderedStations = stations
        .filter(station => station?.id !== null && station?.id !== undefined)
        .filter(station => isStationAdminPanel || Number(station?.state) === 1)
        .sort(sortStationsByObservatoryAndId);
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
                                                            <Form.Label>Estado</Form.Label>
                                                            <Form.Select name="state" value={stationForm.state} onChange={handleStationInput}>
                                                                <option value="1">Activa</option>
                                                                <option value="0">En colaboración</option>
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
                                                            <th>Estado</th>
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
                                                                    <Badge bg={station.state === 1 ? 'success' : station.state === 0 ? 'warning' : 'primary'}>
                                                                        {station.state === 1 ? 'Activa' : station.state === 0 ? 'En colaboración' : 'Colaboración'}
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
                                                                            {station.state === 1 ? 'Desactivar' : 'Activar'}
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
            <div className="station-page">
                <h1 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>{t('STATION.TITLE')}</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>
                    {t('STATION.DESCRIPTION')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {loading ? (
                        <p>{t('STATION.LOADING_MSG')}</p>
                    ) : error ? (
                        <p>{t('STATION.ERROR_MSG')}</p>
                    ) : (
                        <StationMapChart
                            key={mapKey}
                            data={renderedStations}
                            activePopUp
                            latitude={latitude}
                            longitude={longitude}
                            zoom={zoom}
                        />
                    )}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', textAlign: 'center' }}>{t('STATION.STATION_LIST')}</h2>
                <div>
                    {loading ? (
                        <p>{t('STATION.ERROR_MSG')}</p>
                    ) : error ? (
                        <p>{t('STATION.ERROR_MSG')}</p>
                    ) : (
                        <ListGroup>
                            {renderedStations.map((station) => (
                                <ListGroup.Item key={station.id} className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                                    <div className="d-flex align-items-start flex-grow-1 gap-2">
                                        <span
                                            className="rounded-circle me-2"
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: station.state === 1 ? 'green' : station.state === 0 ? 'orange' : 'blue',
                                                marginTop: '0.35rem',
                                            }}
                                        ></span>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">{station.stationName || '-'}</div>
                                            <div className="text-muted small">
                                                {t('STATION.STATION.COORDINATES')}: {formatStationCoordinates(station)}
                                            </div>
                                            <div className="text-muted small">
                                                {t('STATION.STATION.RESOLUTION')} {station.id}: {station.resolution || formatResolution(station.chipSize, station.chipOrientation)}
                                            </div>
                                            <div className="text-muted small">
                                                {t('STATION.STATION.ALTITUDE')}: {station.height ?? '-'} m
                                            </div>
                                            <div className="text-muted small">
                                                {t('STATION.STATION.CREDITS')}: {station.credit || '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        disabled={!hasMapCoordinates(station)}
                                        onClick={() => cambiarDato(station.latitude, station.longitude, 10)}
                                    >
                                        {t('STATION.SHOW_BUTTON')}
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            </div>
            {renderDeleteModal()}
        </>
    );
}

export default Station;
