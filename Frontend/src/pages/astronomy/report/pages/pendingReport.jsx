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
                            <Form.Control type="text" value={reportData.trajectoryStartStation1.latitude + ', ' + reportData.trajectoryStartStation1.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.trajectoryEndStation1.latitude + ', ' + reportData.trajectoryEndStation1.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryEndStation1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation1.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryEndStation1.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                    <h4>{t('REPORT.PENDING.STATION_DETAILS', { id: reportData.ob2 })}</h4>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.START_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.trajectoryStartStation1.latitude + ', ' + reportData.trajectoryStartStation2.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.END_COORDINATES')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.trajectoryEndStation2.latitude + ', ' + reportData.trajectoryEndStation2.longitude} readOnly />
                            <InputGroup.Text>lat, long</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_DISTANCE')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryEndStation2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation2.height)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.FINAL_HEIGHT')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryEndStation2.height)} readOnly />
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
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation1.distance - reportData.trajectoryEndStation1.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.TIME_TRAVELLED', {id: '1'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal( reportData.timeStation1)} readOnly />
                            <InputGroup.Text>s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.AVERAGE_VELOCITY')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.averageVelocity)} readOnly />
                            <InputGroup.Text>Km/s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.INITIAL_VELOCITY',  {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={reportData.initialVelocityStation2 !== null ? truncateDecimal(reportData.initialVelocityStation2) : '-'} readOnly />
                            <InputGroup.Text>Km/s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.DISTANCE_TRAVELLED', {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryStartStation2.distance - reportData.trajectoryEndStation2.distance)} readOnly />
                            <InputGroup.Text>Km</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.TIME_TRAVELLED', {id: '2'})}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.trajectoryTimeStation2)} readOnly />
                            <InputGroup.Text>s</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>{t('REPORT.PENDING.ACCELERATION')}</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={truncateDecimal(reportData.accelerationKms)} readOnly />
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