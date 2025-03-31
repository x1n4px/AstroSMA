import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Pending from '@/components/chart/Pending.jsx';
import { useTranslation } from 'react-i18next';
import SlopeMap from '@/components/map/SlopeMap';



const PendingReport = ({ reportData, observatory }) => {
    console.log(observatory)
    const { t } = useTranslation(['text']);

    if (!reportData) {
        return <p>{t('REPORT.PENDING.NO_DATA')}</p>; // Manejo de datos faltantes
    }


    const data = [
        {
            id: reportData.Observatorio_Número,
            name: t('REPORT.PENDING.STATION_1'),
            start: reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ' ' + reportData.Inicio_de_la_trayectoria_Estacion_1.longitude,
            initialDistance: reportData.Inicio_de_la_trayectoria_Estacion_1.distance,
            initialHeight: reportData.Inicio_de_la_trayectoria_Estacion_1.height,
            end: reportData.Fin_de_la_trayectoria_Estacion_1.latitud + ' ' + reportData.Fin_de_la_trayectoria_Estacion_1.longitude,
            finalDistance: reportData.Fin_de_la_trayectoria_Estacion_1.distance,
            finalHeight: reportData.Fin_de_la_trayectoria_Estacion_1.height,
            time: reportData.Tiempo_Estacion_1
        },
        {
            id: reportData.Observatorio_Número2,
            name: t('REPORT.PENDING.STATION_2'),
            start: reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ' ' + reportData.Inicio_de_la_trayectoria_Estacion_2.longitude,
            initialDistance: reportData.Inicio_de_la_trayectoria_Estacion_2.distance,
            initialHeight: reportData.Inicio_de_la_trayectoria_Estacion_2.height,
            end: reportData.Fin_de_la_trayectoria_Estacion_2.latitud + ' ' + reportData.Fin_de_la_trayectoria_Estacion_2.longitude,
            finalDistance: reportData.Fin_de_la_trayectoria_Estacion_2.distance,
            finalHeight: reportData.Fin_de_la_trayectoria_Estacion_2.height,
            time: reportData.Tiempo_trayectoria_en_estacion_2
        },
    ];

    const startPoint = {
        lat: reportData.Inicio_de_la_trayectoria_Estacion_1.latitude,  // Nueva York
        lng: reportData.Inicio_de_la_trayectoria_Estacion_1.longitude,
        elevation: reportData.Inicio_de_la_trayectoria_Estacion_1.height   // metros sobre el nivel del mar
    };

    const endPoint = {
        lat: reportData.Fin_de_la_trayectoria_Estacion_1.latitude,  // 1 km al norte
        lng: reportData.Fin_de_la_trayectoria_Estacion_1.longitude,
        elevation: reportData.Fin_de_la_trayectoria_Estacion_1.height  // 100 metros más alto
    };



    return (
        <Container>
            <Row className="mb-4">
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: data[0].id })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ' ' + reportData.Inicio_de_la_trayectoria_Estacion_1.longitude} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_1.latitude + ' ' + reportData.Fin_de_la_trayectoria_Estacion_1.longitude} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_1.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.height} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_1.height} readOnly />
                    </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: data[1].id })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ' ' + reportData.Inicio_de_la_trayectoria_Estacion_2.longitude} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_2.latitude + ' ' + reportData.Fin_de_la_trayectoria_Estacion_2.longitude} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_2.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_2.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_2.height} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_2.height} readOnly />
                    </Form.Group>
                </Col>
            </Row>
            <hr></hr>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Distancia viajada (Estacion 1)</Form.Label>
                        <Form.Control type="text" value={data[0].initialDistance - data[0].finalDistance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Tiempo viajada (Estacion 1)</Form.Label>
                        <Form.Control type="text" value={data[0].time} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Velocidad media</Form.Label>
                        <Form.Control type="text" value={reportData.Velocidad_media} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Velocidad inicial (velocidad 2)</Form.Label>
                        <Form.Control type="text" value={reportData.Velocidad_Inicial_Estacion_2} readOnly />
                    </Form.Group>

                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Distancia viajada (Estacion 2)</Form.Label>
                        <Form.Control type="text" value={data[1].initialDistance - data[1].finalDistance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Tiempo viajada (Estacion 2)</Form.Label>
                        <Form.Control type="text" value={data[1].time} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Aceleracion en Km/Sec²</Form.Label>
                        <Form.Control type="text" value={reportData.Aceleración_en_Kms} readOnly />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div>
                        {/* <Pending data={data} /> */}

                        <div style={{ width: 'auto', height: 'auto' }}>
                            <SlopeMap startPoint={startPoint} endPoint={endPoint} observatory={observatory} />
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PendingReport;