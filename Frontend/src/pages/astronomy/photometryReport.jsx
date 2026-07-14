import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Tabs, Tab, Alert, Container, Row, Col, Modal, Button, Table } from 'react-bootstrap';
import { getRadiantReport } from '@/services/radiantReportService';
import { buildPhotometryEventTitle } from '@/utils/photometryReportTitle';

import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'


// Internationalization
import { useTranslation } from 'react-i18next';

const RadiantReport = () => {
    const params = useParams();

    const { t } = useTranslation(['text']);
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válidoI
    const [activeTab, setActiveTab] = useState('SUMMARY_TAB');
    const [reportData, setReportData] = useState(null);
    const [angularVelocity, setAngularVelocity] = useState([]);
    const [activeShowerData, setActiveShowerData] = useState([]);
    const [trajectoryData, setTrajectoryData] = useState([]);
    const [adviceData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const rol = localStorage.getItem('rol');

    const fetchReportData = async (id) => {
        try {
            const response = await getRadiantReport(id); // Ajusta la URL del endpoint
            console.log(response)
            setReportData(response.report);
            setAngularVelocity(response.angularVelocity);
            setActiveShowerData(response.activeShower);
            setTrajectoryData(response.trajectory);

        } catch (err) {
            console.error('Error fetching report data:', err);
        }
    };

    useEffect(() => {
        if (id && id !== '-1') {
            fetchReportData(id);
        }
    }, [id]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);


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
    const activeAdvice = getTabAdvice(activeTab);

    return (
        <Container>
            <Row className="mb-4">
                <div className="p-4">
                    <Row className="justify-content-between align-items-center">
                        <Col xs="auto">
                            <h1>{buildPhotometryEventTitle(reportData) || 'Cargando...'}</h1>
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
                        <Tab eventKey="SUMMARY_TAB" title={t('REPORT.SUMMARY_TAB')}>
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

                            <h4>{t('REPORT.ACTIVE_RAIN.TITLE')}</h4>
                            <ActiveRain activeShowerData={activeShowerData} reportType={'2'} />

                            <h4>{t('REPORT.ESTIMATED_TRAJECTORY.TITLE')}</h4>
                            <Table striped bordered hover>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.VELOCITY')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_LON')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_LAT')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_ALT')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_DIST')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_LON')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_LAT')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_ALT')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_DIST')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.RECOR')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.E')}</th>
                                        <th scope="col">{t('REPORT.ESTIMATED_TRAJECTORY.T')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trajectoryData.length > 0 ? (
                                        trajectoryData.map((shower, index) => (
                                            <tr key={index}>
                                                <td>{shower.Velocidad}</td>
                                                <td>{shower.Lon_Inicio}</td>
                                                <td>{shower.Lat_Inicio}</td>
                                                <td>{shower.Alt_Inicio}</td>
                                                <td>{shower.Dist_Inicio}</td>
                                                <td>{shower.Lon_Final}</td>
                                                <td>{shower.Lat_Final}</td>
                                                <td>{shower.Alt_Final}</td>
                                                <td>{shower.Dist_Final}</td>
                                                <td>{shower.Recor}</td>
                                                <td>{shower.e}</td>
                                                <td>{shower.t}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">{t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>


                            <h4>{t('REPORT.ANGULAR_VELOCITY.TITLE')}</h4>
                            <Table striped bordered hover>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">{t('REPORT.ANGULAR_VELOCITY.HI')}</th>
                                        <th scope="col">{t('REPORT.ANGULAR_VELOCITY.SHOWER')}</th>
                                        <th scope="col">{t('REPORT.ANGULAR_VELOCITY.METEOR')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {angularVelocity.length > 0 ? (
                                        angularVelocity.map((angV, index) => (
                                            <tr key={index}>
                                                <td>{angV.hi}</td>
                                                <td>{angV.Lluvia}</td>
                                                <td>{angV.Meteoro}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">{t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>


                        </Tab>

                        {/* <Tab eventKey="ACTIVE_RAIN_TAB" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                    {getTabAdvice('ACTIVE_RAIN_TAB').map(advice => (
                        <Alert key={advice.Id} variant="warning">
                            ID: {advice.Id} - {advice.Description}
                        </Alert>
                    ))}
                    <ActiveRain activeShowerData={activeShowerData} reportType={'2'} />
                </Tab> */}
                    </Tabs>
                    <Modal show={showModal} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{t('REPORT.WARNING_BTN')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {activeAdvice.map(advice => (
                                <Alert key={advice.Id} variant="warning" className="mb-2">
                                    ID: {advice.Id} - {advice.Description}
                                </Alert>
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                {t('TERMS_AND_CONDITIONS.CLOSE_BTN')}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Row>
        </Container>
    );
};

export default RadiantReport;
