import React from 'react';
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Table } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapChart from '../../components/map/MapChart';

function Report() {


    const params = useParams();
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válido

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

    return (
        <Container>
            <Row className="mb-4 mt-4">
                {/* Mapa */}
                <MapChart lat={data.lat} lon={data.lon} zoom={7} />
            </Row>
            <Row>
                <Link to={`/report/${id}/bolide/1`} className="btn btn-primary mb-4">Ver bólido</Link>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Campo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(data).map(([key, value]) => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default Report;