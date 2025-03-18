import React, { useState } from 'react';
import { Tabs, Tab, Alert, Container, Row, Col, Form } from 'react-bootstrap';
import { useParams, Link } from "react-router-dom";
import '@/assets/customTabs.css'


import SummaryReport from '@/pages/astronomy/report/pages/summaryReport';
import InferredDataReport from '@/pages/astronomy/report/pages/inferredDataReport';
import MapReport from '@/pages/astronomy/report/pages/mapReport';
import StationReport from '@/pages/astronomy/report/pages/stationReport';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx'
import GlobeWithComet from '@/components/three/BolideSlopeChart.jsx';
import Pending from '@/components/chart/Pending.jsx'
import AsocciatedStation from '@/pages/astronomy/report/pages/asocciatedStation.jsx'

// Internationalization
import { useTranslation } from 'react-i18next';

const pointA = {
    lat: 40.4168,
    lon: -3.7038,
    altitude: 120,
};

const pointB = {
    lat: 41.3851,
    lon: 2.1734,
    altitude: 45,
};

const data = {
    "Report_Id": 1,
    "Observatory_Number_2": 123,
    "Observatory_Number": 456,
    "Date": "2023-10-15",
    "Time": "14:30:00",
    "Quadratic_Error_Orthogonality_Celestial_Sphere_1": 0.01,
    "Quadratic_Error_Orthogonality_Celestial_Sphere_2": 0.02,
    "Frames_Used": 100,
    "Station_Adjustment_2_Start": "2023-10-15 14:00:00",
    "Station_Adjustment_2_End": "2023-10-15 14:30:00",
    "Dihedral_Angle_Between_Trajectory_Planes": 45.5,
    "Static_Weight": 10.2,
    "Errors_AR_DE_Radiants": 0.03,
    "Astronomical_Coordinates_Radiant_Ecliptic_Date": "120° 30'",
    "Astronomical_Coordinates_Radiant_J2000": "121° 15'",
    "Azimuth": 90.5,
    "Zenith_Distance": 45.0,
    "Trajectory_Start_Station_1": "2023-10-15 14:00:00",
    "Trajectory_End_Station_1": "2023-10-15 14:30:00",
    "Trajectory_Start_Station_2": "2023-10-15 14:00:00",
    "Trajectory_End_Station_2": "2023-10-15 14:30:00",
    "Expected_Impact": "2023-10-15 14:35:00",
    "Distance_Received_Station_1": 100.5,
    "Height_Error_Station_1": 0.1,
    "Distance_Error_Station_1": 0.2,
    "Distance_Received_Station_2": 105.0,
    "Height_Error_Station_2": 0.15,
    "Distance_Error_Station_2": 0.25,
    "Trajectory_Time_Station_2": "00:30:00",
    "Equation_Motion_Km": "y = 2x + 1",
    "Equation_Velocity_Gs": "v = 3t + 2",
    "Velocity_Error": 0.05,
    "Initial_Velocity_Station_2": 10.5,
    "Acceleration_Km": 2.0,
    "Acceleration_Gs": 1.5,
    "Report_Path": "/informes/1",
    "Parametric_Equation_Id": 789,
    "Latitude": 38.086827,
    "Longitude": -5.994165
};


const data2 = [
    {
        id: 1,
        lat: 40.4168,
        lon: -3.7038,
        title: 'Estación 1',
        date: '2023-10-27',
        video: '',
        height: 83,
        state: 0
    },
    {
        id: 2,
        lat: 41.3851,
        lon: 2.1734,
        title: 'Estación 2',
        date: '2023-10-27',
        video: '',
        height: 30,
        state: 0
    },
];

const Report = () => {
    const { t } = useTranslation(['text']);
    const params = useParams();
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válidoI
    const [activeTab, setActiveTab] = useState('summary');

    const reportId = data.Report_Id;

    return (
        <div className="p-4">
            <h1> {t('REPORT.TITLE', { id: id })}</h1>
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                mountOnEnter // Montar el contenido solo cuando se selecciona la pestaña
                unmountOnExit // Desmontar el contenido cuando se cambia de pestaña

            >
                <Tab eventKey="summary" title={t('REPORT.SUMMARY_TAB')}>
                    <SummaryReport />
                </Tab>
                <Tab eventKey="data" title={t('REPORT.INFERRED_DATA_TAB')}>
                    <InferredDataReport data={data} />
                </Tab>
                <Tab eventKey="map" title={t('REPORT.MAP_TAB')}>
                    <MapReport data={data} data2={data2} />
                </Tab>
                <Tab eventKey="active_rain" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                    <Alert variant="warning">
                        Esta funcionalidad aún no está implementada. ¡Pronto estará disponible!
                    </Alert>
                </Tab>
                {/* <Tab eventKey="station" title={t('REPORT.STATIONS')}>
                    <StationReport />
                </Tab> */}

                <Tab eventKey="trajectory" title={t('REPORT.TRAJECTORY')}>
                    <GlobeWithObject />
                </Tab>
                <Tab eventKey="trajectory2" title={t('REPORT.TRAJECTORY2')}>
                    <Container>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Punto A - Latitud:</Form.Label>
                                    <Form.Control type="text" value={pointA.lat} readOnly />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Punto A - Longitud:</Form.Label>
                                    <Form.Control type="text" value={pointA.lon} readOnly />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Punto A - Altitud:</Form.Label>
                                    <Form.Control type="text" value={pointA.altitude} readOnly />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Punto B - Latitud:</Form.Label>
                                    <Form.Control type="text" value={pointB.lat} readOnly />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Punto B - Longitud:</Form.Label>
                                    <Form.Control type="text" value={pointB.lon} readOnly />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Punto B - Altitud:</Form.Label>
                                    <Form.Control type="text" value={pointB.altitude} readOnly />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div >
                                    {/* <GlobeWithComet pointA={pointA} pointB={pointB} /> */}
                                    <Pending data={data2} />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Tab>

                <Tab eventKey="asocciatedStation" title={t('REPORT.ASSOCIATED_STATIONS.TITLE')}>


                    <AsocciatedStation reportId={reportId} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Report