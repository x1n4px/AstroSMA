import React, { useState } from 'react';
import { Tabs, Tab, Alert, Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';
import { useParams, Link } from "react-router-dom";
import '@/assets/customTabs.css'


import SummaryReport from '@/pages/astronomy/report/pages/summaryReport';
import InferredDataReport from '@/pages/astronomy/report/pages/inferredDataReport';
import MapReport from '@/pages/astronomy/report/pages/mapReport';
import StationReport from '@/pages/astronomy/report/pages/stationReport';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx'
import GlobeWithComet from '@/components/three/BolideSlopeChart.jsx';
import AsocciatedStation from '@/pages/astronomy/report/pages/asocciatedStation.jsx'
import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
import PendingReport from '@/pages/astronomy/report/pages/pendingReport.jsx'

// Internationalization
import { useTranslation } from 'react-i18next';



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

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        descripcion: '',
        tab: '',
        report_id: reportId
    });

    const handleClose = () => {
        // Procesar los datos del formulario aquí
        console.log('Datos del formulario:', formData);
        setShowModal(false);
    };

    const handleShow = () => setShowModal(true);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };




    return (
        <div className="p-4">
            <Row className="justify-content-between align-items-center">
                <Col xs="auto">
                    <h1>{t('REPORT.TITLE', { id: reportId })}</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="warning" onClick={handleShow} className="d-flex align-items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em" // Usar em para que el tamaño sea relativo al tamaño de la fuente
                            height="1em"
                            viewBox="0 0 24 24"
                            className="text-dark me-2" // Texto oscuro y margen derecho
                        >
                            <path d="M12.884 2.532c-.346-.654-1.422-.654-1.768 0l-9 17A.999.999 0 0 0 3 21h18a.998.998 0 0 0 .883-1.467L12.884 2.532zM13 18h-2v-2h2v2zm-2-4V9h2l.001 5H11z"></path>
                        </svg>
                        {t('REPORT.WARNING_BTN')}
                    </Button>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                mountOnEnter // Montar el contenido solo cuando se selecciona la pestaña
                unmountOnExit // Desmontar el contenido cuando se cambia de pestaña

            >
                <Tab eventKey="summary" title={t('REPORT.SUMMARY_TAB')}>
                    <SummaryReport />
                    <MapReport data={data} data2={data2} />
                </Tab>
                <Tab eventKey="data" title={t('REPORT.INFERRED_DATA_TAB')}>
                    <InferredDataReport data={data} />
                </Tab>
                {/* <Tab eventKey="map" title={t('REPORT.MAP_TAB')}>
                   
                </Tab> */}
                <Tab eventKey="active_rain" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                    <Alert variant="warning">
                        Esta funcionalidad aún no está implementada. ¡Pronto estará disponible!
                    </Alert>
                    <ActiveRain />
                </Tab>
                {/* <Tab eventKey="station" title={t('REPORT.STATIONS')}>
                    <StationReport />
                </Tab>  */}

                <Tab eventKey="trajectory" title={t('REPORT.TRAJECTORY')}>
                    <div style={{ width: '100%', height: '80vh' }}>
                    <GlobeWithObject />
                        </div>
                  
                </Tab>
                <Tab eventKey="pending" title={t('REPORT.PENDING')}>
                    <PendingReport data2={data2} />
                </Tab>

                <Tab eventKey="asocciatedStation" title={t('REPORT.ASSOCIATED_STATIONS.TITLE')}>


                    <AsocciatedStation reportId={reportId} />
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('REPORT.TITLE', { id: id })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTab">
              <Form.Label>Pestaña</Form.Label>
              <Form.Control as="select" name="tab" value={formData.tab} onChange={handleChange}>
                <option value="SUMMARY_TAB">{t('REPORT.SUMMARY_TAB')}</option>
                <option value="INFERRED_DATA_TAB">{t('REPORT.INFERRED_DATA_TAB')}</option>
                <option value="MAP_TAB">{t('REPORT.MAP_TAB')}</option>
                <option value="ACTIVE_RAIN_TAB">{t('REPORT.ACTIVE_RAIN_TAB')}</option>
                <option value="STATIONS">{t('REPORT.STATIONS')}</option>
                <option value="TRAJECTORY">{t('REPORT.TRAJECTORY')}</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formDescripcion">
              <Form.Label>Descripción del error</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Agrega aquí otros campos del formulario */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('DASHBOARD_MODAL.BTN_CLOSE')}
          </Button>
          <Button style={{backgroundColor: '#980100', border: '#980100'}} onClick={handleClose}>
          {t('DASHBOARD_MODAL.BTN_SAVE')}
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
    );
};

export default Report