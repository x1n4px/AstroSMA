import React, { useState, useCallback, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import { getGeneral } from '@/services/dashboardService.jsx';
import { formatDate } from '@/pipe/formatDate';
import Station from './astronomy/Station';
import Footer from '../components/layout/Footer';
import NextRain from '@/components/nextRain.jsx';

const teamMembers = [
    { name: 'Alberto Castellón', role: 'Presidente', image: 'https://francis.naukas.com/files/2022/06/D20220608-small-photo-alberto-castellon-serrano-info-uma.jpg' },
    { name: 'Jose Manuel Nuñez', role: 'Vicepresidente y responsable de material astronómico', image: 'https://media.facua.org/wp-content/uploads/2023/12/12062510/18322extremadura.jpg' },
    { name: 'Mª Rosa López', role: 'Secretaria', image: 'https://www.astromalaga.es/wp-content/uploads/2023/05/rosa.jpeg' },
    { name: 'Carlos G. Spinola', role: 'Tesorero', image: 'https://www.astromalaga.es/wp-content/uploads/2018/05/Carlos.jpg' },
];



const Home = () => {

    const { t } = useTranslation(['text']);


    const [predictableImpact, setPredictableImpact] = useState([]);
    const [observatoryData, setObservatoryData] = useState([]);
    const [lastReport, setLastReport] = useState([]);
    const [lastReportMap, setLastReportMap] = useState([]);
    const [searchRange, setsearchRange] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);





    const fetchData = async () => {
        try {
            const responseD = await getGeneral(searchRange);
            setLastReportMap(responseD.lastReportMap);

            console.log(responseD.lastReport)
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [ipAddress, setIpAddress] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        // Using a free (but potentially unreliable and privacy-invasive) service for demonstration
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                setIpAddress(data.ip);
                // Once you have the IP, you can use another service to get the location
                fetch(`https://ipapi.co/${data.ip}/json/`)
                    .then(res => res.json())
                    .then(locationData => {
                        console.log(locationData);
                        setLocation(locationData);
                    })
                    .catch(err => {
                        setError('Error fetching location data.');
                        console.error('Error fetching location:', err);
                    });
            })
            .catch(err => {
                setError('Error fetching IP address.');
                console.error('Error fetching IP:', err);
            });
    }, []);


    function tiempoDesde(fecha) {
        const ahora = new Date();
        const fechaDada = new Date(fecha);
        const diferenciaMs = ahora - fechaDada;
        const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
        const dias = Math.floor(horas / 24);

        if (horas < 1) return 'hace menos de una hora';
        if (horas < 24) return `hace ${horas} hora${horas === 1 ? '' : 's'}`;
        return `hace ${dias} día${dias === 1 ? '' : 's'}`;
    }



    return (
        <>
            <div style={{ backgroundColor: '#f8f9fa', height: 'auto' }}>
                <nav style={{ backgroundColor: '#f8f9fa' }} className="navbar navbar-expand-lg">
                    <div className="container-fluid">
                        <div className="d-flex justify-content-center w-100">
                            <a className="navbar-brand mx-auto" href="#">
                                <img src="/Logo-50-SMA.webp" alt="Logo" width="100" />
                            </a>
                        </div>
                        <div className="d-flex">
                            <button
                                className="btn btn-sm"
                                type="button"
                                style={{
                                    backgroundColor: '#980100',
                                    border: '#980100',
                                    color: '#f8f9fa',
                                    padding: '0.5rem 1rem',  // Ajusta el tamaño del botón
                                    fontSize: '0.875rem',     // Tamaño de fuente más pequeño
                                    height: 'auto',           // Ajusta la altura automáticamente
                                }}
                            >
                                Iniciar sesión
                            </button>

                        </div>
                    </div>
                </nav>
                <div className="container mt-4">
                    <h1>Bienvenido a la Sociedad Malagueña de astronomía</h1>
                    <p>Último bólido registrado {tiempoDesde(lastReportMap.Fecha)}</p>
                    <div className="d-flex">
                        <div
                            className="flex-grow-1 position-relative"
                            style={{
                                backgroundColor: '#e9ecef',
                                borderRadius: '10px',
                                width: '70%',
                                height: '100%', // Asegura que tenga altura completa
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100 m-0 p-0"
                                style={{ pointerEvents: 'none', zIndex: 1 }}
                            >
                                <Card.Subtitle className="text-muted" style={{ color: 'black' }}>
                                    {t('DASHBOARD.GRAPH.EIGHTH.DESCRIPTION')}
                                </Card.Subtitle>
                            </div>

                            <div style={{ flex: 1, height: '100%', width: '100%' }}>
                                <MultiMarkerMapChart
                                    data={lastReportMap.map(item => item.MAP_DATA)}
                                    key={`key-a9`}
                                    observatory={observatoryData}
                                />
                            </div>
                        </div>

                        <div
                            className="p-3 ms-3 d-flex flex-column justify-content-between"
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '10px',
                                width: '30%',
                                border: '1px solid #ddd',
                                padding: '1rem',
                            }}
                        >
                            <div>
                                <h6 className="text-muted mb-2" style={{ color: '#777', fontWeight: 'bold' }}>
                                    {t('text:report_details')}
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:date')}:</strong> {lastReport[0]?.Fecha ? formatDate(lastReport[0].Fecha) : '-'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:hour')}:</strong> {lastReport[0]?.Hora ? lastReport[0].Hora.substring(0, 8) : '-'}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <h6 className="text-muted mb-2" style={{ color: '#777', fontWeight: 'bold' }}>
                                    {t('text:station')} 1
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:start')}:</strong> Lat: {observatoryData?.length > 0 ? observatoryData[0].latitude : '-'}, Lon: {observatoryData?.length > 0 ? observatoryData[0].longitude : '-'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:end')}:</strong> Lat: {predictableImpact[0]?.latitude ? predictableImpact[0].latitude.toFixed(2) : '-'}, Lon: {predictableImpact[0]?.longitude ? predictableImpact[0].longitude.toFixed(2) : '-'}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <h6 className="text-muted mb-2" style={{ color: '#777', fontWeight: 'bold' }}>
                                    {t('text:station')} 2
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:start')}:</strong> Lat: {observatoryData?.length > 1 ? observatoryData[1].latitude : '-'}, Lon: {observatoryData?.length > 1 ? observatoryData[1].longitude : '-'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:end')}:</strong> Lat: {predictableImpact[1]?.latitude ? predictableImpact[1].latitude.toFixed(2) : '-'}, Lon: {predictableImpact[1]?.longitude ? predictableImpact[1].longitude.toFixed(2) : '-'}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <p className="mb-2" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('text:average_velocity')}:</strong> {lastReport[0]?.Vel__Geo ? lastReport[0].Vel__Geo.split(' ')[0] : '-'} km/s
                                </p>
                            </div>
                            <div className="mt-3">
                                <button
                                    className="btn w-100 d-flex flex-column align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: '#980100',
                                        border: 'none',
                                        borderRadius: '30px',
                                        color: '#f8f9fa',
                                        padding: '0.25rem 1rem',
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Saber más</span>
                                    <small style={{ fontSize: '0.8rem', opacity: 0.85 }}>Iniciar sesión</small>
                                </button>

                            </div>
                        </div>
                    </div>
                    <div className="d-flex">
                        <div
                            className="p-4 mt-4 d-flex justify-content-between align-items-center mb-4"
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '10px',
                                width: '100%',
                                height: '80px',
                                border: '1px solid #ddd',
                            }}
                        >
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>Meteoros detectados</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>2022</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>Informes de fotometría</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>17</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>Informes radiantes</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>1495</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>Informes de dos estaciones</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>2048</small>
                            </div>
                        </div>

                    </div>
                </div>

                <NextRain />


                <div className="container mt-4">
                    <div className="d-flex" style={{ backgroundColor: '#f8f9fa', height: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 my-4">
                            {[
                                {
                                    titulo: 'Distancia Tierra - Luna',
                                    subtitulo: '384.400 km de media',
                                    icono: '🌕',
                                },
                                {
                                    titulo: 'Velocidad de la luz',
                                    subtitulo: '299.792 km/s',
                                    icono: '⚡',
                                },
                                {
                                    titulo: 'Edad del Universo',
                                    subtitulo: '13.800 millones de años',
                                    icono: '🌌',
                                },
                                {
                                    titulo: 'Duración de 1 día en Marte',
                                    subtitulo: '24h 39min',
                                    icono: '🔴',
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="d-flex flex-column justify-content-center align-items-start p-3"
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '10px',
                                        height: '150px',
                                        width: '23%',
                                        minWidth: '200px',
                                        border: '1px solid #dee2e6',
                                        boxShadow: '0 0 6px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem' }}>{item.icono}</div>
                                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.titulo}</span>
                                    <small style={{ fontSize: '0.9rem', color: '#6c757d' }}>{item.subtitulo}</small>
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className="d-flex">
                        <Container className="mt-4">
                            <h2 className="mb-4">Equipo de Trabajo</h2>
                            <div className="d-flex gap-3 overflow-auto pb-2">
                                {teamMembers.map((member, index) => (
                                    <Card key={index} style={{ width: '250px', flex: '0 0 auto' }}>
                                        <Card.Img variant="top" style={{ width: '100%', height: '200px', 'object-fit': 'cover' }} src={member.image} alt={member.name} />
                                        <Card.Body>
                                            <Card.Title>{member.name}</Card.Title>
                                            <Card.Text>{member.role}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Container>
                    </div>
                </div>
                <Footer />
            </div >
        </>
    );
};

export default Home;