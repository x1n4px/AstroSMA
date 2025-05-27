import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Alert, Container, Row, Col, Form, Modal, Button, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from "react-router-dom";
import '@/assets/customTabs.css'

import AdviceAlert from '@/components/adviceAlert';
import SummaryReport from '@/pages/astronomy/report/pages/summaryReport';
import InferredDataReport from '@/pages/astronomy/report/pages/inferredDataReport';
import MapReport from '@/pages/astronomy/report/pages/mapReport';
import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
import PendingReport from '@/pages/astronomy/report/pages/pendingReport.jsx'
import PointAdjustReport from '@/pages/astronomy/report/pages/pointAdjustReport';
import OrbitReport from '@/pages/astronomy/report/pages/orbitReport.jsx'
import PhotometryReport from '@/pages/astronomy/report/pages/photometryReport.jsx';
import VideoReport from '@/pages/astronomy/report/pages/videoReport';
import RotationReport from './pages/rotationReport';
import AssociatedDownloadReport from '@/pages/astronomy/report/pages/associatedDownloadReport.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import '@/assets/TabsStyles.css';

import { getReportZ } from '@/services/reportService.jsx'

import { saveReportAdvice, deleteReportAdvice } from '@/services/reportService.jsx';

// Internationalization
import { useTranslation } from 'react-i18next';
import { isNotQRUser, isAdminUser, controlGeminiError } from '@/utils/roleMaskUtils';
import { getConfigValue } from '@/utils/getConfigValue';


