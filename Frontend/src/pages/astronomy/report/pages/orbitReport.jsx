import React from 'react';
import { Container, Table, Row, Col, Form } from 'react-bootstrap';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx';

import { useTranslation } from 'react-i18next';

import { formatDate } from '@/pipe/formatDate'


const OrbitReport = ({ orbit, observatory }) => {
    const { t } = useTranslation(['text']);
    const data = orbit[0];
    


    return (
        <Container>


            <Row className="mb-4">
                <Col md={6}>



                    <Form.Group className="mb-3" controlId="formVelocityInf">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.DATE.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={formatDate(data?.Fecha)} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.DATE.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.DATE.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formVelocityInf">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.VELOCITY_INF.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.Vel__Inf?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.VELOCITY_INF.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.VELOCITY_INF.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formVelocityGeom">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.VELOCITY_GEOM.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.Vel__Geo?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.VELOCITY_GEOM.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.VELOCITY_GEOM.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formAr">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.AR.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.Ar?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.AR.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.AR.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formE">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.E.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.e?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.E.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.E.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formQ">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.Q.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.q?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.Q.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.Q.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formQ">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.OMEGA.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.omega?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.OMEGA.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.OMEGA.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                    
                </Col>
                <Col md={6}>


                    <Form.Group className="mb-3" controlId="formVelocityInf">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.HOUR.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.Hora.substring(0, 8)} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.HOUR.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.HOUR.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDe">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.DE.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.De?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.DE.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.DE.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formI">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.I.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.i?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.I.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.I.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formP">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.P.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.p?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.P.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.P.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formA">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.A.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.a?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.A.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.A.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formQ">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.T.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control type="text" value={data?.T?.split(" ")[0]} readOnly className="form-control flex-grow-1" />
                                    {t('ORBIT_REPORT.T.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.T.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDihedralAngle">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label className="mb-0">{t('ORBIT_REPORT.OMEGA_DEGREE.label')}</Form.Label>
                            </Col>
                            <Col>
                                <div className="input-group">
                                    <Form.Control
                                        type="text"
                                        value={data?.Omega_grados_votos_max_min?.split(", ")[0]}
                                        readOnly
                                        className="form-control flex-grow-1"
                                    />
                                    {t('ORBIT_REPORT.OMEGA_DEGREE.measure') && (
                                        <div className="input-group-append">
                                            <span className="input-group-text" id="basic-addon2">
                                                {t('ORBIT_REPORT.OMEGA_DEGREE.measure')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form.Group>
                </Col>
                
            </Row>
            <>
                 

                    <div style={{ width: '100%', height: 'auto' }}>

                        <GlobeWithObject orbitalElements={data} lat={observatory.latitude} lon={observatory.longitude} />

                    </div>
                 
            </>
        </Container>
    );
};

export default OrbitReport;