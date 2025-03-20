import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import SearchMap from '../components/chart/SearchMap';
import { getBolideWithCustomSearch } from '../services/bolideService';
import { TextureLoader } from 'three';

const CustomizedSearch = () => {
    const [heightFilter, setAlturaFilter] = useState('');
    const [latFilter, setLatFilter] = useState();
    const [lonFilter, setLonFilter] = useState();
    const [heightChecked, setAlturaChecked] = useState(false);
    const [latLonChecked, setLatLonChecked] = useState(false);
    const [ratioFilter, setRadioBusqueda] = useState();
    const [dateRangeChecked, setDateRangeChecked] = useState(false);
    const [startDate, setStartDate] = useState(getYearAgoDate());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [bolides, setBolides] = useState([]);
    const [searchButton, setSearchButton] = useState(false);
    const [mapResetKey, setMapResetKey] = useState(0);

    const handleApplyFilters = async () => {
        try {
            const response = await getBolideWithCustomSearch({
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
            });
            setBolides(response);
            setSearchButton(true);
            setMapResetKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error('Error al aplicar los filtros:', error);
        }
    };

    const getZoomLevel = () => {
        if (ratioFilter) {
            const parsedRatio = parseInt(ratioFilter);
            if (!isNaN(parsedRatio)) {
                if (parsedRatio > 0 && parsedRatio < 50) {
                    return 10;
                } else if (parsedRatio >= 50 && parsedRatio <= 100) {
                    return 8;
                } else if (parsedRatio > 100 && parsedRatio <= 250) {
                    return 7;
                } else if (parsedRatio > 250 && parsedRatio <= 500) {
                    return 6;
                } else {
                    return 5;
                }
            } else {
                return 5;
            }
        } else {
            return 5;
        }
    };

    function getYearAgoDate() {
        const today = new Date();
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return yearAgo.toISOString().split('T')[0];
    }

    return (
        <Container className="my-4">
            <Card className="p-4 mb-4 shadow border-0">
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label="Altura"
                            checked={heightChecked}
                            onChange={(e) => setAlturaChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Altura"
                            value={heightFilter}
                            onChange={(e) => setAlturaFilter(e.target.value)}
                            disabled={!heightChecked}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label="Latitud/Longitud"
                            checked={latLonChecked}
                            onChange={(e) => setLatLonChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Latitud"
                            value={latFilter}
                            onChange={(e) => setLatFilter(e.target.value)}
                            disabled={!latLonChecked}
                            className="me-2"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Longitud"
                            value={lonFilter}
                            onChange={(e) => setLonFilter(e.target.value)}
                            disabled={!latLonChecked}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">Radio de búsqueda (km):</Form.Label>
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Select
                            value={ratioFilter}
                            disabled={!latLonChecked}
                            onChange={(e) => setRadioBusqueda(e.target.value)}
                        >
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                            <option value="30">30 km</option>
                            <option value="50">50 km</option>
                            <option value="100">100 km</option>
                            <option value="200">200 km</option>
                            <option value="500">500 km</option>
                            <option value="1000">1000 km</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center"> {/* Aumenta el ancho de la columna */}
                        <Form.Check
                            type="checkbox"
                            label="Rango de Fechas"
                            checked={dateRangeChecked}
                            onChange={(e) => setDateRangeChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center"> {/* Columna para los inputs */}
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={!dateRangeChecked}
                            className="me-2"
                        />
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={!dateRangeChecked}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <Button variant="primary" onClick={handleApplyFilters}>
                            Aplicar Filtros
                        </Button>
                    </Col>
                </Row>
            </Card>
            {searchButton && (
                <div className="mt-4 shadow rounded">
                    <h5 className="mb-3 fw-bold text-center pt-4" style={{ fontSize: '1.5em' }}>
                        Se han encontrado un total de {bolides.length} resultados
                    </h5>
                    <div className="p-3 rounded shadow-sm">
                        <SearchMap
                            key={mapResetKey}
                            data={bolides}
                            zoom={getZoomLevel()}
                            activePopUp={TextureLoader}
                            ratioFilter={ratioFilter}
                            lat={latFilter}
                            lon={lonFilter}
                            latLonChecked={latLonChecked}
                        />
                    </div>
                </div>
            )}
        </Container>
    );
};

export default CustomizedSearch;