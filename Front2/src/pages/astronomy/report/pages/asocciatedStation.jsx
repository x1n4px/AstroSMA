import React, { useEffect, useState } from 'react';
import StationMapChart from '@/components/map/StationMapChart';
import { getAsocciatedStations } from '@/services/stationService';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


const AssociatedStation = ({ reportId, observatories }) => {
    const { t } = useTranslation(['text']);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    useEffect(() => {
        console.log(reportId)
        const fetchStations = async () => {
            try {
                const data = await getAsocciatedStations(reportId);
                setStations(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, [reportId]);

    return (
        <div>
            {loading && <p>Cargando estaciones...</p>}
            {error && <p>Error al cargar las estaciones: {error.message}</p>}
            {!loading && !error && stations.length >= 2 && (
                <>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: stations[0].id })}</h4>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={stations[0].lon}
                                    onChange={(e) => setStation1Longitude(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={stations[0].lat}
                                    onChange={(e) => setStation1Latitude(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">Xi</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={station1Xi}
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
                                    value={station1Eta}
                                    onChange={(e) => setStation1Eta(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">Zeta</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={station1Zeta}
                                    onChange={(e) => setStation1Zeta(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}></Col>
                    </Row>

                    <Row className="mb-3">
                        <Col xs={12}>
                            <h4>{t('REPORT.ASSOCIATED_STATIONS.STATION_TITLE', { id: stations[1].id })}</h4>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LONGITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={stations[1].lon}
                                    onChange={(e) => setStation2Longitude(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">{t('REPORT.ASSOCIATED_STATIONS.STATION_LATITUDE')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={stations[1].lat}
                                    onChange={(e) => setStation2Latitude(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">Xi</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={station2Xi}
                                    onChange={(e) => setStation2Xi(e.target.value)}
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
                                    value={station2Eta}
                                    onChange={(e) => setStation2Eta(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group className="d-flex align-items-center">
                                <Form.Label className="me-2">Zeta</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={station2Zeta}
                                    onChange={(e) => setStation2Zeta(e.target.value)}
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
                                    value={station2Zeta}
                                    onChange={(e) => setStation2Zeta(e.target.value)}
                                    className="flex-grow-1"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <StationMapChart data={stations} useStatinIcon={true} zoom={6} />

                </>
            )}
        </div>
    );
};

export default AssociatedStation;