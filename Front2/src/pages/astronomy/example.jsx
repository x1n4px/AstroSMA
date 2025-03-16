import React, { useState } from 'react';
import { Tabs, Tab, Container, Row, Col, Table, Form } from 'react-bootstrap';

import ReportMapChart from '../../components/map/ReportMap';
import PendienteChart from '../../components/chart/Pending';

const data = {
    IdInforme: 1,
    Observatorio_Número2: 123,
    Observatorio_Número: 456,
    Fecha: "2023-10-15",
    Hora: "14:30:00",
    Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1: 0.01,
    Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2: 0.02,
    Fotogramas_usados: 100,
    Ajuste_estación_2_Inicio: "2023-10-15 14:00:00",
    Ajuste_estación_2_Final: "2023-10-15 14:30:00",
    Ángulo_diedro_entre_planos_trayectoria: 45.5,
    Peso_estático: 10.2,
    Errores_AR_DE_radiantes: 0.03,
    Coordenadas_astronómicas_del_radiantes_Eclíptica_de_la_fecha: "120° 30'",
    Coordenadas_astronómicas_del_radiantes_J2000: "121° 15'",
    Azimut: 90.5,
    Dist_Cenital: 45.0,
    Inicio_de_la_trayectoria_Estacion_1: "2023-10-15 14:00:00",
    Fin_de_la_trayectoria_Estacion_1: "2023-10-15 14:30:00",
    Inicio_de_la_trayectoria_Estacion_2: "2023-10-15 14:00:00",
    Fin_de_la_trayectoria_Estacion_2: "2023-10-15 14:30:00",
    Impacto_previsible: "2023-10-15 14:35:00",
    Distancia_recibida_Estacion_1: 100.5,
    Error_altura_Estacion_1: 0.1,
    Error_distancia_Estacion_1: 0.2,
    Distancia_recibida_Estacion_2: 105.0,
    Error_altura_Estacion_2: 0.15,
    Error_distancia_Estacion_2: 0.25,
    Tiempo_trayectoria_en_estacion_2: "00:30:00",
    Ecuación_del_movimiento_en_Kms: "y = 2x + 1",
    Ecuación_velocidad_en_gs: "v = 3t + 2",
    Error_Velocidad: 0.05,
    Velocidad_Inicial_Estacion_2: 10.5,
    Aceleración_en_Kms: 2.0,
    Aceleración_en_gs: 1.5,
    Ruta_del_informe: "/informes/1",
    Ecuacion_parametrica_IdEc: 789,
    lat: 38.086827,
    lon: -5.994165,
};

const data2 = [
    {
        id: 1,
        lat: 40.4168,
        lon: -3.7038,
        title: 'Estación 1',
        date: '2023-10-27',
        video: '',
        height: 83
    },
    {
        id: 2,
        lat: 41.3851,
        lon: 2.1734,
        title: 'Estación 2',
        date: '2023-10-27',
        video: '',
        height: 30
    },
];


const Report = () => {
    const [activeTab, setActiveTab] = useState('summary');

    const dataPairs = [];
    const entries = Object.entries(data);

    for (let i = 0; i < entries.length; i += 2) {
        dataPairs.push(entries.slice(i, i + 2));
    }


    return (
        <div className="p-4">
            <h1> Informe bólido 20240224 </h1>
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="summary" title="Resumen">
                    En la noche del 31 de enero, a las 20:19, un impresionante bólido iluminó los cielos del Mediterráneo, siendo detectado por múltiples estaciones de la Red UMA/SMA. La trayectoria del meteoroide comenzó sobre el mar, al noreste de Mallorca, a una altitud de 75 km. Desde allí, el objeto celeste se desplazó 36 km en dirección sureste, alcanzando una velocidad de 67,320 km/h antes de desintegrarse en la atmósfera a una altura de 50 km.

                    El análisis de la órbita del meteoroide revela datos interesantes sobre su origen. Con una inclinación de 24º.18, un semieje mayor de 1.78 U.A. y una excentricidad de 0.44, se puede inferir que este bólido probablemente provenía de una región del sistema solar con características orbitales particulares. Estos parámetros sugieren una órbita elíptica moderadamente excéntrica, típica de cuerpos que han interactuado gravitacionalmente con los planetas, lo que podría haber alterado su trayectoria original.

                    La detección y análisis de este bólido proporcionan información valiosa sobre la dinámica de los cuerpos menores en nuestro sistema solar y ayudan a comprender mejor los procesos que ocurren en la atmósfera terrestre durante la entrada de estos objetos.
                </Tab>
                <Tab eventKey="data" title="Datos Inferidos">
                    <Col>
                        {dataPairs.map((pair, rowIndex) => (
                            <Row key={rowIndex} className="mb-3 align-items-center">
                                {pair.map(([key, value], index) => (
                                    <Col key={key} xs={12} md={6}>
                                        <Row className="align-items-center">
                                            <Col xs={12} md={6}>
                                                <Form.Label>{key}</Form.Label>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Group className="d-flex align-items-center">
                                                    <Form.Control type="text" value={`${value} Km/s`} readOnly className="flex-grow-1" />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                ))}
                                {pair.length === 1 && <Col xs={12} md={6}></Col>} {/* Columna vacía si hay un solo elemento */}
                            </Row>
                        ))}
                    </Col>
                </Tab>
                <Tab eventKey="map" title="Mapa">
                    <ReportMapChart lat={data.lat} lon={data.lon} zoom={7} />
                    <PendienteChart data={data2} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Report;