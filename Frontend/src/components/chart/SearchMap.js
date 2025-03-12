import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import '../../assets/SearchMap.css';
import Radar from './Radar';

const SearchMap = ({ data, activePopUp, lat = 40.4165, lon = -3.70256, zoom = 11, ratioFilter = 200, latLonChecked }) => {
    const navigate = useNavigate();
    const circleRef = useRef(null);
    const [wedgeAngle, setWedgeAngle] = useState(0);

    useEffect(() => {
        if (circleRef.current && ratioFilter) {
            const radiusMeters = parseFloat(ratioFilter) * 1000;
            circleRef.current.setRadius(radiusMeters);
        }
    }, [ratioFilter]);

    useEffect(() => {
        const interval = setInterval(() => {
            setWedgeAngle((prevAngle) => (prevAngle + 1) % 360);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const getWedgePoints = () => {
        if (!ratioFilter) return [];

        const radiusMeters = parseFloat(ratioFilter) * 1000;
        const angleRad = (20 * Math.PI) / 180;
        const rotationRad = (wedgeAngle * Math.PI) / 180;

        const point1 = calculatePoint(lat, lon, radiusMeters, rotationRad - angleRad / 2);
        const point2 = calculatePoint(lat, lon, radiusMeters, rotationRad + angleRad / 2);

        return [[lat, lon], point1, point2];
    };

    const calculatePoint = (lat, lon, radiusMeters, angleRad) => {
        const earthRadiusMeters = 6371 * 1000;
        const angularDistance = radiusMeters / earthRadiusMeters;

        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;

        const newLatRad = Math.asin(Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(angleRad));

        const newLonRad = lonRad + Math.atan2(Math.sin(angleRad) * Math.sin(angularDistance) * Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad));

        return [newLatRad * 180 / Math.PI, newLonRad * 180 / Math.PI];
    };

    return (
        <MapContainer center={[lat, lon]} zoom={zoom} style={{ width: '100%', height: '800px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.map((punto, index) => (
                <Marker
                    key={index}
                    position={[punto.lat, punto.lon]}
                    icon={new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png', iconSize: [25, 25] })}
                >
                    {activePopUp && (
                        <Popup>
                            <div>
                                <p>{punto.title}</p>
                                <button
                                    onClick={() => navigate(`/bolide/${punto.id}`)}
                                    style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ver detalles
                                </button>
                            </div>
                        </Popup>
                    )}
                </Marker>
            ))}
            {ratioFilter && (
                <>
                {latLonChecked &&
                    <Circle
                        center={[lat, lon]}
                        radius={parseFloat(ratioFilter) * 1000}
                        pathOptions={{ color: 'green', fillOpacity: 0.1 }}
                        ref={circleRef}
                        className="search-circle"
                    />
                    
                }
                </>
            )}
        </MapContainer>
    );
};

export default SearchMap;