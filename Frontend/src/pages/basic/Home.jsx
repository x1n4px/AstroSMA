import React, { useState, useCallback, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';
import { getGeneralHome } from '@/services/dashboardService.jsx';
import { formatDate } from '@/pipe/formatDate';
import Station from '../astronomy/Station';
import Footer from '../../components/layout/Footer';
import NextRain from '@/components/nextRain.jsx';
import truncateDecimal from '@/pipe/truncateDecimal';
import { audit } from '@/services/auditService'
import SolarSystem from '../../components/three/SolarSystem';
import { Link } from 'react-router-dom';
import BarChart from '@/components/chart/BarChart';
import StationMapChart from '@/components/map/StationMapChart';
import DasboardMap from '@/components/dashboard/DashboardMap.jsx';
import MapSkeleton from '@/components/skeleton/MapSkeleton';
import {getIpAndLocation} from '@/services/networkService.jsx'

const teamMembers = [
    { name: 'Alberto Castellón', role: 'Presidente', image: 'https://francis.naukas.com/files/2022/06/D20220608-small-photo-alberto-castellon-serrano-info-uma.jpg' },
    { name: 'Jose Manuel Nuñez', role: 'Vicepresidente y responsable de material astronómico', image: 'https://media.facua.org/wp-content/uploads/2023/12/12062510/18322extremadura.jpg' },
    { name: 'Mª Rosa López', role: 'Secretaria', image: 'https://www.astromalaga.es/wp-content/uploads/2023/05/rosa.jpeg' },
    { name: 'Carlos G. Spinola', role: 'Tesorero', image: 'https://www.astromalaga.es/wp-content/uploads/2018/05/Carlos.jpg' },
];

import Navbar from '../../components/layout/Navbar';


const Home = () => {

    const { t } = useTranslation(['text']);

    const [firstMapLoaded, setFirstMapLoaded] = useState(false);
    const [predictableImpact, setPredictableImpact] = useState([]);
    const [observatoryData, setObservatoryData] = useState([]);
    const [lastReport, setLastReport] = useState([]);
    const [lastReportMap, setLastReportMap] = useState([]);
    const [searchRange, setsearchRange] = useState(1);
    const [counterReport, setCounterReport] = useState([]);
    const [meteorLastYear, setMeteorLastYear] = useState([]);
    const [observatory, setObservatory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        // Cargar el segundo mapa después de que el primero esté listo
        const timer = setTimeout(() => {
            setFirstMapLoaded(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = async () => {
        try {
            const responseD = await getGeneralHome(searchRange);
            setLastReport(responseD.processedReports);
            setLastReportMap(responseD.lastReportMap);
            setCounterReport(responseD.counterReport);
            setMeteorLastYear(responseD.meteorLastYear);
            setObservatory(responseD.stations);
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

    const handleAudit = async (isMobile) => {
        try {
            const data = {
                isGuest: true,
                isMobile: isMobile,
                event_type: 'HOME',
                event_target: 'Nuevo acceso a la web: /home'
            };
            await audit(data);
        } catch (error) {
            console.error('Error during download or audit:', error);
        }

    }

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

        // Tu código de IP + ubicación
        getIpAndLocation().then(result => {
            if (result.success) {
                handleAudit(isMobile);
                setIpAddress(result.ip);
                setLocation(result.location);
            } else {
                setError(result.error);
            }
        });
    }, []);




    function tiempoDesde(fecha) {
        const ahora = new Date();
        const fechaDada = new Date(fecha);
        const diferenciaMs = ahora - fechaDada;
        const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
        const dias = Math.floor(horas / 24);

        if (horas < 1) return `${t('HOME.LAST_BOLIDE_TIME.LESS_HOUR')}`;
        if (horas < 24) return `${t('HOME.LAST_BOLIDE_TIME.AGO')} ${horas} ${t('HOME.LAST_BOLIDE_TIME.HOURS')}${horas === 1 ? '' : 's'}`;
        return `hace ${dias} día${dias === 1 ? '' : 's'}`;
    }



    return (
        <>
            <div style={{ backgroundColor: '#980100', height: 'auto' }}>
                {token ? (<Navbar />) : (<nav style={{ backgroundColor: '#980100' }} className="navbar navbar-expand-lg">
                    <div className="container-fluid">
                        <div className="d-flex justify-content-center w-100">
                            <a className="navbar-brand mx-auto" href="#">
                                <img src="/Logo-50-SMA.webp" alt="Logo" width="100" />
                            </a>
                        </div>
                        <div className="d-flex">
                            <Link to="/login"
                                className="btn btn-sm"
                                type="button"
                                style={{
                                    backgroundColor: '#980100',
                                    border: '#980100',
                                    color: '#f8f9fa',
                                    padding: '0.5rem 1rem',  // Ajusta el tamaño del botón
                                    fontSize: '0.875rem',     // Tamaño de fuente más pequeño
                                    height: 'auto',           // Ajusta la altura automáticamente,
                                    width: 'auto',            // Ajusta el ancho automáticamente
                                }}
                            >
                                {t('HOME.LOGIN')}
                            </Link>

                        </div>
                    </div>
                </nav>)}

                <div className="container mt-4" style={{ backgroundColor: '#980100' }}>
                    <h1 style={{ color: '#f8f9fa' }}>{t('HOME.TITLE')}</h1>
                    <p style={{ color: '#f8f9fe' }}>{t('HOME.LAST_BOLIDE')} {tiempoDesde(lastReport[0]?.Fecha)}</p>
                    {/* <div className="d-flex">
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
                                {t('HOME.LAST_BOLIDE_DATA.DETAILS')}
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.DATE')}:</strong> {lastReport[0]?.Fecha ? formatDate(lastReport[0].Fecha) : '-'}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.HOUR')}:</strong> {lastReport[0]?.Hora ? lastReport[0].Hora.substring(0, 8) : '-'}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <h6 className="text-muted mb-2" style={{ color: '#777', fontWeight: 'bold' }}>
                                {t('HOME.LAST_BOLIDE_DATA.STATION')} 1
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.START_COORDINATES')}:</strong> Lat: {lastReport[0]?.Inicio_de_la_trayectoria_Estacion_1.latitude}, Lon: {lastReport[0]?.Inicio_de_la_trayectoria_Estacion_1.longitude}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.END_COORDINATES')}:</strong> Lat: {lastReport[0]?.Fin_de_la_trayectoria_Estacion_1.latitude}, Lon: {lastReport[0]?.Fin_de_la_trayectoria_Estacion_1.longitude}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <h6 className="text-muted mb-2" style={{ color: '#777', fontWeight: 'bold' }}>
                                {t('HOME.LAST_BOLIDE_DATA.STATION')} 2
                                </h6>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.START_COORDINATES')}:</strong> Lat: {lastReport[0]?.Inicio_de_la_trayectoria_Estacion_2.latitude}, Lon: {lastReport[0]?.Inicio_de_la_trayectoria_Estacion_2.longitude}
                                </p>
                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.END_COORDINATES')}:</strong> Lat: {lastReport[0]?.Fin_de_la_trayectoria_Estacion_2.latitude}, Lon: {lastReport[0]?.Fin_de_la_trayectoria_Estacion_2.longitude}
                                </p>
                                <hr className="my-2" style={{ borderColor: '#eee' }} />
                                <p className="mb-2" style={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>{t('HOME.LAST_BOLIDE_DATA.VELOCITY')}:</strong> {truncateDecimal(lastReport[0]?.Velocidad_media)} km/s
                                </p>
                            </div>
                            <div className="mt-3">
                                <Link to="/login"
                                    className="btn w-100 d-flex flex-column align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: '#980100',
                                        border: 'none',
                                        borderRadius: '30px',
                                        color: '#f8f9fa',
                                        padding: '0.25rem 1rem',
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{t('HOME.KNOW_MORE')}</span>
                                    <small style={{ fontSize: '0.8rem', opacity: 0.85 }}>{t('HOME.LOGIN')}</small>
                                </Link>

                            </div>
                        </div>
                    </div> */}
                    <div >
                        {loading ? (
                            <MapSkeleton height="400px" />
                        ) : (

                            <DasboardMap observatoryData={observatory} lastReportMap={lastReportMap} lastReportData={lastReport} />
                        )}


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
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>{t('HOME.SMART_INFO.DETECTED_BOLIDES')}</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>{counterReport[3]?.Total}</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>{t('HOME.SMART_INFO.PHOTOMETRY_REPORTS')}</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>{counterReport[2]?.Total}</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>{t('HOME.SMART_INFO.RADIAN_REPORTS')}</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>{counterReport[1]?.Total}</small>
                            </div>
                            <div
                                className="d-flex flex-column justify-content-center align-items-start"
                                style={{ width: '25%' }}
                            >
                                <span style={{ fontWeight: '500', fontSize: '1rem', color: '#343a40' }}>{t('HOME.SMART_INFO.Z_REPORTS')}</span>
                                <small style={{ fontWeight: '600', fontSize: '1.25rem', color: '#212529' }}>{counterReport[0]?.Total}</small>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <NextRain />

            <div style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
                <Container>
                    {/* Sección del gráfico de barras */}
                    <Row className="justify-content-center mb-5">
                        <Col md={10}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="text-center mb-4" style={{ fontSize: '1.8rem', color: '#212529' }}>
                                        {t('HOME.LAST_YEAR_ACTIVITY.TITLE')}
                                    </Card.Title>
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <BarChart data={meteorLastYear} key={`key-a2214`} />
                                    </div>
                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            {t('HOME.LAST_YEAR_ACTIVITY.DATA_INFO')}
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div style={{ backgroundColor: '#e9ecef', padding: '60px 0' }}> {/* Light gray background for better contrast */}
                <Container>
                    <Row className="justify-content-center mb-4">
                        <Col md={8} className="text-center">
                            <h2>{t('HOME.STATION.TITLE') || 'Mapa de Estaciones Asociadas SMA'}</h2> {/* More descriptive title */}
                            <p className="lead">{t('HOME.STATION.DESCRIPTION')}</p> {/* Informative subtitle */}
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={12}> {/* Make the map take full width within the container */}
                            {firstMapLoaded && (
                                <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}> {/* Added visual enhancements */}
                                    <StationMapChart
                                        ref={(ref) => {
                                            mapRef.current = ref;
                                            if (ref && ref.leafletElement) {
                                                mapInstance.current = ref.leafletElement;
                                            }
                                        }}
                                        key={'sma_stations_map'}
                                        data={observatory}
                                        activePopUp={true}
                                        latitude={40.415417}
                                        longitude={-3.695642}
                                        zoom={6}
                                        useStatinIcon={true}
                                    />
                                </div>
                            )}
                            {!firstMapLoaded && observatory && observatory.length === 0 && (
                                <p className="text-center mt-3">{t('HOME.STATION.NO_STATIONS_AVAILABLE')}</p>
                            )}
                            {!firstMapLoaded && !observatory && (
                                <p className="text-center mt-3">{t('HOME.STATION.LOADING_STATIONS')}</p>
                            )}
                        </Col>
                    </Row>
                    <Row className="justify-content-center mt-4">
                        <Col md="auto" className="text-center">
                            <p className="text-muted small">{t('HOME.STATION.MAP_INTERACTIVE_INFO')}</p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div style={{ backgroundColor: '#980100', padding: '0px 0' }}>
                <Container className="py-5" >
                    {/* Sección de datos astronómicos */}
                    <Row className="justify-content-center mb-5">
                        <Col lg={10}>
                            <div className="text-center mb-5">
                                <h2 className="display-5 mb-3" style={{
                                    color: '#fff',
                                    fontWeight: '300',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    CONSTANTES ASTRONÓMICAS
                                </h2>
                                <p className="text-light" style={{ opacity: 0.8 }}>Valores certificados por la IAU (2020)</p>
                            </div>

                            <Row className="g-4">
                                {[
                                    {
                                        titulo: t('HOME.ASTRONOMIC_CTO.UA.TITLE'),
                                        subtitulo: '1.495978707×10¹¹ m ± 0.000000003×10¹¹ m',
                                        descripcion: t('HOME.ASTRONOMIC_CTO.UA.DESCRIPTION'),
                                        icono: 'fas fa-sun',
                                        referencia: 'IAU 2012 Resolution B2'
                                    },
                                    {
                                        titulo: t('HOME.ASTRONOMIC_CTO.LIGHT_SPEED.TITLE'),
                                        subtitulo: '299792458 m/s (exacto)',
                                        descripcion: t('HOME.ASTRONOMIC_CTO.LIGHT_SPEED.DESCRIPTION'),
                                        icono: 'fas fa-lightbulb',
                                        referencia: 'CODATA 2018'
                                    },
                                    {
                                        titulo: t('HOME.ASTRONOMIC_CTO.HUBBLE.TITLE'),
                                        subtitulo: '67.66 ± 0.42 km/s/Mpc',
                                        descripcion: t('HOME.ASTRONOMIC_CTO.HUBBLE.DESCRIPTION'),
                                        icono: 'fas fa-expand',
                                        referencia: 'Planck 2018'
                                    },
                                    {
                                        titulo: t('HOME.ASTRONOMIC_CTO.PARSEC.TITLE'),
                                        subtitulo: '3.085677581×10¹⁶ m',
                                        descripcion: t('HOME.ASTRONOMIC_CTO.PARSEC.DESCRIPTION'),
                                        icono: 'fas fa-ruler-combined',
                                        referencia: 'IAU 2015 Resolution B2'
                                    }
                                ].map((item, index) => (
                                    <Col key={index} md={3} sm={6}>
                                        <Card className="h-100 border-0" style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(5px)'
                                        }}>
                                            <Card.Body className="p-3">
                                                <div className="text-center mb-3">
                                                    <i className={`${item.icono} fa-2x`} style={{ color: '#fff' }}></i>
                                                </div>
                                                <Card.Title
                                                    className="text-center mb-2"
                                                    style={{
                                                        fontSize: '1rem',
                                                        color: '#fff',
                                                        fontWeight: '400'
                                                    }}
                                                >
                                                    {item.titulo}
                                                </Card.Title>
                                                <Card.Text
                                                    className="text-center mb-1"
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        fontFamily: "'Courier New', monospace",
                                                        color: '#a3e9eb',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {item.subtitulo}
                                                </Card.Text>
                                                <Card.Text
                                                    className="text-center mb-2"
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: 'rgba(255, 255, 255, 0.7)'
                                                    }}
                                                >
                                                    {item.descripcion}
                                                </Card.Text>
                                                <Card.Text
                                                    className="text-center"
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        color: 'rgba(255, 255, 255, 0.5)',
                                                        fontStyle: 'italic'
                                                    }}
                                                >
                                                    {item.referencia}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Nota técnica */}
                            <Row className="mt-4">
                                <Col className="text-center">
                                    <small style={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.75rem',
                                        display: 'block',
                                        maxWidth: '800px',
                                        margin: '0 auto',
                                        lineHeight: '1.5'
                                    }}>
                                        {t('HOME.ASTRONOMIC_CTO.NOTE')}
                                    </small>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '40px 0' }}>
                <Container>
                    <Row className="justify-content-center mb-4">
                        <Col md={8} className="text-center">
                            <h2 style={{ color: '#000', marginBottom: '20px' }}>{t('HOME.SOLAR_SYSTEM.TITLE')}</h2>
                            <p style={{ color: '#980100', fontSize: '1.1rem' }}>
                                {t('HOME.SOLAR_SYSTEM.DESCRIPTION')}
                            </p>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={10} style={{
                            height: '40vh',
                            borderRadius: '10px',
                            overflow: 'hidden',
                        }}>
                            <SolarSystem
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'transparent'
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="justify-content-center mt-3">
                        <Col md={8} className="text-center">
                            <Button
                                variant="outline-light"
                                size="lg"
                                as={Link}
                                to="/login"
                                style={{
                                    borderWidth: '2px',
                                    borderRadius: '30px',
                                    padding: '8px 30px',
                                    fontWeight: '600',
                                    color: '#980100',
                                    borderColor: '#980100',
                                }}
                            >
                                {t('HOME.SOLAR_SYSTEM.MORE_BTN')}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
                <Container>

                    {/* Sección del equipo */}
                    <Row className="justify-content-center">
                        <Col md={10}>
                            <div className="text-center mb-4">
                                <h2 style={{ color: '#212529' }}>{t('HOME.TEAM.TITLE')}</h2>
                                <p className="text-muted mb-4">
                                    {t('HOME.TEAM.DESCRIPTION')}
                                </p>
                            </div>

                            <Row className="g-4 justify-content-center mb-4">
                                {teamMembers.map((member, index) => (
                                    <Col key={index} lg={3} md={6}>
                                        <Card className="h-100 border-0 shadow-sm overflow-hidden">
                                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                                <Card.Img
                                                    variant="top"
                                                    src={member.image}
                                                    alt={member.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transition: 'transform 0.3s ease'
                                                    }}
                                                    className="hover-zoom"
                                                />
                                            </div>
                                            <Card.Body className="text-center">
                                                <Card.Title>{member.name}</Card.Title>
                                                <Card.Text className="text-muted">
                                                    {member.role}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Container>


            </div >
            <Footer />
        </>
    );
};

export default Home;