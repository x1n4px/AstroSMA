import React, { useState, useEffect } from 'react';
import { Container, Table, Row, Col, Form } from 'react-bootstrap';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx';

import { useTranslation } from 'react-i18next';

import { formatDate } from '@/pipe/formatDate'


const OrbitReport = ({ orbit, observatory, reportDate }) => {
    const { t } = useTranslation(['text']);
    const [selectedOrbitIndex, setSelectedOrbitIndex] = useState(0); // Usamos el índice en lugar del ID
    const selectedOrbit = orbit[selectedOrbitIndex];
    useEffect(() => {
        if (orbit && orbit.length === 1) {
            setSelectedOrbitIndex(0); // Seleccionamos el primer elemento si solo hay uno
        }
    }, [orbit]);

    const handleOrbitChange = (event) => {
        setSelectedOrbitIndex(parseInt(event.target.value));
    };


    return (
        <Container>
            {orbit && orbit.length > 1 && (
                <Form.Group className="mb-3">
                    <Form.Label>{t('ORBIT_REPORT.SELECT_OPT.LABEL')}</Form.Label>
                    <Form.Select onChange={handleOrbitChange} value={selectedOrbitIndex}>
                        {orbit.map((item, index) => (
                            <option key={index} value={index}>
                                {formatDate(item.Fecha)} - {item.Hora.substring(0, 8)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {selectedOrbit && (
                <>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.DATE.label')}</Form.Label>
                                <Form.Control type="text" value={formatDate(selectedOrbit?.Fecha)} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.VELOCITY_INF.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.Vel__Inf?.split(" ")[0]} readOnly className={(parseFloat(selectedOrbit?.Vel__Inf) < 0) ? 'border-danger text-danger' : ''} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.VELOCITY_GEOM.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.Vel__Geo?.split(" ")[0]} readOnly className={(parseFloat(selectedOrbit?.Vel__Geo) < 0) ? 'border-danger text-danger' : ''} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.AR.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.Ar?.split(" ")[0]} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.E.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.e?.split(" ")[0]} readOnly className={(parseFloat(selectedOrbit?.e) < 0) ? 'border-danger text-danger' : ''} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.Q.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.q?.split(" ")[0]} readOnly className={(parseFloat(selectedOrbit?.q) <= 0) ? 'border-danger text-danger' : ''} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.OMEGA.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.omega?.split(" ")[0]} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.HOUR.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.Hora.substring(0, 8)} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.DE.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.De?.split(" ")[0]} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.I.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.i?.split(" ")[0]} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.P.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.p?.split(" ")[0]} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.A.label')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedOrbit?.a?.split(" ")[0]}
                                    readOnly
                                    className={(parseFloat(selectedOrbit?.a?.split(" ")[0]) < 0) ? 'border-danger text-danger' : ''}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.T.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.T?.split(" ")[0]} readOnly className={(parseFloat(selectedOrbit?.T) < 0) ? 'border-danger text-danger' : ''} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('ORBIT_REPORT.OMEGA_DEGREE.label')}</Form.Label>
                                <Form.Control type="text" value={selectedOrbit?.Omega_grados_votos_max_min?.split(", ")[0]} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div style={{ width: '100%', height: 'auto' }}>
                        {(
                            selectedOrbit &&
                            parseFloat(selectedOrbit.a) > 0 &&
                            parseFloat(selectedOrbit.Vel__Inf) > 0 &&
                            parseFloat(selectedOrbit.Vel__Geo) > 0 &&
                            parseFloat(selectedOrbit.e) >= 0 &&
                            parseFloat(selectedOrbit.q) > 0
                        ) && (
                                <GlobeWithObject
                                    key={selectedOrbit.Ar}
                                    orbitalElements={selectedOrbit}
                                    lat={observatory.latitude}
                                    lon={observatory.longitude}
                                    reportDate={reportDate}
                                />
                            )}

                    </div>
                </>
            )}
        </Container>
    );
};

export default OrbitReport;