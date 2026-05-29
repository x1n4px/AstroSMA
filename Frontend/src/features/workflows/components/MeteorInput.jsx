import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Alert, Card, ListGroup } from "react-bootstrap";
import { API_ENDPOINTS, buildQueryUrl, fetchApi } from "../config/api";
import "./MeteorInput.css";

// Helper function to format date without timezone issues
const formatDate = dateStr => {
    if (!dateStr) return "";

    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
    }

    // For any date format, convert to local Spanish timezone and format
    try {
        const date = new Date(dateStr);

        // Check if it's a valid date
        if (isNaN(date.getTime())) {
            return dateStr;
        }

        // Use toLocaleDateString with Spanish timezone to get the correct local date
        const localDateStr = date.toLocaleDateString("en-CA", {
            timeZone: "Europe/Madrid",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        return localDateStr;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateStr;
    }
};

const MeteorInput = ({ onMeteorSelect, selectedMeteorData }) => {
    const [meteorData, setMeteorData] = useState({
        identifier: "",
        date: "",
        startTime: "",
        endTime: "",
        observatory: ""
    });
    const [observatories, setObservatories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMeteor, setSelectedMeteor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load active observatories on component mount
    useEffect(() => {
        loadObservatories();
    }, []);

    // Restore meteor state when selectedMeteorData changes (e.g., when loading a view)
    useEffect(() => {
        if (selectedMeteorData) {
            // Update meteorData with the restored data
            setMeteorData(prev => ({
                ...prev,
                identifier: selectedMeteorData.identifier?.toString() || "",
                observatory: selectedMeteorData.observatory || ""
            }));

            // Create a mock meteor object for selectedMeteor state
            const restoredMeteor = {
                Identificador: selectedMeteorData.identifier,
                Fecha: selectedMeteorData.date,
                Hora: selectedMeteorData.time
            };
            setSelectedMeteor(restoredMeteor);
            setSuccess(`Restored meteor: ID ${restoredMeteor.Identificador} - ${formatDate(restoredMeteor.Fecha)} ${restoredMeteor.Hora}`);
        }
    }, [selectedMeteorData]);

    const loadObservatories = async () => {
        try {
            const response = await fetchApi(
                buildQueryUrl(API_ENDPOINTS.workflows.runPredefinedQuery, { query: "getActiveObservatories" })
            );
            if (response.ok) {
                const data = await response.json();
                setObservatories(data);
            }
        } catch (error) {
            console.error("Error loading observatories:", error);
        }
    };

    const handleInputChange = (field, value) => {
        setMeteorData(prev => ({
            ...prev,
            [field]: value
        }));
        setError("");
        setSuccess("");
        setSearchResults([]);
        setSelectedMeteor(null);
    };

    const searchMeteorData = async () => {
        if (!meteorData.date) {
            setError("Please enter at least the observation date");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        setSearchResults([]);
        setSelectedMeteor(null);

        try {
            // Determine the appropriate query based on parameters provided
            let queryName;
            const searchParams = { fecha: meteorData.date };

            if (meteorData.startTime && meteorData.endTime) {
                queryName = "searchMeteorByDateAndTime";
                searchParams.horaInicio = meteorData.startTime;
                searchParams.horaFin = meteorData.endTime;
            } else if (meteorData.observatory) {
                queryName = "searchMeteorByDateAndObservatory";
                searchParams.observatorio = meteorData.observatory;
            } else {
                queryName = "searchMeteorByDate";
            }

            searchParams.query = queryName;

            const response = await fetchApi(buildQueryUrl(API_ENDPOINTS.workflows.runPredefinedQuery, searchParams));

            if (response.ok) {
                const meteorInfo = await response.json();
                if (meteorInfo && meteorInfo.length > 0) {
                    setSearchResults(meteorInfo);
                    setSuccess(
                        `Found ${meteorInfo.length} meteor(s) matching the criteria. Please select one from the list below.`
                    );
                } else {
                    setError("No meteors found with those parameters");
                }
            } else {
                setError("Error searching for meteors in database");
            }
        } catch (error) {
            console.error("Error searching meteors:", error);
            setError("Connection error while searching for meteors");
        } finally {
            setLoading(false);
        }
    };

    const selectMeteorFromList = meteor => {
        setSelectedMeteor(meteor);
        setMeteorData(prev => ({
            ...prev,
            identifier: meteor.Identificador.toString()
        }));
        setSuccess(`Selected meteor: ID ${meteor.Identificador} - ${formatDate(meteor.Fecha)} ${meteor.Hora}`);

        // Notify parent component with meteor data
        if (onMeteorSelect) {
            onMeteorSelect({
                identifier: meteor.Identificador,
                date: meteor.Fecha,
                time: meteor.Hora,
                observatory: meteorData.observatory
            });
        }
    };

    const clearForm = () => {
        setMeteorData({
            identifier: "",
            date: "",
            startTime: "",
            endTime: "",
            observatory: ""
        });
        setError("");
        setSuccess("");
        setSearchResults([]);
        setSelectedMeteor(null);
    };

    const loadMeteorById = async () => {
        if (!meteorData.identifier) {
            setError("Please enter the meteor ID");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        setSearchResults([]);
        setSelectedMeteor(null);

        try {
            const response = await fetchApi(
                buildQueryUrl(API_ENDPOINTS.workflows.runPredefinedQuery, {
                    query: "getMeteorById",
                    meteorId: meteorData.identifier
                })
            );

            if (response.ok) {
                const meteorArray = await response.json();
                const meteor = meteorArray && meteorArray.length > 0 ? meteorArray[0] : null;

                if (meteor) {
                    setSelectedMeteor(meteor);
                    setMeteorData(prev => ({
                        ...prev,
                        date: meteor.Fecha ? meteor.Fecha.split("T")[0] : "",
                        startTime: meteor.Hora || "",
                        endTime: meteor.Hora || ""
                    }));
                    setSuccess(`Meteor loaded: ${formatDate(meteor.Fecha)} ${meteor.Hora}`);

                    // Notify parent component
                    if (onMeteorSelect) {
                        onMeteorSelect({
                            identifier: meteor.Identificador,
                            date: meteor.Fecha,
                            time: meteor.Hora,
                            observatory: meteorData.observatory
                        });
                    }
                } else {
                    setError("Meteor not found with that ID");
                }
            } else {
                setError("Error loading meteor");
            }
        } catch (error) {
            console.error("Error loading meteor:", error);
            setError("Connection error while loading meteor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meteor-input-container meteor-input-component">
            <h4>Contexto del meteoro</h4>
            <p className="description">Introduce los datos base del meteoro para alimentar automáticamente el resto de widgets del informe.</p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>ID de meteoro (opcional)</Form.Label>
                        <Form.Control
                            type="number"
                            value={meteorData.identifier}
                            onChange={e => handleInputChange("identifier", e.target.value)}
                            placeholder="Ej: 12345"
                        />
                        <Form.Text className="text-muted">Si conoces el identificador, puedes cargar el meteoro directamente</Form.Text>
                    </Col>
                    <Col md={6} className="d-flex align-items-end">
                        <Button
                            onClick={loadMeteorById}
                            disabled={loading || !meteorData.identifier}
                            className="w-100 widget-button"
                        >
                            Cargar por ID
                        </Button>
                    </Col>
                </Row>

                <div className="separator">
                    <span>O buscar por fecha y franja horaria</span>
                </div>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Label>Fecha de observación *</Form.Label>
                        <Form.Control
                            type="date"
                            value={meteorData.date}
                            onChange={e => handleInputChange("date", e.target.value)}
                            required
                        />
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>Hora inicial (opcional)</Form.Label>
                        <Form.Control
                            type="text"
                            value={meteorData.startTime}
                            onChange={e => handleInputChange("startTime", e.target.value)}
                            placeholder="Ej: 22:00:00 o 22h00m00s"
                        />
                        <Form.Text className="text-muted">Déjalo vacío para buscar desde el inicio del día</Form.Text>
                    </Col>
                    <Col md={6}>
                        <Form.Label>Hora final (opcional)</Form.Label>
                        <Form.Control
                            type="text"
                            value={meteorData.endTime}
                            onChange={e => handleInputChange("endTime", e.target.value)}
                            placeholder="Ej: 23:59:59 o 23h59m59s"
                        />
                        <Form.Text className="text-muted">Déjalo vacío para buscar hasta el final del día</Form.Text>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Label>Observatorio (opcional)</Form.Label>
                        <Form.Select
                            value={meteorData.observatory}
                            onChange={e => handleInputChange("observatory", e.target.value)}
                        >
                            <option value="">Todos los observatorios</option>
                            {observatories.map(obs => (
                                <option key={obs.Numero} value={obs.Numero}>
                                    {obs.Nombre_Observatorio} - {obs.Nombre_Camara}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted">Filtrar por observatorio ayuda a localizar el meteoro con más rapidez</Form.Text>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Button onClick={searchMeteorData} disabled={loading || !meteorData.date} className="w-100 widget-button">
                            {loading ? "Buscando..." : "Buscar meteoros"}
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button onClick={clearForm} disabled={loading} className="w-100 ms-2 widget-button-clear">
                            Limpiar
                        </Button>
                    </Col>
                </Row>
            </Form>

            {searchResults.length > 0 && (
                <Card className="mt-3">
                    <Card.Header>
                        <h5>Resultados ({searchResults.length} meteoros encontrados)</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup>
                            {searchResults.map(meteor => (
                                <ListGroup.Item
                                    key={meteor.Identificador}
                                    action
                                    onClick={() => selectMeteorFromList(meteor)}
                                    className={selectedMeteor?.Identificador === meteor.Identificador ? "active" : ""}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <strong>ID: {meteor.Identificador}</strong>
                                            <br />
                                            <small>Fecha: {formatDate(meteor.Fecha)}</small>
                                            <br />
                                            <small>Hora: {meteor.Hora}</small>
                                        </div>
                                        <div className="text-end">
                                            {meteor.Magnitud && <small>Magnitud: {meteor.Magnitud}</small>}
                                            {meteor.Duracion && (
                                                <small>
                                                    <br />
                                                    Duración: {meteor.Duracion}s
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            {selectedMeteor && (
                <div className="meteor-info">
                    <h5>Meteoro seleccionado</h5>
                    <p>
                        <strong>ID:</strong> {selectedMeteor.Identificador}
                    </p>
                    <p>
                        <strong>Fecha:</strong> {formatDate(selectedMeteor.Fecha)}
                    </p>
                    <p>
                        <strong>Hora:</strong> {selectedMeteor.Hora}
                    </p>
                    {selectedMeteor.Magnitud && (
                        <p>
                            <strong>Magnitud:</strong> {selectedMeteor.Magnitud}
                        </p>
                    )}
                    {selectedMeteor.Duracion && (
                        <p>
                            <strong>Duración:</strong> {selectedMeteor.Duracion}s
                        </p>
                    )}
                    {meteorData.observatory && (
                        <p>
                            <strong>Observatorio:</strong>{" "}
                            {observatories.find(o => o.Numero.toString() === meteorData.observatory)?.Nombre_Observatorio}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MeteorInput;
