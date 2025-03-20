import React, { useState, useEffect } from 'react';
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
import PointAdjustReport from '@/pages/astronomy/report/pages/pointAdjustReport';
import OrbitReport from '@/pages/astronomy/report/pages/orbitReport.jsx'
import PhotometryReport from '@/pages/astronomy/report/pages/photometryReport.jsx';

import { getReportZ } from '@/services/reportService.jsx'

import { saveReportAdvice } from '@/services/reportService.jsx';

// Internationalization
import { useTranslation } from 'react-i18next';



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
    const [reportData, setReportData] = useState(null);
    const [observatoryData, setObservatoryData] = useState(null);
    const [orbitalData, setOrbitalData] = useState(null);
    const [zwoData, setZwoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [photometryData, setPhotometryData] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        descripcion: '',
        tab: '',
        report_id: 0
    });


    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReportZ(id); // Ajusta la URL del endpoint
            console.log(response)
            setReportData(response.informe);
            setObservatoryData(response.observatorios);
            setOrbitalData(response.orbitalElement);
            setPhotometryData(response.photometryReport);
            setZwoData(response.zwo);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== '-1') {
            fetchReportData(id);
            setLoading(false);
        }
    }, [id]);

    const handleClose = () => {
        // Procesar los datos del formulario aquí
        console.log('Datos del formulario:', formData);
        try {
            saveReportAdvice(formData);
        } catch (error) {
            console.error('Error al guardar el informe:', error);

        }
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
                    <h1>{t('REPORT.TITLE', { id: reportData?.IdInforme || 'Cargando...' })}</h1>
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
                    <Alert variant="warning">
                        Esta funcionalidad aún no está implementada. ¡Pronto estará disponible!
                    </Alert>
                    <SummaryReport />
                    <MapReport report={reportData} observatory={observatoryData} />
                </Tab>
                <Tab eventKey="data" title={t('REPORT.INFERRED_DATA_TAB')}>
                    <InferredDataReport data={reportData} />
                </Tab>
                {/* <Tab eventKey="map" title={t('REPORT.MAP_TAB')}>
                   
                </Tab> */}
                {/* <Tab eventKey="active_rain" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                    <Alert variant="warning">
                        Esta funcionalidad aún no está implementada. ¡Pronto estará disponible!
                    </Alert>
                    <ActiveRain reportData={reportData} />
                </Tab> */}
                {/* <Tab eventKey="station" title={t('REPORT.STATIONS')}>
                    <StationReport />
                </Tab>  */}

                <Tab eventKey="trajectory" title={t('REPORT.TRAJECTORY')}>
                    <Alert variant="warning">
                        Esta funcionalidad está parcialmente implementada. ¡Pronto estará disponible!
                    </Alert>
                    <OrbitReport orbit={orbitalData} />


                </Tab>
                <Tab eventKey="pending" title={t('REPORT.PENDING.TITLE')}>
                    <PendingReport reportData={reportData} />
                </Tab>

                <Tab eventKey="point_adjust_and_trajectory" title={t('REPORT.ZWO')}>
                    <PointAdjustReport zwoAdjustmentPoints={zwoData} />
                </Tab>

                <Tab eventKey="asocciatedStation" title={t('REPORT.ASSOCIATED_STATIONS.TITLE')}>
                    <Alert variant="warning">
                        Esta funcionalidad esta parcialmente, falta completar los datos
                    </Alert>

                    <AsocciatedStation reportId={reportData} observatories={observatoryData} />
                </Tab>
                {Array.isArray(photometryData) && photometryData.length > 0 && (
                    <Tab eventKey="photometry" title={t('REPORT.PHOTOMETRY.TITLE')}>
                        <PhotometryReport photometryData={photometryData} />
                    </Tab>
                )}
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
                    <Button style={{ backgroundColor: '#980100', border: '#980100' }} onClick={handleClose}>
                        {t('DASHBOARD_MODAL.BTN_SAVE')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Report