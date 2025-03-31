import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Table, Accordion } from "react-bootstrap";
import "chart.js/auto";
import LineChart from '@/components/chart/LineChart';
// Internationalization
import { useTranslation } from 'react-i18next';
import formatDate from '@/pipe/formatDate.jsx'


const PointAdjustReport = ({ zwoAdjustmentPoints, regressionTrajectory, trajectoryData }) => {
    const { t } = useTranslation(['text']);
    // Datos simulados para la tabla de puntos
    const [puntos, setPuntos] = useState([
        { id: 1, x: 10, y: 20, z: 5 },
        { id: 2, x: 15, y: 25, z: 8 },
        { id: 3, x: 22, y: 30, z: 12 },
    ]);

    // Datos para el gráfico de trayectoria
    const data = {
        labels: puntos.map((p) => `P${p.id}`), // Etiquetas de los puntos
        datasets: [
            {
                label: "Trayectoria",
                data: puntos.map((p) => p.y), // Usamos coordenadas Y como referencia
                borderColor: "blue",
                fill: false,
                tension: 0.4, // Suavizado de curva
            },
        ],
    };

    // Manejar ajustes manuales (ejemplo simple)
    const ajustarPunto = (id, key, value) => {
        setPuntos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [key]: parseFloat(value) } : p))
        );
    };


    return (
        <div>
            <Container>
                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            ZWO
                        </Accordion.Header>
                        <Accordion.Body>


                            <h2>{t('REPORT.POINT_ADJUST.ZWO.TITLE')}</h2>
                            {/* <Row>
                                <h4>{t('REPORT.POINT_ADJUST.ZWO.GRAPHIC')}</h4>
                                <LineChart data={zwoAdjustmentPoints} xVariable={'X'} yVariable={'Y'} />
                            </Row> */}
                            <Row>

                                <h4>{t('REPORT.POINT_ADJUST.ZWO.TABLE.TITLE')}</h4>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.DATE')}</th>
                                            <th>{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.HOUR')}</th>
                                            <th>{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.Ar_Grados')}</th>
                                            <th>{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.De_Grados')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {zwoAdjustmentPoints.map((p) => (
                                            <tr key={p.dateObs}>
                                                <td>
                                                    <Form.Control
                                                        type="string"
                                                        value={formatDate(p.Fecha)}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="string"
                                                        value={new Date(`1970-01-01T${p.Hora}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    />
                                                </td>
                                               
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={p.Ar_Grados}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={p.De_Grados}
                                                    />
                                                </td>
                                                
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>
                        {t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TITLE')}
                        </Accordion.Header>
                        <Accordion.Body>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.DATE')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.HOUR')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.t')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.s')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.v')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regressionTrajectory.map((point, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(point.Fecha)}</td>
                                            <td>{point.Hora}</td>
                                            <td>{point.t}</td>
                                            <td>{point.s}</td>
                                            <td>{point.v_Kms}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Accordion.Body>
                    </Accordion.Item>


                    <Accordion.Item eventKey="2">
                        <Accordion.Header>
                        {t('REPORT.POINT_ADJUST.TRAJECTORY.TITLE')}
                        </Accordion.Header>
                        <Accordion.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DATE')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.HOUR')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.S')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.T')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.V')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.LAMBDA')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.PHI')}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', {id: '1'})}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', {id: '1'})}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', {id: '2'})}</th>
                                        <th>{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', {id: '2'})}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trajectoryData.map((p) => (
                                        <tr key={p.id}>
                                            <td>{formatDate(p.Fecha)}</td>
                                            <td>{p.Hora}</td>
                                            <td>{p.s}</td>
                                            <td>{p.t}</td>
                                            <td>{p.v}</td>
                                            <td>{p.lambda}</td>
                                            <td>{p.phi}</td>
                                            <td>{p.AR_Estacion_1}</td>
                                            <td>{p.De_Estacion_1}</td>
                                            <td>{p.Ar_Estacion_2}</td>
                                            <td>{p.De_Estacion_2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>


            </Container>
            {/* <ScatterPlot data={zwoAdjustmentPoints} xVariable={'x'} yVariable={'y'} />

            <ScatterPlot data={zwoAdjustmentPoints} xVariable={'arDegrees'} yVariable={'deDegrees'} /> */}
        </div>
    );
};

export default PointAdjustReport;