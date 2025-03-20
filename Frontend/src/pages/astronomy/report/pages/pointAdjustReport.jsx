import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Table } from "react-bootstrap";
import "chart.js/auto";
import LineChart from '@/components/chart/LineChart';
// Internationalization
import { useTranslation } from 'react-i18next';


const PointAdjustReport = ({zwoAdjustmentPoints}) => {
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
                <h2>{t('REPORT.POINT_ADJUST.TITLE')}</h2>
                <Row>
                    <h4>{t('REPORT.POINT_ADJUST.GRAPHIC')}</h4>
                    <LineChart data={zwoAdjustmentPoints} xVariable={'X'} yVariable={'Y'} />
                </Row>
                <Row>

                    <h4>{t('REPORT.POINT_ADJUST.TABLE.TITLE')}</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.DATE')}</th>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.HOUR')}</th>
                                <th>X</th>
                                <th>Y</th>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.Ar_Grados')}</th>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.De_Grados')}</th>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.Ar_Sexagesimal')}</th>
                                <th>{t('REPORT.POINT_ADJUST.TABLE.HEADER.De_Sexagesimal')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zwoAdjustmentPoints.map((p) => (
                                <tr key={p.dateObs}>
                                    <td>
                                        <Form.Control
                                            type="string"
                                            value={new Date(p.Fecha).toLocaleDateString()}
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
                                            value={p.X}
                                            onChange={(e) => ajustarPunto(p.id, "x", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            value={p.Y}
                                            onChange={(e) => ajustarPunto(p.id, "y", e.target.value)}
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
                                    <td>
                                        <Form.Control
                                            type="text"
                                            value={p.Ar_Sexagesimal}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            value={p.De_Sexagesimal}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Row>
              
            </Container>
            {/* <ScatterPlot data={zwoAdjustmentPoints} xVariable={'x'} yVariable={'y'} />

            <ScatterPlot data={zwoAdjustmentPoints} xVariable={'arDegrees'} yVariable={'deDegrees'} /> */}
        </div>
    );
};

export default PointAdjustReport;