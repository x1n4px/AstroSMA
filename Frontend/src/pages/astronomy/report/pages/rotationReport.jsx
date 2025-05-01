import React, { useState, useEffect } from 'react';
import BolideTrajectoryMap from '@/components/three/BolideTrajectory';

const RotationReport = ({ data }) => {
    const [showFirstMap, setShowFirstMap] = useState(true);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        if (data && data.Inicio_de_la_trayectoria_Estacion_1 && data.Fin_de_la_trayectoria_Estacion_1 &&
            data.Inicio_de_la_trayectoria_Estacion_2 && data.Fin_de_la_trayectoria_Estacion_2) {
            
            // Mostrar el primer mapa
            setMapKey(1);
            
            // Después de un tiempo, ocultar el primer mapa y mostrar el segundo
            const timer = setTimeout(() => {
                setShowFirstMap(false);
                setMapKey(prevKey => prevKey + 1);
            }, 100); // Ajusta este tiempo según necesites
            
            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!data || !data.Inicio_de_la_trayectoria_Estacion_1 || !data.Fin_de_la_trayectoria_Estacion_1 ||
        !data.Inicio_de_la_trayectoria_Estacion_2 || !data.Fin_de_la_trayectoria_Estacion_2) {
        return <div>Cargando datos...</div>;
    }

    return (
        <div>
            <div style={{ width: 'auto', height: '1500px' }}>
                {showFirstMap ? (
                    <BolideTrajectoryMap
                        key={`first-${mapKey}`}
                        startPoint={{
                            lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.latitude),
                            lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.longitude),
                            alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.height) ,
                        }}
                        endPoint={{
                            lat: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.latitude),
                            lon: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.longitude),
                            alt: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.height) ,
                        }}
                        startPoint2={{
                            lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.latitude),
                            lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.longitude),
                            alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.height) ,
                        }}
                        endPoint2={{
                            lat: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.latitude),
                            lon: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.longitude),
                            alt: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.height),
                        }}
                        autoRotate={false}
                    />
                ) : (
                    <BolideTrajectoryMap
                        key={`second-${mapKey}`}
                        startPoint={{
                            lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.latitude),
                            lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.longitude),
                            alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.height) / 1000,
                        }}
                        endPoint={{
                            lat: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.latitude),
                            lon: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.longitude),
                            alt: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.height) / 1000,
                        }}
                        startPoint2={{
                            lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.latitude),
                            lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.longitude),
                            alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.height) / 1000,
                        }}
                        endPoint2={{
                            lat: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.latitude),
                            lon: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.longitude),
                            alt: parseFloat(data.Fin_de_la_trayectoria_Estacion_2.height) / 1000,
                        }}
                        autoRotate={false}
                    />
                )}
            </div>
        </div>
    );
};

export default RotationReport;