import React from 'react';
import ReportMapChart from '@/components/map/ReportMap';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


function MapReport({ report, observatory }) {
    const { t } = useTranslation(['text']);
    return (
        <div>
            <Row className="mb-3">
                <Col xs={12}>
                    <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: observatory[0].id })}</h4>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={observatory[0].longitude}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={observatory[0].latitude}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Xi</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            onChange={(e) => setStation1Xi(e.target.value)}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Eta</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Zeta</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}></Col>
            </Row>

            <Row className="mb-3">
                <Col xs={12}>
                    <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: observatory[1].id })}</h4>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={observatory[1].longitude}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={observatory[1].latitude}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Xi</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Eta</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Label className="me-2">Zeta</Form.Label>
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}></Col>
            </Row>

            <Row className="mb-3">
                <Col xs={12}>
                    <h4>{t('REPORT.ASSOCIATED_STATIONS.CUADRATURA_ERROR')}:</h4>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            value={0}
                            className="flex-grow-1"
                        />
                    </Form.Group>
                </Col>
            </Row>
            {report && (

                <ReportMapChart lat={report.latitude} lon={report.longitude} observatory={observatory} zoom={7} />
            )}
        </div>
    );
};

export default MapReport;