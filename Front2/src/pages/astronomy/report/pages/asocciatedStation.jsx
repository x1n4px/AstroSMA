import React, { useEffect, useState } from 'react';
import StationMapChart from '@/components/map/StationMapChart';
import { getAsocciatedStations } from '@/services/stationService';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


const AssociatedStation = ({ reportId, observatories }) => {
    const { t } = useTranslation(['text']);
   
    const [station1Longitude, setStation1Longitude] = useState('');
    const [station1Latitude, setStation1Latitude] = useState('');
    const [station1Xi, setStation1Xi] = useState('');
    const [station1Eta, setStation1Eta] = useState('');
    const [station1Zeta, setStation1Zeta] = useState('');
    const [station2Longitude, setStation2Longitude] = useState('');
    const [station2Latitude, setStation2Latitude] = useState('');
    const [station2Xi, setStation2Xi] = useState('');
    const [station2Eta, setStation2Eta] = useState('');
    const [station2Zeta, setStation2Zeta] = useState('');
    const [cuadraturaError, setCuadraturaError] = useState(''); // Estado para el error de cuadratura

   

    return (
        <div>
           
                <>
                     <Row className="mb-3">
                        <Col xs={12}>
                            <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: observatories[0].id })}</h4>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={observatories[0].longitude}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={observatories[0].latitude}
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
                            <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: observatories[1].id })}</h4>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={observatories[1].longitude}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={observatories[1].latitude}
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

                    <StationMapChart data={observatories} useStatinIcon={true} zoom={6} activePopUp={true} />

                </>
            
        </div>
    );
};

export default AssociatedStation;