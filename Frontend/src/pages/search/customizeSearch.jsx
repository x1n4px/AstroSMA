import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion } from 'react-bootstrap';
import { getReportzWithCustomSearch } from '@/services/reportService.jsx';
import { TextureLoader } from 'three';
import { Link } from 'react-router-dom';


// Internationalization
import { useTranslation } from 'react-i18next';


const dummyBolides = [
    {
        id: 1,
        name: 'Bolide A',
        date: '2023-01-15',
        additionalData: {
            velocity: '25 km/s',
            altitude: '80 km',
            location: '40.7128° N, 74.0060° W',
        },
    },
    {
        id: '2',
        name: 'Bolide B',
        date: '2023-02-20',
        additionalData: {
            velocity: '30 km/s',
            altitude: '90 km',
            location: '34.0522° N, 118.2437° W',
        },
    },
    {
        id: '3',
        name: 'Bolide C',
        date: '2023-03-25',
        additionalData: {
            velocity: '28 km/s',
            altitude: '85 km',
            location: '51.5074° N, 0.1278° W',
        },
    },
    {
        id: '4',
        name: 'Bolide D',
        date: '2023-04-30',
        additionalData: {
            velocity: '32 km/s',
            altitude: '95 km',
            location: '48.8566° N, 2.3522° E',
        },
    },
    {
        id: '5',
        name: 'Bolide E',
        date: '2023-05-05',
        additionalData: {
            velocity: '27 km/s',
            altitude: '82 km',
            location: '35.6895° N, 139.6917° E',
        },
    },
];

const CustomizeSearch = () => {
    const { t } = useTranslation(['text']);
    const [heightFilter, setAlturaFilter] = useState('');
    const [latFilter, setLatFilter] = useState();
    const [lonFilter, setLonFilter] = useState();
    const [heightChecked, setAlturaChecked] = useState(false);
    const [latLonChecked, setLatLonChecked] = useState(false);
    const [ratioFilter, setRadioBusqueda] = useState();
    const [dateRangeChecked, setDateRangeChecked] = useState(false);
    const [startDate, setStartDate] = useState(getYearAgoDate());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState([]);
    const [bolides, setBolides] = useState([]);
    const [searchButton, setSearchButton] = useState(false);
    const [mapResetKey, setMapResetKey] = useState(0);
    const [actualPage, setActualPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 50;

    const handleApplyFilters = async () => {
        try {
            const response = await getReportzWithCustomSearch({
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
                actualPage
            });
            setReportData(response.reports);
            setTotalItems(response.count[0].c);
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

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

    const handlePageChange = (page) => {
        setActualPage(page);
        handleApplyFilters();
    };

    const handlePrevPage = () => {
        if (actualPage > 0) {
            setActualPage(actualPage - 1);
            handleApplyFilters();
        }
    };

    const handleNextPage = () => {
        if (actualPage < totalPages - 1) {
            setActualPage(actualPage + 1);
            handleApplyFilters();
        }
    };

    return (
        <Container className="my-4">

            <Card className="p-4 mb-4 shadow border-0">
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.HEIGHT')}
                            checked={heightChecked}
                            onChange={(e) => setAlturaChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder={t('CUSTOMIZE_SEARCH.HEIGHT')}
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
                            label={t('CUSTOMIZE_SEARCH.LATLON')}
                            checked={latLonChecked}
                            onChange={(e) => setLatLonChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder={t('CUSTOMIZE_SEARCH.LATITUDE')}
                            value={latFilter}
                            onChange={(e) => setLatFilter(e.target.value)}
                            disabled={!latLonChecked}
                            className="me-2"
                        />
                        <Form.Control
                            type="text"
                            placeholder={t('CUSTOMIZE_SEARCH.LONGITUDE')}
                            value={lonFilter}
                            onChange={(e) => setLonFilter(e.target.value)}
                            disabled={!latLonChecked}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">{t('CUSTOMIZE_SEARCH.SEARCH_RADIUS')} (km):</Form.Label>
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
                            label={t('CUSTOMIZE_SEARCH.RANGE_DATE')}
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
                        <Button style={{ backgroundColor: '#980100', borderColor: '#980100' }} onClick={handleApplyFilters}>
                            {t('CUSTOMIZE_SEARCH.SEARCH_BTN')}
                        </Button>
                    </Col>
                </Row>
            </Card>
            {searchButton && (
                <div className="mt-4 shadow rounded">
                    <h5 className="mb-3 fw-bold text-center pt-4" style={{ fontSize: '1.5em' }}>
                        Se han encontrado un total de {totalItems} resultados
                    </h5>
                    <div className="p-3 rounded shadow-sm">
                        <Accordion defaultActiveKey="0">
                            {reportData.map((report, index) => (
                                <Accordion.Item eventKey={index.toString()} key={report.IdInforme}>
                                    <Accordion.Header>
                                        {`ID: ${report.IdInforme} - Date: ${report.Fecha.substring(0, 10)}`}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Button style={{ backgroundColor: '#980100', borderColor: '#980100' }} action as={Link} to={`/report/${report.IdInforme}`}>Ver más</Button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>

                    <nav aria-label="Page navigation example ">
                        <ul className="pagination justify-content-center py-4">
                            <li className={`page-item ${actualPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handlePrevPage}>Previous</button>
                            </li>
                            {pageNumbers.map((page) => (
                                <li className={`page-item ${actualPage === page ? 'active' : ''}`} key={page}>
                                    <button className="page-link" onClick={() => handlePageChange(page)}>{page + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${actualPage === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handleNextPage}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </Container>
    );
};

export default CustomizeSearch;
