import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Table, Accordion } from "react-bootstrap";
import "chart.js/auto";
import LineChart from '@/components/chart/LineChart';
// Internationalization
import { useTranslation } from 'react-i18next';
import formatDate from '@/pipe/formatDate.jsx'
import truncateDecimal from '@/pipe/truncateDecimal';


const PointAdjustReport = ({ zwoAdjustmentPoints, regressionTrajectory, trajectoryData }) => {
    
    const { t } = useTranslation(['text']);

    return (
        <div>
            <Container>
                <Accordion alwaysOpen>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            ZWO
                        </Accordion.Header>
                        <Accordion.Body>
                            <h2>{t('REPORT.POINT_ADJUST.ZWO.TITLE')}</h2>
                            
                            <Row>
                                <h4>{t('REPORT.POINT_ADJUST.ZWO.TABLE.TITLE')}</h4>
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.DATE')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.HOUR')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.Ar_Grados')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.De_Grados')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {zwoAdjustmentPoints.map((p, index) => (
                                            <tr key={`${p.Fecha}-${p.X}-${index}`}>
                                                <td>{formatDate(p.Fecha)}</td>
                                                <td>{new Date(`1970-01-01T${p.Hora}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                                <td>{truncateDecimal(p.Ar_Grados)}</td>
                                                <td>{truncateDecimal(p.De_Grados)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>
                            {t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TITLE')}
                        </Accordion.Header>
                        <Accordion.Body>
                            <Table hover responsive>
                                <thead>
                                    <tr>
                                        <th scope="col">{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.DATE')}</th>
                                        <th scope="col">{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.HOUR')}</th>
                                        <th scope="col">{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.t')}</th>
                                        <th scope="col">{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.s')}</th>
                                        <th scope="col">{t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.v')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regressionTrajectory.map((point, index) => (
                                        <tr key={`${point.Fecha}-${point.t}-${index}`}>
                                            <td>{formatDate(point.Fecha)}</td>
                                            <td>{point.Hora}</td>
                                            <td>{truncateDecimal(point.t)}</td>
                                            <td>{truncateDecimal(point.s)}</td>
                                            <td>{truncateDecimal(point.v_Kms)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>
                            {t('REPORT.POINT_ADJUST.TRAJECTORY.TITLE')}
                        </Accordion.Header>
                        <Accordion.Body>
                            <div style={{ overflowX: 'auto' }}>
                                <Table hover responsive>
                                    <thead>
                                        <tr>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DATE')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.HOUR')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.S')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.T')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.V')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.LAMBDA')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.PHI')}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', { id: '1' })}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', { id: '1' })}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', { id: '2' })}</th>
                                            <th scope="col">{t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', { id: '2' })}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trajectoryData.map((p, index) => (
                                            <tr key={`${p.Fecha}-${p.s}-${index}`}>
                                                <td>{formatDate(p.Fecha)}</td>
                                                <td>{p.Hora}</td>
                                                <td>{truncateDecimal(p.s)}</td>
                                                <td>{truncateDecimal(p.t)}</td>
                                                <td>{truncateDecimal(p.v)}</td>
                                                <td>{truncateDecimal(p.lambda)}</td>
                                                <td>{truncateDecimal(p.phi)}</td>
                                                <td>{truncateDecimal(p.AR_Estacion_1)}</td>
                                                <td>{truncateDecimal(p.De_Estacion_1)}</td>
                                                <td>{truncateDecimal(p.Ar_Estacion_2)}</td>
                                                <td>{truncateDecimal(p.De_Estacion_2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Container>
        </div>
    );
};

export default PointAdjustReport;