const Report = () => {
    const { t } = useTranslation(['text']);
    const params = useParams();
    const navigate = useNavigate();
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
    const [AIUShowerData, setAIUShowerData] = useState([]);
    const [adviceData, setAdviceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [photometryData, setPhotometryData] = useState([]);
    const [slopeMapData, setSlopeMapData] = useState(null);
    const [observatoryName, setObservatoryName] = useState('');
    const [reportGemini, setReportGemini] = useState(null);
    const rol = localStorage.getItem('rol');

    const [resetCount, setResetCount] = useState(0);
    const [cachedReport, setCachedReport] = useState(null);
    const [generatingGemini, setGeneratingGemini] = useState(false);


    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        Description: '',
        Tab: '',
        Informe_Z_Id: id
    });

    const GeminiSpinnerOverlay = () => {
        const [size, setSize] = useState(100);
        const [colorIndex, setColorIndex] = useState(0);
        const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

        useEffect(() => {
            const interval = setInterval(() => {
                setColorIndex((prev) => (prev + 1) % colors.length);
                setSize((prev) => (prev % 150) + 50);
            }, 800);

            return () => clearInterval(interval);
        }, []);

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgb(255, 255, 255)',
                color: 'black',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Spinner
                        animation="border"
                        variant={colors[colorIndex]}
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            transition: 'all 0.5s ease'
                        }}
                    />
                </div>

                <h3 className="mt-4">Generando análisis...</h3>
                <p>Por favor espere, esto puede tomar unos momentos</p>

                <Button
                    variant="outline-danger"
                    className="mt-4"
                    onClick={() => navigate('/dashboard')}
                >
                    Cancelar generación
                </Button>
            </div>
        );
    };


    //useEffect(() => {
    //    if (getConfigValue('showDownloadTab') || reportGemini === 'azd112') {
    //        setActiveTab('INFERRED_DATA_TAB');
    //    }
    //}, [reportGemini]);



    useEffect(() => {
        if (resetCount < 2) {
            const timer = setTimeout(() => setResetCount(resetCount + 1), 10);
            return () => clearTimeout(timer);
        }
    }, [resetCount]);

    useEffect(() => {
        if (!cachedReport) {
            const newReport = getTabAdvice("SUMMARY_TAB"); // Obtén los datos una vez
            setCachedReport(newReport);
        }
    }, [cachedReport]); // Solo se ejecuta si no hay un reporte almacenado

    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReportZ(id); // Ajusta la URL del endpoint
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
            setAIUShowerData(response.showers.sort((a, b) => new Date(a.SubDate) - new Date(b.SubDate)));
            setSlopeMapData(response.slopeMap);
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
            if (!formData.Description || formData.Tab === 'NULL') {
                return;
            }
            const response = saveReportAdvice(formData);

        } catch (error) {
            console.error('Error al guardar el informe:', error);

        }
        setShowModal(false);
    };


    const handleRemoveAdvice = async (adviceId) => {
        try {
            await deleteReportAdvice(adviceId);
            setAdviceData(prevAdviceData => prevAdviceData.filter(advice => advice.Id !== adviceId));

        } catch (error) {
            console.error('Error al eliminar el consejo:', error);
        }
    }

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
            'ASSOCIATED_DOWNLOAD_LINK': 'ASSOCIATED_DOWNLOAD_LINK'
        };
        const adviceForTab = adviceData.filter(advice => advice.Tab === tabMap[tabKey] && advice.status == '1');
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
                        {(getConfigValue('enableErrorAdvise') && isNotQRUser(rol)) && (
                            <Col xs="auto">
                                <Button variant="warning" onClick={handleShow} className="d-flex align-items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="1em" 
                                        height="1em"
                                        viewBox="0 0 24 24"
                                        className="text-dark me-2"
                                    >
                                        <path d="M12.884 2.532c-.346-.654-1.422-.654-1.768 0l-9 17A.999.999 0 0 0 3 21h18a.998.998 0 0 0 .883-1.467L12.884 2.532zM13 18h-2v-2h2v2zm-2-4V9h2l.001 5H11z"></path>
                                    </svg>
                                    {t('REPORT.WARNING_BTN')}
                                </Button>
                            </Col>
                        )}
                    </Row>

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                        mountOnEnter 
                        unmountOnExit 

                    >
                        {controlGeminiError(reportGemini) || getConfigValue('enableIASummary') && (
                            <Tab eventKey="SUMMARY_TAB" title={t('REPORT.SUMMARY_TAB')}>

                                <AdviceAlert
                                    tabKey="SUMMARY_TAB"
                                    adviceData={adviceData}
                                    onRemoveAdvice={handleRemoveAdvice}
                                    rol={rol}
                                />

                                <SummaryReport
                                    data={reportData}
                                    observatory={observatoryData}
                                    orbitalElement={orbitalData}
                                    reportGemini={reportGemini}
                                    setReportGemini={setReportGemini}
                                    onGeneratingStart={() => setGeneratingGemini(true)}
                                    onGeneratingEnd={() => setGeneratingGemini(false)}
                                />


                            </Tab>
                        )}
                        <Tab eventKey="INFERRED_DATA_TAB" title={t('REPORT.INFERRED_DATA_TAB')}>
                            <AdviceAlert
                                tabKey="INFERRED_DATA_TAB"
                                adviceData={adviceData}
                                onRemoveAdvice={handleRemoveAdvice}
                                rol={rol}
                            />
                            {getTabAdvice('INFERRED_DATA_TAB').map(advice => (
                                <Alert key={advice.Id} variant="warning">
                                    ID: {advice.Id} - {advice.Description}
                                </Alert>
                            ))}
                            <InferredDataReport data={reportData} />
                            {/* <VideoReport nombreCamara={observatoryName} report={reportData} /> */}
                        </Tab>

                        <Tab eventKey="ACTIVE_RAIN_TAB" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                            <AdviceAlert
                                tabKey="ACTIVE_RAIN_TAB"
                                adviceData={adviceData}
                                onRemoveAdvice={handleRemoveAdvice}
                                rol={rol}
                            />
                            <ActiveRain activeShowerData={activeShowerData} reportType={'1'} AIUShowerData={AIUShowerData} />
                        </Tab>

                        {orbitalData.length > 0 && (
                            <Tab eventKey="TRAJECTORY" title={t('REPORT.TRAJECTORY')}>
                                <AdviceAlert
                                    tabKey="TRAJECTORY"
                                    adviceData={adviceData}
                                    onRemoveAdvice={handleRemoveAdvice}
                                    rol={rol}
                                />
                                <OrbitReport orbit={orbitalData} observatory={observatoryData[0]} reportDate={formatDate(reportData.Fecha)} />
                            </Tab>
                        )}
                        <Tab eventKey="PENDING_TAB" title={t('REPORT.PENDING.TITLE')}>
                            <AdviceAlert
                                tabKey="PENDING_TAB"
                                adviceData={adviceData}
                                onRemoveAdvice={handleRemoveAdvice}
                                rol={rol}
                            />
                            <PendingReport reportData={reportData} observatory={observatoryData} slopeMapData={slopeMapData} />
                            <RotationReport data={reportData} />
                        </Tab>

                        <Tab eventKey="ZWO" title={t('REPORT.ZWO')}>
                            <AdviceAlert
                                tabKey="ZWO"
                                adviceData={adviceData}
                                onRemoveAdvice={handleRemoveAdvice}
                                rol={rol}
                            />
                            <PointAdjustReport zwoAdjustmentPoints={zwoData} regressionTrajectory={regressionTrajectory} trajectoryData={trajectoryData} />
                        </Tab>


                        {Array.isArray(photometryData) && photometryData.length > 0 && (
                            <Tab eventKey="PHOTOMETRY" title={t('REPORT.PHOTOMETRY.TITLE')}>
                                <AdviceAlert
                                    tabKey="PHOTOMETRY"
                                    adviceData={adviceData}
                                    onRemoveAdvice={handleRemoveAdvice}
                                    rol={rol}
                                />
                                <PhotometryReport photometryData={photometryData} isChild={true} />
                            </Tab>
                        )}

                        {isNotQRUser(rol) && getConfigValue('showDownloadTab') && (
                            <Tab eventKey="ASSOCIATED_DOWNLOAD_LINK" title={t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}>
                                <AdviceAlert
                                    tabKey="ASSOCIATED_DOWNLOAD_LINK"
                                    adviceData={adviceData}
                                    onRemoveAdvice={handleRemoveAdvice}
                                    rol={rol}
                                />
                                <AssociatedDownloadReport report={reportData} />
                            </Tab>
                        )}

                    </Tabs>

                    <Modal show={showModal} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{t('CUSTOMIZE_SEARCH.REPORT_Z')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group controlId="formTab">
                                    <Form.Label>Pestaña</Form.Label>
                                    <Form.Control as="select" name="Tab" value={formData.Tab} onChange={handleChange}>
                                        <option value="NULL" >{t('REPORT.UNSELECTED_TAB')}</option>
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
                                        <option value="ASSOCIATED_DOWNLOAD_LINK">{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}</option>
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
            {generatingGemini && <GeminiSpinnerOverlay />}

        </Container>
    );
};

export default Report