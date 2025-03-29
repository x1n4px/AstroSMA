import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Table } from 'react-bootstrap';
import { getPhotometryFromId } from '@/services/photometryService.jsx'
import { useParams, Link } from "react-router-dom";
// Internationalization
import { useTranslation } from 'react-i18next';

const PhotometryReport = ({ photometryData=[], isChild = false }) => {
    const { t } = useTranslation(['text']);
    const [selectedId, setSelectedId] = useState('');
    const [photometryCData, setPhotometryCData] = useState('');
    const [regressionData, setRegressionData] = useState([]);
    const [meteorData, setMeteorData] = useState([]);
    const [adjustmenPoints, setAdjustmenPoints] = useState([]);



    const params = useParams();
    const id = params?.reportId || '-1'; // Asegura que id tenga un valor válidoI

    const handleSelectChange = (event) => {
        setSelectedId(event.target.value);
    };

    useEffect(() => {

        const fetchData = async (id) => {
            try {
                const response = await getPhotometryFromId(id);
                setPhotometryCData(response.photometry);
                setRegressionData(response.regressionStart);
                setMeteorData(response.meteor);
                setAdjustmenPoints(response.adjustPoint);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Manejar el error adecuadamente (por ejemplo, mostrar un mensaje al usuario)
                setPhotometryCData(null);
            }
        };
        if (isChild === false && id !== '-1') {
            // Si hay un ID en la ruta, carga los datos directamente
            fetchData(id);
        } else if (selectedId) {
            // Si hay un ID seleccionado en el select, carga los datos
            fetchData(selectedId);
        }
    }, [selectedId]);


    return (
        <Container>
            {isChild !== false && (
                <Row>

                    <Col>
                        <h1>{t('REPORT.PHOTOMETRY.TITLE')}</h1>
                        <Form.Group className="mb-3">
                            <Form.Label>Selecciona un ID:</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedId}
                                onChange={handleSelectChange}
                            >
                                <option value="">Selecciona un ID</option>
                                {photometryData.map((item) => (
                                    <option key={item.Identificador} value={item.Identificador}>
                                        {item.Identificador}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                    </Col>
                </Row>
            )}
            <Row className="mt-4">
                {photometryCData ? (
                    <>
                     {isChild !== false && (
                        <p>ID seleccionado: {selectedId}</p>
                     )}
                     {isChild === false && (
                        <h1>{t('REPORT.PHOTOMETRY.TITLE', {id: id})}</h1>
                     )}
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.DATE')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Fecha} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.HOUR')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Hora} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.VISIBLE_STARS')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Estrellas_visibles} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.STAR_USED_IN_REGRESSION')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Estrellas_usadas_para_regresion} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_EXTERNAL')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Coeficiente_externo_Recta_de_Bouger} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_ZERO')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Punto_cero_Recta_de_Bouger} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.REGRESSION_STANDART_ERROR')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_regresion} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.STANDART_ZERO_POINT')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_punto_cero} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.STANDART_ERROR_EXTERNAL_COEFF')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_coeficiente_externo} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>{t('REPORT.PHOTOMETRY.INPUT.PATH_PARABOLA_COEFF')}</Form.Label>
                                <Form.Control type="text" value={photometryCData.Coeficientes_parabola_trayectoria} readOnly />
                            </Form.Group>
                        </Col>

                        {regressionData && regressionData.length > 0 && (
                            <Col xs={12} className="mt-4">
                                <h2>{t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.TITLE')}</h2>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>{t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.START_ID')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.AIR_MASS')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.CATALOG_MAGNITUDE')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.INSTRUMENTAL_MAGNITUDE')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regressionData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.Id_estrella}</td>
                                                <td>{item.Masa_de_aire}</td>
                                                <td>{item.Magnitud_de_catalogo}</td>
                                                <td>{item.Magnitud_instrumental}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Col>
                        )}

                        {meteorData && (
                            <Col xs={12} className="mt-4">
                                <h2>{t('REPORT.PHOTOMETRY.METEOR_DATA.TITLE')}</h2>
                                <Row>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.X_START')}</strong>: {meteorData.X_Inicio}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.Y_START')}</strong>: {meteorData.Y_Inicio}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_START')}</strong>: {meteorData.Maire_Inicio}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_START')}</strong>: {meteorData.distInicio}</Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.X_END')}</strong>: {meteorData.X_Final}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.Y_END')}</strong>: {meteorData.Y_Final}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_END')}</strong>: {meteorData.Maire_Final}</Col>
                                    <Col md={3}><strong>{t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_END')}</strong>: {meteorData.dist_Final}</Col>
                                </Row>
                            </Col>
                        )}



                        {adjustmenPoints && adjustmenPoints.length > 0 && (
                            <Col xs={12} className="mt-4">
                                <h2>{t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.TITLE')}</h2>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>{t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.T')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.DISTANCE')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.MC')}</th>
                                            <th>{t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.MA')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adjustmenPoints.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.t}</td>
                                                <td>{item.Dist}</td>
                                                <td>{item.Mc}</td>
                                                <td>{item.Ma}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Col>
                        )}
                    </>
                ) : (
                    selectedId && <p>ID seleccionado: {selectedId}, no encontrado.</p>
                )}
            </Row>
        </Container>
    );
};

export default PhotometryReport;