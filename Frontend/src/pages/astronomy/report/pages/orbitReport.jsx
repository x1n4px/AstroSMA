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
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.DATE.label')}</Form.Label>
                        <Form.Control type="text" value={formatDate(data?.Fecha)} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.VELOCITY_INF.label')}</Form.Label>
                        <Form.Control type="text" value={data?.Vel__Inf?.split(" ")[0]} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.VELOCITY_GEOM.label')}</Form.Label>
                        <Form.Control type="text" value={data?.Vel__Geo?.split(" ")[0]} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.AR.label')}</Form.Label>
                        <Form.Control type="text" value={data?.Ar?.split(" ")[0]} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.E.label')}</Form.Label>
                        <Form.Control type="text" value={data?.e?.split(" ")[0]} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.Q.label')}</Form.Label>
                        <Form.Control type="text" value={data?.q?.split(" ")[0]} readOnly />
                    </Form.Group> <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.OMEGA.label')}</Form.Label>
                        <Form.Control type="text" value={data?.omega?.split(" ")[0]} readOnly />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.HOUR.label')}</Form.Label>
                        <Form.Control type="text" value={data?.Hora.substring(0, 8)} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.DE.label')}</Form.Label>
                        <Form.Control type="text" value={data?.De?.split(" ")[0]} readOnly />
                    </Form.Group>
 
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.I.label')}</Form.Label>
                        <Form.Control type="text" value={data?.i?.split(" ")[0]} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.P.label')}</Form.Label>
                        <Form.Control type="text" value={data?.p?.split(" ")[0]} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.A.label')}</Form.Label>
                        <Form.Control type="text" value={data?.a?.split(" ")[0]} readOnly />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.T.label')}</Form.Label>
                        <Form.Control type="text" value={data?.T?.split(" ")[0]} readOnly />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>{t('ORBIT_REPORT.OMEGA_DEGREE.label')}</Form.Label>
                        <Form.Control type="text" value={data?.Omega_grados_votos_max_min?.split(", ")[0]} readOnly />
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