import { useNavigate } from "react-router-dom";
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const MapChart = ({ data, stations, activePopUp = true }) => {
    const navigate = useNavigate();

    const { centerLat, centerLon, zoom } = useMemo(() => {
        if (!data || data.length === 0) {
            return { centerLat: 40.4165, centerLon: -3.70256, zoom: 11 };
        }

        let sumLat = 0;
        let sumLon = 0;
        let maxDist = 0;

        for (let i = 0; i < data.length; i++) {
            sumLat += data[i].lat;
            sumLon += data[i].lon;

            for (let j = i + 1; j < data.length; j++) {
                const dist = L.latLng(data[i].lat, data[i].lon).distanceTo(L.latLng(data[j].lat, data[j].lon));
                maxDist = Math.max(maxDist, dist);
            }
        }

        const centerLat = sumLat / data.length;
        const centerLon = sumLon / data.length;

        let zoomLevel = 11;

        if (maxDist < 100000) {
            zoomLevel = 9;
        } else if (maxDist < 500000) {
            zoomLevel = 7;
        } else if (maxDist < 1000000) {
            zoomLevel = 6;
        } else {
            zoomLevel = 5;
        }

        return { centerLat, centerLon, zoom: zoomLevel };
    }, [data]);

    const polylinePoints = data.map((punto) => [punto.lat, punto.lon]);

    const polylineSegments = useMemo(() => {
        if (!data || data.length < 2) return [];

        const segments = [];
        for (let i = 0; i < data.length - 1; i++) {
            const start = data[i];
            const end = data[i + 1];
            const heightDiff = end.height - start.height;

            let color = 'blue';
            if (heightDiff > 0) {
                color = 'green';
            } else if (heightDiff < 0) {
                color = 'red';
            }

            segments.push({
                positions: [[start.lat, start.lon], [end.lat, end.lon]],
                color: color,
            });
        }
        return segments;
    }, [data]);

    return (
        <MapContainer center={[centerLat, centerLon]} zoom={zoom} style={{ width: '100%', height: '500px' }} scrollWheelZoom={false} >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {polylineSegments.map((segment, index) => (
                <Polyline key={index} positions={segment.positions} color={segment.color} />
            ))}
            {data.map((punto, index) => (
                <div key={index} style={{ position: 'relative' }}>
                    {/* Texto Inicio/Final */}
                    {index === 0 && (
                        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px' }}>
                            Inicio
                        </div>
                    )}
                    {index === data.length - 1 && (
                        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px' }}>
                            Final
                        </div>
                    )}
                    <Marker
                        position={[punto.lat, punto.lon]}
                        icon={new L.Icon({ iconUrl: 'asteroide.png', iconSize: [25, 25] })}
                    >
                       <Tooltip permanent={true} direction="top" offset={[0, -10]}>
                        <div style={{
                            backgroundColor: 'white',
                            border: '1px solid black',
                            borderRadius: '5px',
                            padding: '5px',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}>
                            {index === 0 && <p style={{ margin: '0' }}>Inicio</p>}
                            {index === data.length - 1 && <p style={{ margin: '0' }}>Fin</p>}
                            <p style={{ margin: '0' }}>Altura: {punto.height}km</p>
                        </div>
                    </Tooltip>
                    </Marker>
                </div>
            ))}
            {stations.map((station, index) => (
                <Marker
                    key={index}
                    position={[station.lat, station.lon]}
                    icon={new L.Icon({
                        iconUrl: 'antena.png',
                        iconSize: [25, 25],
                        iconAnchor: [12, 25],
                    })}
                >
                    {activePopUp && (
                        <Popup>
                            <div>
                                <p>{station.title}</p>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapChart;