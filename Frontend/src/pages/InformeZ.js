import React, { useState, useEffect } from 'react';
import LinkMap from '../components/chart/LinkMap';
import { Container, Row, Col, Table } from 'react-bootstrap';
import PendienteChart from '../components/chart/Pending';
import axios from 'axios';
import { getStations } from '../services/stationService'


const InformeZ = () => {
    // Datos de ejemplo del informe Z
    const informeData = {
        idInforme: 123,
        observatorioNumero1: 1,
        observatorioNumero2: 2,
        fecha: '2023-10-27',
        hora: '10:15:00',
        errorCuadratico1: '0.001',
        errorCuadratico2: '0.002',
        fotogramasUsados: 100,
        ajusteEstacion2Inicio: '10:10:00',
        ajusteEstacion2Final: '10:20:00',
        anguloDiedro: 120.5,
        pesoEstadistico: 0.95,
        erroresARRadiante: '0.01',
        coordenadasRadianteEcliptica: '10, 20',
        coordenadasRadiante1200: '15, 25',
        azimut: 180,
        distanciaCenital: 30,
        inicioTrayectoriaEstacion1: '10:05:00',
        finTrayectoriaEstacion1: '10:10:00',
        inicioTrayectoriaEstacion2: '10:10:00',
        finTrayectoriaEstacion2: '10:20:00',
        impactoPrevisible: 'Sí',
        distanciaRecorridaEstacion1: 1000,
        errorDistanciaEstacion1: 10,
        errorAlturasEstacion1: 5,
        distanciaRecorridaEstacion2: 1200,
        errorDistanciaEstacion2: 12,
        errorAlturasEstacion2: 6,
        tiempoEstacion1: 300,
        velocidadMedia: 100,
        tiempoTrayectoriaEstacion2: 600

    };

    // Datos de ejemplo para el mapa
    const data = [
        {
            id: 1,
            lat: 40.6168,
            lon: -2.038,
            title: 'Estación 1',
            date: '2023-10-27',
            video: '',
            height: 83,
            station_id: 4
        },
        {
            id: 2,
            lat: 41.3851,
            lon: 2.1734,
            title: 'Estación 2',
            date: '2023-10-27',
            video: '',
            height: 30,
            station_id: 7
        },
    ];


     
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   


    useEffect(() => {
        const fetchStations = async () => {
            try {
                const allStations = await getStations();
                const validStationIds = data.map(item => item.station_id);
                // Filtrar solo las estaciones cuyo id esté en la lista de station_id
                const filteredStations = allStations.filter(station =>
                    validStationIds.includes(station.id)
                );
                setStations(filteredStations);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    return (
        <Container className="mt-4">
            <Row>
                <Col xs={12} md={6} className="mb-4 mb-md-0">
                    <LinkMap data={data} stations={stations} />
                    <PendienteChart data={data} />
                </Col>
                <Col xs={12} md={6}>
                    <Table striped bordered hover responsive>
                        <thead >
                            <tr className="bg-primary">
                                <th>Campo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(informeData).map(([key, value]) => (
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

export default InformeZ;