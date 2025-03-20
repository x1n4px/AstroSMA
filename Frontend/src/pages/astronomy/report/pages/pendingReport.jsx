import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Pending from '@/components/chart/Pending.jsx';
import { useTranslation } from 'react-i18next';

const PendingReport = ({ reportData }) => {
    const { t } = useTranslation(['text']);

    if (!reportData) {
        return <p>{t('REPORT.PENDING.NO_DATA')}</p>; // Manejo de datos faltantes
    }

    const parseCoordinates = (coordinates) => {
        const parts = coordinates.split(' ');
        return {
            coordinates: `${parts[0]} ${parts[1]}`,
            distance: parseFloat(parts[2]),
            height: parseFloat(parts[3]),
        };
    };

    const station1Start = parseCoordinates(reportData.Inicio_de_la_trayectoria_Estacion_1);
    const station1End = parseCoordinates(reportData.Fin_de_la_trayectoria_Estacion_1);
    const station2Start = parseCoordinates(reportData.Inicio_de_la_trayectoria_Estacion_2);
    const station2End = parseCoordinates(reportData.Fin_de_la_trayectoria_Estacion_2);

    const data = [
        {
            id: reportData.Observatorio_Número,
            name: t('REPORT.PENDING.STATION_1'),
            start: station1Start.coordinates,
            initialDistance: station1Start.distance,
            initialHeight: station1Start.height,
            end: station1End.coordinates,
            finalDistance: station1End.distance,
            finalHeight: station1End.height,
            time: reportData.Tiempo_Estacion_1
        },
        {
            id: reportData.Observatorio_Número2,
            name: t('REPORT.PENDING.STATION_2'),
            start: station2Start.coordinates,
            initialDistance: station2Start.distance,
            initialHeight: station2Start.height,
            end: station2End.coordinates,
            finalDistance: station2End.distance,
            finalHeight: station2End.height,
            time: reportData.Tiempo_trayectoria_en_estacion_2
        },
    ];

    return (
        <Container>
            <Row className="mb-4">
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: data[0].id })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={station1Start.coordinates} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={station1Start.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={station1Start.height} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={station1End.coordinates} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={station1End.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={station1End.height} readOnly />
                    </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: data[1].id })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={station2Start.coordinates} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={station2Start.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={station2Start.height} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <Form.Control type="text" value={station2End.coordinates} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <Form.Control type="text" value={station2End.distance} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <Form.Control type="text" value={station2End.height} readOnly />
                    </Form.Group>
                </Col>
            </Row>
            <hr></hr>
            <Row>
                <Col>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Distancia viajada (Estacion 1)</Form.Label>
                                <Form.Control type="text" value={data[0].initialDistance - data[0].finalDistance} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Tiempo viajada (Estacion 1)</Form.Label>
                                <Form.Control type="text" value={data[0].time} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Distancia viajada (Estacion 2)</Form.Label>
                                <Form.Control type="text" value={data[1].initialDistance - data[1].finalDistance} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Tiempo viajada (Estacion 2)</Form.Label>
                                <Form.Control type="text" value={data[1].time} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Velocidad media</Form.Label>
                                <Form.Control type="text" value={reportData.Velocidad_media} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Velocidad inicial (velocidad 2)</Form.Label>
                                <Form.Control type="text" value={reportData.Velocidad_Inicial_Estacion_2} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Aceleracion en Km/Sec²</Form.Label>
                                <Form.Control type="text" value={reportData.Aceleración_en_Kms} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
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