import StationMapChart from '@/components/map/StationMapChart';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Badge, Button, Col, Form, ListGroup, Modal, Row, Table } from 'react-bootstrap';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { createStation, deleteStation, getStations, updateStation, updateStationStatus } from '@/services/stationService';
import { isAdminUser } from '@/utils/roleMaskUtils';
import { useLocation } from "react-router-dom";
import BackToAdminPanel from '@/components/admin/BackToAdminPanel.jsx'; // Asegúrate de que la ruta sea correcta

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
    const mapRef = useRef(null);
    const mapInstance = useRef(null); // Para almacenar la instancia del mapa
   
    const rol = localStorage.getItem('rol');
    const isStationAdminPanel = isAdminUser(rol) && location.pathname === '/admin-panel/station-panel';
    const [showStationModal, setShowStationModal] = useState(false);
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
        setShowStationModal(true);
    };

    const openEditStation = (station) => {
        setEditingStationId(station.id);
        setStationForm(toStationForm(station));
        setCrudError(null);
        setShowStationModal(true);
    };

    const handleStationInput = (event) => {
        const { name, value } = event.target;
        setStationForm(currentForm => ({ ...currentForm, [name]: value }));
    };

    const closeStationModal = () => {
        if (savingStation) return;

        setShowStationModal(false);
        setEditingStationId(null);
        setStationForm(EMPTY_STATION);
        setCrudError(null);
    };

    const saveStation = async () => {
        try {
            setSavingStation(true);
            setCrudError(null);

            const savedStation = editingStationId
                ? await updateStation(editingStationId, stationForm)
                : await createStation(stationForm);

            if (!savedStation?.id) {
                throw new Error('Station save returned an invalid response');
            }

            setStations(currentStations => editingStationId
                ? currentStations.map(station => station.id === editingStationId ? savedStation : station)
                : [...currentStations, savedStation]
            );

            setShowStationModal(false);
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
    const renderedStations = stations.filter(station => station?.id !== null && station?.id !== undefined);

    return (

        <>
            {location.pathname === '/admin-panel/station-panel' && <BackToAdminPanel />}
            <div style={{ padding: '20px' }}>
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
                            ref={(ref) => {
                                mapRef.current = ref;
                                if (ref && ref.leafletElement) {
                                    mapInstance.current = ref.leafletElement;
                                }
                            }}
                            key={mapKey}
                            data={renderedStations}
                            activePopUp={true}
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
                                <ListGroup.Item key={station.id} className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <span
                                            className="rounded-circle me-2"
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: station.state === 1 ? 'green' : station.state === 0 ? 'orange' : 'blue',
                                            }}
                                        ></span>
                                        <span className="fw-bold">{station.stationName}</span>
                                    </div>
                                    <div className="text-center" style={{ minWidth: '150px' }}>
                                        <Badge
                                            bg={
                                                station.state === 1
                                                    ? 'success'
                                                    : station.state === 0
                                                        ? 'warning'
                                                        : 'primary'
                                            }
                                            className="text-capitalize"
                                        >
                                            {station.state === 1
                                                ? t('STATION.STATUS.ACTIVE')
                                                : station.state === 0
                                                    ? t('STATION.STATUS.CONSTRUCTING')
                                                    : t('STATION.STATUS.COLLABORATION')}
                                        </Badge>
                                    </div>
                                    <div className="text-center mx-2" style={{ minWidth: '150px' }}>
                                        {(isAdminUser(rol) && location.pathname === '/admin-panel/station-panel') && (
                                            <Button
                                                variant={station.state === 1 ? 'warning' : 'success'}
                                                size="sm"
                                                onClick={() => fetchUpdateStation(station.id)}
                                            >
                                                {station.state === 1
                                                    ? t('STATION.ACTION.ACTIVATE')
                                                    : t('STATION.ACTION.DEACTIVATE')}
                                            </Button>
                                        )}

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

                {isStationAdminPanel && (
                    <section className="mt-5">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                            <div>
                                <h2 className="h4 mb-1">Gestión de estaciones</h2>
                                <p className="text-muted mb-0">Alta, edición y borrado de observatorios.</p>
                            </div>
                            <Button
                                className="d-inline-flex align-items-center gap-2 align-self-start align-self-md-center"
                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                onClick={openCreateStation}
                            >
                                <Plus size={18} />
                                Nueva estación
                            </Button>
                        </div>

                        {crudError && <Alert variant="danger">{crudError}</Alert>}

                        <Table striped bordered hover responsive className="align-middle">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Observatorio</th>
                                    <th>Cámara</th>
                                    <th>Coordenadas</th>
                                    <th>Altitud</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderedStations.map((station) => (
                                    <tr key={station.id}>
                                        <td>{station.id}</td>
                                        <td>{station.stationName || '-'}</td>
                                        <td>{station.name || '-'}</td>
                                        <td>
                                            <div>Lat: {station.latitudeSexagesimal || '-'}</div>
                                            <div>Lon: {station.longitudeSexagesimal || '-'}</div>
                                        </td>
                                        <td>{station.height ?? '-'}</td>
                                        <td>
                                            <Badge bg={station.state === 1 ? 'success' : station.state === 0 ? 'warning' : 'primary'}>
                                                {station.state === 1 ? 'Activa' : station.state === 0 ? 'En colaboración' : 'Colaboración'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </section>
                )}
            </div>

            <Modal show={showStationModal} onHide={closeStationModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingStationId ? 'Editar estación' : 'Nueva estación'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {crudError && <Alert variant="danger">{crudError}</Alert>}
                    <Form>
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
                            <Col md={6}>
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
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="description" value={stationForm.description} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Longitud sexagesimal</Form.Label>
                                    <Form.Control name="longitudeSexagesimal" value={stationForm.longitudeSexagesimal} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Latitud sexagesimal</Form.Label>
                                    <Form.Control name="latitudeSexagesimal" value={stationForm.latitudeSexagesimal} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Longitud radianes</Form.Label>
                                    <Form.Control type="number" step="any" name="longitude_Radianes" value={stationForm.longitude_Radianes} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Latitud radianes</Form.Label>
                                    <Form.Control type="number" step="any" name="latitude_Radianes" value={stationForm.latitude_Radianes} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Altitud</Form.Label>
                                    <Form.Control type="number" step="any" name="height" value={stationForm.height} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Tamaño de chip</Form.Label>
                                    <Form.Control name="chipSize" value={stationForm.chipSize} onChange={handleStationInput} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Orientación de chip</Form.Label>
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeStationModal} disabled={savingStation}>Cancelar</Button>
                    <Button onClick={saveStation} disabled={savingStation}>
                        {savingStation ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Modal.Footer>
            </Modal>

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
        </>
    );
}

export default Station;
