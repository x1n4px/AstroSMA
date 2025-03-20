import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Table } from 'react-bootstrap';
import { getPhotometryFromId } from '@/services/photometryService.jsx'

const PhotometryReport = ({ photometryData }) => {
    const [selectedId, setSelectedId] = useState('');
    const [photometryCData, setPhotometryCData] = useState(null);
    const [regressionData, setRegressionData] = useState([]);
    const [meteorData, setMeteorData] = useState([]);
    const [adjustmenPoints, setAdjustmenPoints] = useState([]);


    const handleSelectChange = (event) => {
        setSelectedId(event.target.value);
    };

    useEffect(() => {
        if (selectedId) {
            const fetchData = async () => {
                try {
                    const response = await getPhotometryFromId(selectedId);
                    console.log(response);
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
            fetchData();
        }
    }, [selectedId]);


    return (
        <Container>
            <Row>
                <Col>
                    <h1>Photometry Report</h1>
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
            <Row>
                {photometryCData ? (
                    <>
                        <p>ID seleccionado: {selectedId}</p>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="text" value={photometryCData.Fecha} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Hour</Form.Label>
                                <Form.Control type="text" value={photometryCData.Hora} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Visible Stars</Form.Label>
                                <Form.Control type="text" value={photometryCData.Estrellas_visibles} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Start used in regression</Form.Label>
                                <Form.Control type="text" value={photometryCData.Estrellas_usadas_para_regresion} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Bouger's line External</Form.Label>
                                <Form.Control type="text" value={photometryCData.Coeficiente_externo_Recta_de_Bouger} readOnly />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Bouger's line zero</Form.Label>
                                <Form.Control type="text" value={photometryCData.Punto_cero_Recta_de_Bouger} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Regression standart error</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_regresion} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Standart zerro point</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_punto_cero} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Standart error external coefficient</Form.Label>
                                <Form.Control type="text" value={photometryCData.Error_tipico_coeficiente_externo} readOnly />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Path parabola coeff</Form.Label>
                                <Form.Control type="text" value={photometryCData.Coeficientes_parabola_trayectoria} readOnly />
                            </Form.Group>
                        </Col>

                        {regressionData && regressionData.length > 0 && (
                            <Col xs={12} className="mt-4">
                                <h2>Regression Data</h2>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Star id</th>
                                            <th>Air mass</th>
                                            <th>Catalog magnitude</th>
                                            <th>Instrumental magnitude</th>
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
                                <h2>Meteor Data</h2>
                                <Row>
                                    <Col md={3}>X (start): {meteorData.X_Inicio}</Col>
                                    <Col md={3}>Y (start): {meteorData.Y_Inicio}</Col>
                                    <Col md={3}>Air mass (start): {meteorData.Maire_Inicio}</Col>
                                    <Col md={3}>Distance (start): {meteorData.distInicio}</Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col md={3}>X (end): {meteorData.X_Final}</Col>
                                    <Col md={3}>Y (end): {meteorData.Y_Final}</Col>
                                    <Col md={3}>Air mass (end): {meteorData.Maire_Final}</Col>
                                    <Col md={3}>Distance (end): {meteorData.dist_Final}</Col>
                                </Row>
                            </Col>
                        )}

                       

                        {adjustmenPoints && adjustmenPoints.length > 0 && (
                            <Col xs={12} className="mt-4">
                                <h2>Adjustment Points</h2>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>t</th>
                                            <th>Distance</th>
                                            <th>Mc</th>
                                            <th>Ma</th>
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