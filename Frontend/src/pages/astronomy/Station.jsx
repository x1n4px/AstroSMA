import StationMapChart from '@/components/map/StationMapChart';
import React, { useState, useEffect, useRef } from 'react';
import { Button, ListGroup, Badge } from 'react-bootstrap';
import { getStations, updateStationStatus } from '@/services/stationService';
import { isNotQRUser, isAdminUser, controlGeminiError } from '@/utils/roleMaskUtils';
import { useLocation } from "react-router-dom";
import BackToAdminPanel from '@/components/admin/BackToAdminPanel.jsx'; // Asegúrate de que la ruta sea correcta

// Internationalization
import { useTranslation } from 'react-i18next';

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
            const response = await updateStationStatus(id);
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

    const mapKey = `${latitude}-${longitude}-${zoom}`;

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
                            data={stations}
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
                            {stations.map((station) => (
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
                                        ) }

                                    </div>

                                    <Button variant="outline-primary" size="sm" onClick={() => cambiarDato(station.latitude, station.longitude, 10)}>
                                        {t('STATION.SHOW_BUTTON')}
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            </div>
        </>
    );
}

export default Station;