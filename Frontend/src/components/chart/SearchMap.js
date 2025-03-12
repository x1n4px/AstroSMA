import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import '../../assets/SearchMap.css';

const SearchMap = ({ data, activePopUp, lat = 40.4165, lon = -3.70256, zoom = 11, ratioFilter = 200 }) => {
    const navigate = useNavigate();
    const circleRef = useRef(null);

    useEffect(() => {
        if (circleRef.current && ratioFilter) {
            const radiusMeters = parseFloat(ratioFilter) * 1000;
            circleRef.current.setRadius(radiusMeters);
        }
    }, [ratioFilter]);

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
                <Circle
                    center={[lat, lon]}
                    radius={parseFloat(ratioFilter) * 1000}
                    pathOptions={{ color: 'green', fillOpacity: 0.1 }}
                    ref={circleRef}
                    className="search-circle"
                />
            )}
        </MapContainer>
    );
};

export default SearchMap;