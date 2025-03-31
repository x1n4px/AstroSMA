import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Alert, Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';
import { useParams, Link } from "react-router-dom";
import '@/assets/customTabs.css'


import SummaryReport from '@/pages/astronomy/report/pages/summaryReport';
import InferredDataReport from '@/pages/astronomy/report/pages/inferredDataReport';
import MapReport from '@/pages/astronomy/report/pages/mapReport';
import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
import PendingReport from '@/pages/astronomy/report/pages/pendingReport.jsx'
import PointAdjustReport from '@/pages/astronomy/report/pages/pointAdjustReport';
import OrbitReport from '@/pages/astronomy/report/pages/orbitReport.jsx'
import PhotometryReport from '@/pages/astronomy/report/pages/photometryReport.jsx';
import VideoReport from '@/pages/astronomy/report/pages/videoReport';
import { formatDate } from '@/pipe/formatDate.jsx';

import { getReportZ } from '@/services/reportService.jsx'

import { saveReportAdvice } from '@/services/reportService.jsx';

// Internationalization
import { useTranslation } from 'react-i18next';



const Report = () => {
    const { t } = useTranslation(['text']);
    const params = useParams();
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válidoI
    const [activeTab, setActiveTab] = useState('INFERRED_DATA_TAB');
    const [reportData, setReportData] = useState(null);
    const [observatoryData, setObservatoryData] = useState([]);
    const [orbitalData, setOrbitalData] = useState([]);
    const [mapReportData, setMapReportData] = useState(null);
    const [zwoData, setZwoData] = useState(null);
    const [regressionTrajectory, setRegressionTrajectory] = useState(null);
    const [trajectoryData, setTrajectoryData] = useState(null);
    const [activeShowerData, setActiveShowerData] = useState(null);
    const [adviceData, setAdviceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [photometryData, setPhotometryData] = useState([]);
    const [observatoryName, setObservatoryName] = useState('');
    const rol = localStorage.getItem('rol');



    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        Description: '',
        Tab: '',
        Informe_Z_Id: id
    });


    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReportZ(id); // Ajusta la URL del endpoint
            console.log(response.observatorios)
            setReportData(response.informe);
            setObservatoryData(response.observatorios);
            setOrbitalData(response.orbitalElement);
            setPhotometryData(response.photometryReport);
            setMapReportData(response.mapReport);
            setRegressionTrajectory(response.regressionTrajectory);
            setTrajectoryData(response.trajectory);
            setAdviceData(response.advice);
            setActiveShowerData(response.activeShower);
            setZwoData(response.zwo);
            setObservatoryName(response.observatoryName);
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

    const handleCloseSave = () => {
        // Procesar los datos del formulario aquí
        try {
            const response = saveReportAdvice(formData);
        } catch (error) {
            console.error('Error al guardar el informe:', error);

        }
        setShowModal(false);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleShow = () => setShowModal(true);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const getTabAdvice = (tabKey) => {
        const tabMap = {
            'SUMMARY_TAB': 'SUMMARY_TAB',
            'INFERRED_DATA_TAB': 'INFERRED_DATA_TAB',
            'MAP_TAB': 'MAP_TAB',
            'ACTIVE_RAIN_TAB': 'ACTIVE_RAIN_TAB',
            'STATIONS': 'STATIONS',
            'TRAJECTORY': 'TRAJECTORY',
            'PENDING_TAB': 'PENDING_TAB',
            'ZWO': 'ZWO',
            'PHOTOMETRY': 'PHOTOMETRY',
            'ASSOCIATED_STATIONS': 'ASSOCIATED_STATIONS',

        };
        const adviceForTab = adviceData.filter(advice => advice.Tab === tabMap[tabKey] && advice.status == '0');
        return adviceForTab;
    };

    return (
        <Container>
            <Row className="mb-4">

                <div className="p-4">
                    <Row className="justify-content-between align-items-center">
                        <Col xs="auto">
                            {reportData && (
                                <h1>{t('REPORT.TITLE', { date: formatDate(reportData?.Fecha), hour: reportData?.Hora.substring(0, 8) })}</h1>
                            )}
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
                        {/*<Tab eventKey="SUMMARY_TAB" title={t('REPORT.SUMMARY_TAB')}>
                             {getTabAdvice('SUMMARY_TAB').map(advice => (
                                <Alert key={advice.Id} variant="warning" className="d-flex justify-content-between align-items-center">
                                    <div>
                                        ID: {advice.Id} - {advice.Description}
                                    </div>
                                    {rol === '10000000' && (
                                        <div>
                                            <Button style={{ backgroundColor: 'transparent', border: 'transparent' }} className="me-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgb(59, 252, 0);" }}><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>
                                            </Button>
                                            <Button style={{ backgroundColor: 'transparent', border: 'transparent' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgba(0, 0, 0, 1);" }}><path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path><path d="M9 10h2v8H9zm4 0h2v8h-2z"></path></svg>
                                            </Button>
                                        </div>
                                    )}
                                </Alert>
                            ))} 

                            <SummaryReport data={reportData} />


                        </Tab>*/}
                        <Tab eventKey="INFERRED_DATA_TAB" title={t('REPORT.INFERRED_DATA_TAB')}>
                            {/* {getTabAdvice('INFERRED_DATA_TAB').map(advice => (
                                <Alert key={advice.Id} variant="warning">
                                    ID: {advice.Id} - {advice.Description}
                                </Alert>
                            ))} */}
                            <InferredDataReport data={reportData} />
                            {/* <VideoReport nombreCamara={observatoryName} report={reportData} /> */}
                        </Tab>
                        {/* <Tab eventKey="MAP_TAB" title={t('REPORT.MAP_TAB')}>
                    {getTabAdvice('MAP_TAB').map(advice => (
                        <Alert key={advice.Id} variant="warning">
                            ID: {advice.Id} - {advice.Description}
                        </Alert>
                    ))}
                    <MapReport report={mapReportData} observatory={observatoryData} />
                        </Tab> 
                        */}
                        <Tab eventKey="ACTIVE_RAIN_TAB" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                            {getTabAdvice('ACTIVE_RAIN_TAB').map(advice => (
                                <Alert key={advice.Id} variant="warning">
                                    ID: {advice.Id} - {advice.Description}
                                </Alert>
                            ))}
                            <ActiveRain activeShowerData={activeShowerData} reportType={'1'} />
                        </Tab>
                        {/* <Tab eventKey="STATIONS" title={t('REPORT.STATIONS')}>
                    {getTabAdvice('STATIONS').map(advice => (
                        <Alert key={advice.Id} variant="warning">
                            ID: {advice.Description} - Funcionalidad por definir!
                        </Alert>
                    ))}
                    {!getTabAdvice('STATIONS').length && (
                        <Alert variant="warning">
                            Funcionalidad por definir!
                        </Alert>
                    )}
                     <StationReport /> 
                </Tab> */}
                        {orbitalData.length > 0 && (
                            <Tab eventKey="TRAJECTORY" title={t('REPORT.TRAJECTORY')}>
                                {getTabAdvice('TRAJECTORY').map(advice => (
                                    <Alert key={advice.Id} variant="warning">
                                        ID: {advice.Description} - Funcionalidad por definir!
                                    </Alert>
                                ))}
                                <OrbitReport orbit={orbitalData} observatory={observatoryData[0]} />
                            </Tab>
                        )}
                        <Tab eventKey="PENDING_TAB" title={t('REPORT.PENDING.TITLE')}>
                            {getTabAdvice('PENDING_TAB').map(advice => (
                                <Alert key={advice.Id} variant="warning">
                                    ID: {advice.Description} - Funcionalidad por definir!
                                </Alert>
                            ))}
                            <PendingReport reportData={reportData} observatory={observatoryData} />
                        </Tab>

                        <Tab eventKey="ZWO" title={t('REPORT.ZWO')}>
                            {getTabAdvice('ZWO').map(advice => (
                                <Alert key={advice.Id} variant="warning">
                                    ID: {advice.Description} - Funcionalidad por definir!
                                </Alert>
                            ))}
                            <PointAdjustReport zwoAdjustmentPoints={zwoData} regressionTrajectory={regressionTrajectory} trajectoryData={trajectoryData} />
                        </Tab>

                        {/* <Tab eventKey="ASSOCIATED_STATIONS" title={t('REPORT.ASSOCIATED_STATIONS.TITLE')}>
                    {getTabAdvice('ASSOCIATED_STATIONS').map(advice => (
                        <Alert key={advice.Id} variant="warning">
                            ID: {advice.Description} - Funcionalidad por definir!
                        </Alert>
                    ))}
                    <Alert variant="warning">
                        Esta funcionalidad esta parcialmente, falta completar los datos
                    </Alert>

                    <AsocciatedStation reportId={reportData} observatories={observatoryData} />
                </Tab> */}
                        {Array.isArray(photometryData) && photometryData.length > 0 && (
                            <Tab eventKey="PHOTOMETRY" title={t('REPORT.PHOTOMETRY.TITLE')}>
                                {getTabAdvice('PHOTOMETRY').map(advice => (
                                    <Alert key={advice.Id} variant="warning">
                                        ID: {advice.Description} - Funcionalidad por definir!
                                    </Alert>
                                ))}
                                <PhotometryReport photometryData={photometryData} isChild={true} />
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
                                    <Form.Control as="select" name="Tab" value={formData.Tab} onChange={handleChange}>
                                        <option value="SUMMARY_TAB">{t('REPORT.SUMMARY_TAB')}</option>
                                        <option value="INFERRED_DATA_TAB">{t('REPORT.INFERRED_DATA_TAB')}</option>
                                        <option value="MAP_TAB">{t('REPORT.MAP_TAB')}</option>
                                        <option value="ACTIVE_RAIN_TAB">{t('REPORT.ACTIVE_RAIN_TAB')}</option>
                                        <option value="STATIONS">{t('REPORT.STATIONS')}</option>
                                        <option value="TRAJECTORY">{t('REPORT.TRAJECTORY')}</option>
                                        <option value="PENDING_TAB">{t('REPORT.PENDING.TITLE')}</option>
                                        <option value="ZWO">{t('REPORT.ZWO')}</option>
                                        <option value="ASSOCIATED_STATIONS">{t('REPORT.ASSOCIATED_STATIONS.TITLE')}</option>
                                        <option value="PHOTOMETRY">{t('REPORT.PHOTOMETRY.TITLE')}</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="formDescription">
                                    <Form.Label>Descripción del error</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="Description"
                                        value={formData.Description}
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
                            <Button style={{ backgroundColor: '#980100', border: '#980100' }} onClick={handleCloseSave}>
                                {t('DASHBOARD_MODAL.BTN_SAVE')}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Row>
        </Container>
    );
};

export default Report