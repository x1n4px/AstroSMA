import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import SearchMap from '../components/chart/SearchMap';
import { getAllBolide, getBolideWithCustomSearch } from '../services/bolideService'
import { TextureLoader } from 'three';

const CustomizedSearch = () => {
    const [heightFilter, setAlturaFilter] = useState('');
    const [latFilter, setLatFilter] = useState();
    const [lonFilter, setLonFilter] = useState();
    const [heightChecked, setAlturaChecked] = useState(false);
    const [latLonChecked, setLatLonChecked] = useState(false);
    const [ratioFilter, setRadioBusqueda] = useState();

    const [bolides, setBolides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchButton, setSearchButton] = useState(false);
    const [mapResetKey, setMapResetKey] = useState(0);
    /*
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllBolide();
                setBolides(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    */

    const handleApplyFilters = async () => {
        try {
            const response = await getBolideWithCustomSearch({
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked
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
            console.log("ratioFilter:", ratioFilter, "parsedRatio:", parsedRatio); // Depuración
    
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
                return 5; // Valor predeterminado si no es un número válido
            }
        } else {
            return 5; // Valor predeterminado si ratioFilter no está definido
        }
    };

    return (
        <Container className="my-4">
            <Card className="p-4 mb-4 shadow border-0">
                <Row className="mb-3">
                    <Col xs={12} md={12} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label="Altura"
                            checked={heightChecked} // Usar el estado booleano correcto
                            onChange={(e) => setAlturaChecked(e.target.checked)}
                            className="me-2"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Altura"
                            value={heightFilter}
                            onChange={(e) => setAlturaFilter(e.target.value)}
                            disabled={!heightChecked} // Deshabilitar si no está marcado
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={12} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label="Latitud/Longitud"
                            checked={latLonChecked} // Usar el estado booleano correcto
                            onChange={(e) => setLatLonChecked(e.target.checked)}
                            className="me-2"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Latitud"
                            value={latFilter}
                            onChange={(e) => setLatFilter(e.target.value)}
                            disabled={!latLonChecked} // Deshabilitar si no está marcado
                            className="me-2"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Longitud"
                            value={lonFilter}
                            onChange={(e) => setLonFilter(e.target.value)}
                            disabled={!latLonChecked} // Deshabilitar si no está marcado
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={12} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">Radio de búsqueda (km):</Form.Label>
                        <Form.Select
                            value={ratioFilter}
                            disabled={!latLonChecked} // Deshabilitar si no está marcado
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
                <Row>
                    <Col xs={12} md={4}>
                        <Button variant="primary" onClick={handleApplyFilters}>
                            Aplicar Filtros
                        </Button>
                    </Col>
                </Row>
            </Card>
            {searchButton &&
                <div className="mt-4 shadow rounded">

                    <h5 className="mb-3 fw-bold text-center pt-4" style={{ fontSize: '1.5em' }}>
                        Se han encontrado un total de {bolides.length} resultados
                    </h5>

                    <div className="p-3 rounded shadow-sm">
                        <SearchMap key={mapResetKey} data={bolides} zoom={getZoomLevel()} activePopUp={TextureLoader} ratioFilter={ratioFilter} lat={latFilter} lon={lonFilter} />
                    </div>
                </div>
            }
        </Container>
    );
}

export default CustomizedSearch;