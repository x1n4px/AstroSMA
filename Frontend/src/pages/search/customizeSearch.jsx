import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion } from 'react-bootstrap';
import { getBolideWithCustomSearch } from '@/services/bolideService.jsx';
import { TextureLoader } from 'three';
import { Link } from 'react-router-dom';
import { formatDate } from '@/pipe/formatDate.jsx'
import CustomizeSearchModal from '@/components/modal/CustomizeSearchModal.jsx';
import CheckIcon from '@/assets/icon/check';
import CrossIcon from '@/assets/icon/cross';


// Internationalization
import { useTranslation } from 'react-i18next';



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
    const [reportType, setReportType] = useState('1'); // Estado para el tipo de informe
    const itemsPerPage = 50;

    const [modalReport, setModalReport] = useState(null); // Estado para el informe del modal
    const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal


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
                actualPage,
                reportType
            });
            console.log(response)
            setReportData(response.data);
            setTotalItems(response.totalItems);
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

    const handleShowModal = (report) => {
        setModalReport(report);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <Container className="my-4">

            <Card className="p-4 mb-4 shadow border-0">
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.TITLE')} :</Form.Label>
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Select
                            value={ratioFilter}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="1" >{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.ALL_TYPES')}</option>
                            <option value="2">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_Z')}</option>
                            <option value="3">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_RADIANT')}</option>
                            <option value="4">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_PHOTOMETRY')}</option>
                        </Form.Select>
                    </Col>
                </Row>
                {reportType === '2' && (
                    <Row className="mb-3">
                        <Col xs={12} md={3} className="d-flex align-items-center">
                            <Form.Check
                                type="checkbox"
                                label={t('CUSTOMIZE_SEARCH.HEIGHT')}
                                checked={heightChecked}
                                onChange={(e) => {
                                    setAlturaChecked(e.target.checked);
                                    setAlturaFilter('');
                                }}
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
                )}
                {reportType === '2' && (
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
                )}
                {reportType === '2' && (
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
                )}
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center"> {/* Aumenta el ancho de la columna */}
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.RANGE_DATE')}
                            checked={dateRangeChecked}
                            onChange={(e) => {
                                setDateRangeChecked(e.target.checked)
                            }}
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

                        <Button variant="secondary" className="ms-2" onClick={() => {
                            setAlturaChecked(false);
                            setLatLonChecked(false);
                            setDateRangeChecked(false);
                            setAlturaFilter('');
                            setLatFilter('');
                            setLonFilter('');
                            setRadioBusqueda('');
                            setStartDate(getYearAgoDate());
                            setEndDate(new Date().toISOString().split('T')[0]);
                            setSearchButton(false);
                            setActualPage(0);
                        }
                        }>
                            {t('CUSTOMIZE_SEARCH.CLEAR_BTN')}
                        </Button>
                    </Col>
                </Row>
            </Card>
            {searchButton && (
                <div className="mt-4 shadow rounded">
                    {/* <h5 className="mb-3 fw-bold text-center pt-4" style={{ fontSize: '1.5em' }}>
                        Se han encontrado un total de {reportData.length} resultados
                    </h5> */}
                    <div className="p-3 rounded shadow-sm mt-4">
                        <ul className="list-group">
                            {reportData.map((report, index) => (
                                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" key={report.IdInforme}>
                                    <div>
                                        <strong>{formatDate(report.Fecha)} {report.Hora.substring(0, 8)}</strong>
                                    </div>
                                    <div className="d-inline-flex gap-3">
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_Z')}: {report.hasReportZ ? <CheckIcon /> : <CrossIcon />}</div>
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_RADIANT')}: {report.hasReportRadiant ? <CheckIcon /> : <CrossIcon />} </div>
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_PHOTOMETRY')}: {report.hasReportPhotometry ? <CheckIcon /> : <CrossIcon />}</div>
                                    </div>
                                    <div>
                                        <Button style={{ backgroundColor: '#980100', borderColor: '#980100', marginTop: '5px' }} onClick={() => handleShowModal(report)}>
                                            {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <CustomizeSearchModal report={modalReport} show={showModal} onHide={handleCloseModal} />


                    <nav aria-label="Page navigation example">
                        <ul className="pagination justify-content-center py-4">
                            {/* Botón "Previous" */}
                            <li className={`page-item ${actualPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handlePrevPage}>
                                    Previous
                                </button>
                            </li>

                            {/* Mostrar solo 10 páginas a la vez */}
                            {(() => {
                                const visiblePages = 10; // Número máximo de páginas visibles
                                const halfVisible = Math.floor(visiblePages / 2); // Mitad de las páginas visibles

                                // Calcular el rango de páginas a mostrar
                                let startPage = Math.max(0, actualPage - halfVisible);
                                let endPage = Math.min(totalPages - 1, actualPage + halfVisible);

                                // Ajustar el rango si estamos cerca de los extremos
                                if (actualPage < halfVisible) {
                                    endPage = Math.min(visiblePages - 1, totalPages - 1);
                                } else if (actualPage > totalPages - halfVisible - 1) {
                                    startPage = Math.max(totalPages - visiblePages, 0);
                                }

                                // Generar los números de página visibles
                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <li
                                            className={`page-item ${actualPage === i ? 'active' : ''}`}
                                            key={i}
                                        >
                                            <button className="page-link" onClick={() => handlePageChange(i)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    );
                                }

                                return pages;
                            })()}

                            {/* Botón "Next" */}
                            <li className={`page-item ${actualPage === totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handleNextPage}>
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </Container>
    );
};

export default CustomizeSearch;
