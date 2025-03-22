import React from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SummaryReport = ({ data }) => {
    const { t } = useTranslation(['text']);


    return (
        <div>
            <Container>
                <Row className="mb-4">
                    <Col md={6}>

                        <Form.Group className="mb-3" controlId="formDate">
                            <Form.Label>{t('SUMMARY_REPORT.DATE.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Fecha} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.DATE.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.DATE.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formHour">
                            <Form.Label>{t('SUMMARY_REPORT.HOUR.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Hora} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.HOUR.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.HOUR.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formFirstObservatory">
                            <Form.Label>{t('SUMMARY_REPORT.FIRST_OBSERVATORY.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Observatorio_Número} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.FIRST_OBSERVATORY.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.FIRST_OBSERVATORY.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSecondObservatory">
                            <Form.Label>{t('SUMMARY_REPORT.SECOND_OBSERVATORY.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Observatorio_Número2} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.SECOND_OBSERVATORY.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.SECOND_OBSERVATORY.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formUsedFrames">
                            <Form.Label>{t('SUMMARY_REPORT.USED_FRAMES.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Fotogramas_usados} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.USED_FRAMES.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.USED_FRAMES.measure')}</span>
                                </div>
                            }
                        </Form.Group>



                    </Col>
                    <Col md={6}>

                        <Form.Group className="mb-3" controlId="formDihedralAngle">
                            <Form.Label>{t('SUMMARY_REPORT.DIHEDRAL_ANGLE.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Ángulo_diedro_entre_planos_trayectoria} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.DIHEDRAL_ANGLE.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.DIHEDRAL_ANGLE.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCoordinatesToDate">
                            <Form.Label>{t('SUMMARY_REPORT.COORDINATES_TO_DATE.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.COORDINATES_TO_DATE.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.COORDINATES_TO_DATE.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCoordinatesToJ2000">
                            <Form.Label>{t('SUMMARY_REPORT.COORDINATES_J2000.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Coordenadas_astronómicas_del_radiante_J200} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.COORDINATES_J2000.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.COORDINATES_J2000.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAzimuth">
                            <Form.Label>{t('SUMMARY_REPORT.AZIMUTH.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Azimut} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.AZIMUTH.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.AZIMUTH.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formZenithalDistance">
                            <Form.Label>{t('SUMMARY_REPORT.ZENITH_DISTANCE.label')}</Form.Label>
                            <Form.Control type="text" value={data?.Dist_Cenital} readOnly className="form-control flex-grow-1" />
                            {t('SUMMARY_REPORT.ZENITH_DISTANCE.measure') &&
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">{t('SUMMARY_REPORT.ZENITH_DISTANCE.measure')}</span>
                                </div>
                            }
                        </Form.Group>

                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SummaryReport;