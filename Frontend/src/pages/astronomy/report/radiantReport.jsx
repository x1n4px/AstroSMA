import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { Tabs, Tab, Alert, Container, Row, Col, Form, Modal, Button, Table } from 'react-bootstrap';
import { getRadiantReport } from '@/services/radiantReportService';

import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
import { isNotQRUser, isAdminUser, controlGeminiError } from '@/utils/roleMaskUtils';
import { getConfigValue } from '@/utils/getConfigValue';
import { formatDate } from '@/pipe/formatDate.jsx';

// Internationalization
import { useTranslation } from 'react-i18next';

const RadiantReport = () => {
    const params = useParams();

    const { t } = useTranslation(['text']);
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válidoI
    const [reportData, setReportData] = useState(null);
    const [observatoryData, setObservatoryData] = useState([]);
    const [angularVelocity, setAngularVelocity] = useState([]);
    const [activeShowerData, setActiveShowerData] = useState([]);
    const [trajectoryData, setTrajectoryData] = useState([]);
    const [adviceData, setAdviceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const rol = localStorage.getItem('rol');

    const fetchReportData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getRadiantReport(id); // Ajusta la URL del endpoint
            console.log(response)
            setReportData(response.report);
            setObservatoryData(response.observatory);
            setAngularVelocity(response.angularVelocity);
            setActiveShowerData(response.activeShower);
            setTrajectoryData(response.trajectory);

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

    const handleShow = () => setShowModal(true);


    return (
        <div className="p-4">

            <Row className="justify-content-between align-items-center">
                <Col xs="auto">
                    <h1>{t('REPORT.TITLE_RADIAN', { id: '' })} {formatDate(reportData?.Fecha)} {reportData?.Hora.substring(0, 8)}</h1>

                </Col>

                {(getConfigValue('enableErrorAdvise') && isNotQRUser(rol)) && (
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
                )}
            </Row>
            <hr />

            <div>

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


            </div>

            {/* <Tab eventKey="ACTIVE_RAIN_TAB" title={t('REPORT.ACTIVE_RAIN_TAB')}>
                    {getTabAdvice('ACTIVE_RAIN_TAB').map(advice => (
                        <Alert key={advice.Id} variant="warning">
                            ID: {advice.Id} - {advice.Description}
                        </Alert>
                    ))}
                    <ActiveRain activeShowerData={activeShowerData} reportType={'2'} />
                </Tab> */}
        </div>
    );
};

export default RadiantReport;