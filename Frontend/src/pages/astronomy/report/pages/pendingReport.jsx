import React from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import truncateDecimal from '@/pipe/truncateDecimal';
import MultiMarkerMapChart from '@/components/map/MultiMarkerMapChart';


const PendingReport = ({ reportData, observatory, slopeMapData }) => {
     const { t } = useTranslation(['text']);
    if (!reportData) {
        return <p>{t('REPORT.PENDING.NO_DATA')}</p>; // Manejo de datos faltantes
    }

    return (
        <Container>
            <Row className="mb-4">
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: reportData.ob1 })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ', ' + reportData.Inicio_de_la_trayectoria_Estacion_1.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_1.latitude + ', ' + reportData.Fin_de_la_trayectoria_Estacion_1.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Fin_de_la_trayectoria_Estacion_1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_1.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Fin_de_la_trayectoria_Estacion_1.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: reportData.ob2 })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.Inicio_de_la_trayectoria_Estacion_1.latitude + ', ' + reportData.Inicio_de_la_trayectoria_Estacion_2.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.Fin_de_la_trayectoria_Estacion_2.latitude + ', ' + reportData.Fin_de_la_trayectoria_Estacion_2.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Fin_de_la_trayectoria_Estacion_2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_2.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Fin_de_la_trayectoria_Estacion_2.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>
            <hr></hr>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.DISTANCE_TRAVELLED', {id: '1'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_1.distance - reportData.Fin_de_la_trayectoria_Estacion_1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.TIME_TRAVELLED', {id: '1'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal( reportData.Tiempo_Estacion_1)} readOnly />
                            <InputGroup.Text>s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.AVERAGE_VELOCITY')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Velocidad_media)} readOnly />
                            <InputGroup.Text>Km/s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_VELOCITY',  {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.Velocidad_Inicial_Estacion_2 !== null ? truncateDecimal(reportData.Velocidad_Inicial_Estacion_2) : '-'} readOnly />
                            <InputGroup.Text>Km/s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.DISTANCE_TRAVELLED', {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Inicio_de_la_trayectoria_Estacion_2.distance - reportData.Fin_de_la_trayectoria_Estacion_2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.TIME_TRAVELLED', {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Tiempo_trayectoria_en_estacion_2)} readOnly />
                            <InputGroup.Text>s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.ACCELERATION')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.Aceleración_en_Kms)} readOnly />
                            <InputGroup.Text>Km/s²</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div>
                        {/* <Pending data={data} /> */}

                        <div style={{ width: 'auto', height: 'auto', marginBlock: '20px' }}>
                            <MultiMarkerMapChart data={slopeMapData.map(item => item.MAP_DATA)} key={`key-a9`} observatory={observatory} />
                        </div>
                        
                        
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PendingReport;