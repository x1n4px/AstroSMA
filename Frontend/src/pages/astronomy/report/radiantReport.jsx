import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { Tabs, Tab, Alert, Container, Row, Col, Form, Modal, Button, Table } from 'react-bootstrap';
import { getRadiantReport } from '@/services/radiantReportService';

import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx'
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
                    <h1>{t('REPORT.TITLE_RADIAN', { id: '' })} {formatDate(reportData?.date)} {reportData?.time.substring(0, 8)}</h1>

                </Col>

                
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