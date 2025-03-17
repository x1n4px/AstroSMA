import StationMapChart from '@/components/map/StationMapChart';
import React, { useState, useEffect, useRef } from 'react';
import { Button, ListGroup, Badge } from 'react-bootstrap';
import { getStations } from '@/services/stationService';

function Station() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lat, setLat] = useState(40.415417);
    const [lon, setLon] = useState(-3.695642);
    const [zoom, setZoom] = useState(6);
    const mapRef = useRef(null); // Usamos useRef para el mapa
    

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
        // Este useEffect se ejecuta cuando stations cambia y loading es false
        if (!loading && stations.length > 0) {
            // Force re-render of the map
            if (mapRef.current) {
                mapRef.current.leafletElement.invalidateSize();
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

    const mapKey = `${lat}-${lon}-${zoom}`;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Mapa de Estaciones Espaciales</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>
                La Red de detección de Bólidos y Meteoros de la Universidad de Málaga...
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                {loading ? (
                    <p>Cargando mapa...</p>
                ) : error ? (
                    <p>Error al cargar el mapa.</p>
                ) : (
                    <StationMapChart
                        ref={mapRef} // Usamos ref aquí
                        key={mapKey}
                        data={stations}
                        activePopUp={true}
                        lat={lat}
                        lon={lon}
                        zoom={zoom}
                    />
                )}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', textAlign: 'center' }}>Lista de Estaciones</h2>
            <div >
                {loading ? (
                    <p>Cargando estaciones...</p>
                ) : error ? (
                    <p>Error al cargar estaciones.</p>
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
                                            backgroundColor: station.state === 0 ? 'green' : station.state === 1 ? 'orange' : 'blue',
                                        }}
                                    ></span>
                                    <span className="fw-bold">{station.title}</span>
                                </div>
                                <div className="text-center" style={{ minWidth: '150px' }}>
                                    <Badge
                                        bg={station.state === 0 ? 'success' : station.state === 1 ? 'warning' : 'primary'}
                                        className="text-capitalize"
                                    >
                                        {station.state === 0 ? 'Activo' : station.state === 1 ? 'En construcción' : 'Colaboración'}
                                    </Badge>
                                </div>
                                <Button variant="outline-primary" size="sm" onClick={() => cambiarDato(station.lat, station.lon, 10)}>
                                    Ver en mapa
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>
        </div>
    );
}

export default Station;