import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Pending from '@/components/chart/Pending.jsx';

const PendingReport = ({ reportData }) => {
    // Extraer datos relevantes
    const distanciaEstacion1 = parseFloat(reportData.Distancia_recorrida_Estacion_1);
    const distanciaEstacion2 = parseFloat(reportData.Distancia_recorrida_Estacion_2);
    const tiempoEstacion1 = parseFloat(reportData.Tiempo_Estacion_1);
    const tiempoEstacion2 = parseFloat(reportData.Tiempo_trayectoria_en_estacion_2);
    const velocidadMedia = parseFloat(reportData.Velocidad_media);
    const velocidadInicialEstacion2 = parseFloat(reportData.Velocidad_Inicial_Estacion_2);
    const aceleracionKms = parseFloat(reportData.Aceleración_en_Kms);

    // Preparar datos para el gráfico
    const data = [
        {
            name: 'Estación 1',
            distancia: distanciaEstacion1,
            tiempo: tiempoEstacion1,
            velocidad: velocidadMedia,
        },
        {
            name: 'Estación 2',
            distancia: distanciaEstacion2,
            tiempo: tiempoEstacion2,
            velocidad: velocidadInicialEstacion2,
        }
    ];

    console.log(data)
    return (
        <Container>
            <Row className="justify-content-center">
                {data.map((punto, index) => (
                    <Col key={index} md={6} className="text-center">
                        <p>
                            {punto.name}: Distancia: {punto.distancia} km, Altura: {punto.tiempo}
                        </p>
                    </Col>
                ))}
            </Row>
            <Row>

                <Col>
                    <div>
                        <Pending data={data} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PendingReport;