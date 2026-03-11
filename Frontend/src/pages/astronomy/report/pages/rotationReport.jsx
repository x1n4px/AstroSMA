import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import BolideTrajectoryMap from '@/components/three/BolideTrajectory';
import {
    ReportPanel,
    ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

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
        return <ReportEmptyState message="No hay datos suficientes para la vista 3D de rotacion." />;
    }

    return (
        <Container fluid className="px-0 mt-4">
            <Row className="g-4">
                <Col xs={12}>
                    <ReportPanel
                        title="Trayectoria 3D alternativa"
                        description="Vista adicional del modelo de trayectoria con escala de altura ajustada."
                        accent="cool"
                    >
                        <div style={{ width: '100%', height: '52rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e5ebf3' }}>
                            {showFirstMap ? (
                                <BolideTrajectoryMap
                                    key={`first-${mapKey}`}
                                    startPoint={{
                                        lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.latitude),
                                        lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.longitude),
                                        alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_1.height),
                                    }}
                                    endPoint={{
                                        lat: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.latitude),
                                        lon: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.longitude),
                                        alt: parseFloat(data.Fin_de_la_trayectoria_Estacion_1.height),
                                    }}
                                    startPoint2={{
                                        lat: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.latitude),
                                        lon: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.longitude),
                                        alt: parseFloat(data.Inicio_de_la_trayectoria_Estacion_2.height),
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
                    </ReportPanel>
                </Col>
            </Row>
        </Container>
    );
};

export default RotationReport;
