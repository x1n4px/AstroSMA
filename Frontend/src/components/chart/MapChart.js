

import { useNavigate } from "react-router-dom";

import React, { act } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';



const MapChart = ({ data, activePopUp, lat = 40.4165, lon = -3.70256 , zoom = 11 }) => {

    const navigate = useNavigate();


    return (
        <MapContainer center={[lat, lon]} zoom={[zoom]} style={{ width: '100%', height: '800px' }} >
            {/* Capa base del mapa (Mapa de OpenStreetMap) */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Marcadores */}
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

            
        </MapContainer>
    );
}

export default MapChart;