import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { getBolideWithCustomSearch } from '@/services/bolideService.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import CustomizeSearchModal from '@/components/modal/CustomizeSearchModal.jsx';
import CheckIcon from '@/assets/icon/check';
import CrossIcon from '@/assets/icon/cross';
import { createRequest } from '@/services/requestService.jsx';
import DownloadConfirmModal from '@/components/modal/DownloadConfirmModal.jsx';
import { useTranslation } from 'react-i18next';
import { isNotQRUser } from '../../utils/roleMaskUtils';
import { getStations } from '@/services/stationService.jsx';
import { getAllShower } from '@/services/activeShower.jsx';

const getYearAgoDate = () => {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);
    return yearAgo.toISOString().split('T')[0];
};

const CustomizeSearch = () => {
    const { t } = useTranslation(['text']);

    const [heightFilter, setAlturaFilter] = useState('');
    const [latFilter, setLatFilter] = useState('');
    const [lonFilter, setLonFilter] = useState('');
    const [heightChecked, setAlturaChecked] = useState(false);
    const [latLonChecked, setLatLonChecked] = useState(false);
    const [ratioFilter, setRadioBusqueda] = useState('');
    const [dateRangeChecked, setDateRangeChecked] = useState(false);
    const [startDate, setStartDate] = useState(getYearAgoDate());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [meteorIdFilter, setMeteorIdFilter] = useState('');
    const [observatoryFilter, setObservatoryFilter] = useState('');
    const [showerFilter, setShowerFilter] = useState('');
    const [minVelocityFilter, setMinVelocityFilter] = useState('');
    const [maxVelocityFilter, setMaxVelocityFilter] = useState('');
    const [requireReportZ, setRequireReportZ] = useState(false);
    const [requireReportRadiant, setRequireReportRadiant] = useState(false);
    const [requireReportPhotometry, setRequireReportPhotometry] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');
    const [minMagMaxFilter, setMinMagMaxFilter] = useState('');
    const [maxMagMaxFilter, setMaxMagMaxFilter] = useState('');
    const [minMassFilter, setMinMassFilter] = useState('');
    const [maxMassFilter, setMaxMassFilter] = useState('');

    const [reportData, setReportData] = useState([]);
    const [searchButton, setSearchButton] = useState(false);
    const [actualPage, setActualPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [reportType, setReportType] = useState('1');
    const itemsPerPage = 50;

    const roleMask = localStorage.getItem('rol');
    const [modalReport, setModalReport] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
    const [stations, setStations] = useState([]);
    const [showers, setShowers] = useState([]);
    const isPhotometryReportType = reportType === '4';

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [stationsData, showersData] = await Promise.all([
                    getStations(),
                    getAllShower()
                ]);

                const uniqueShowers = Array.isArray(showersData?.shower)
                    ? Array.from(
                        new Map(showersData.shower.map((shower) => [shower.Identificador, shower])).values()
                    )
                    : [];

                setStations(Array.isArray(stationsData) ? stationsData : []);
                setShowers(uniqueShowers);
            } catch (error) {
                console.error('Error loading custom search catalogs:', error);
            }
        };

        fetchCatalogs();
    }, []);

    const handleReportTypeChange = (value) => {
        setReportType(value);
        if (value !== '4') {
            setMinMagMaxFilter('');
            setMaxMagMaxFilter('');
            setMinMassFilter('');
            setMaxMassFilter('');
        }
    };

    const formatDecimal = (value, decimals = 2) => {
        if (value === null || value === undefined || value === '') return '';
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue.toFixed(decimals) : value;
    };

    const handleApplyFilters = async (page = 0) => {
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
                actualPage: page,
                reportType,
                meteorIdFilter,
                observatoryFilter,
                showerFilter,
                minVelocityFilter,
                maxVelocityFilter,
                requireReportZ,
                requireReportRadiant,
                requireReportPhotometry,
                sortOrder,
                timeFrom,
                timeTo,
                minMagMaxFilter,
                maxMagMaxFilter,
                minMassFilter,
                maxMassFilter
            });

            setReportData(response.data || []);
            setTotalItems(response.totalItems || 0);
            setActualPage(page);
            setSearchButton(true);
        } catch (error) {
            console.error('Error al aplicar los filtros:', error);
        }
    };

    const handleApplyFiltersCSV = async (description) => {
        try {
            const autoFiltersSummary = {
                reportType,
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                dateRangeChecked,
                startDate,
                endDate,
                meteorIdFilter,
                observatoryFilter,
                showerFilter,
                minVelocityFilter,
                maxVelocityFilter,
                requireReportZ,
                requireReportRadiant,
                requireReportPhotometry,
                sortOrder,
                timeFrom,
                timeTo,
                minMagMaxFilter,
                maxMagMaxFilter,
                minMassFilter,
                maxMassFilter
            };

            const requestBody = {
                height: heightFilter || null,
                latitude: latFilter || null,
                longitude: lonFilter || null,
                ratio: ratioFilter || null,
                from_date: startDate,
                to_date: endDate,
                report_type: reportType,
                description: `${description || ''}\n\n[FILTROS_AVANZADOS]\n${JSON.stringify(autoFiltersSummary)}`
            };

            await createRequest(requestBody);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };

    const handleCSV = () => {
        setShowDownloadConfirmModal(true);
    };

    const handleConfirmDownload = (description) => {
        setShowDownloadConfirmModal(false);
        handleApplyFiltersCSV(description);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page) => {
        handleApplyFilters(page);
    };

    const handlePrevPage = () => {
        if (actualPage > 0) {
            handleApplyFilters(actualPage - 1);
        }
    };

    const handleNextPage = () => {
        if (actualPage < totalPages - 1) {
            handleApplyFilters(actualPage + 1);
        }
    };

    const handleShowModal = (report) => {
        setModalReport(report);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleClear = () => {
        setAlturaChecked(false);
        setLatLonChecked(false);
        setDateRangeChecked(false);
        setAlturaFilter('');
        setLatFilter('');
        setLonFilter('');
        setRadioBusqueda('');
        setStartDate(getYearAgoDate());
        setEndDate(new Date().toISOString().split('T')[0]);

        setMeteorIdFilter('');
        setObservatoryFilter('');
        setShowerFilter('');
        setMinVelocityFilter('');
        setMaxVelocityFilter('');
        setRequireReportZ(false);
        setRequireReportRadiant(false);
        setRequireReportPhotometry(false);
        setSortOrder('desc');
        setTimeFrom('');
        setTimeTo('');
        setMinMagMaxFilter('');
        setMaxMagMaxFilter('');
        setMinMassFilter('');
        setMaxMassFilter('');

        setReportType('1');
        setSearchButton(false);
        setActualPage(0);
        setTotalItems(0);
        setReportData([]);
    };

    return (
        <Container className="my-4">
            <Card className="p-4 mb-4 shadow border-0">
                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.TITLE')} :</Form.Label>
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center">
                        <Form.Select value={reportType} onChange={(e) => handleReportTypeChange(e.target.value)}>
                            <option value="1">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.ALL_TYPES')}</option>
                            <option value="2">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_Z')}</option>
                            <option value="3">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_RADIANT')}</option>
                            <option value="4">{t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_PHOTOMETRY')}</option>
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Label className="me-2 mb-0">{t('CUSTOMIZE_SEARCH.SORT.TITLE')}</Form.Label>
                    </Col>
                    <Col xs={12} md={9}>
                        <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">{t('CUSTOMIZE_SEARCH.SORT.DESC')}</option>
                            <option value="asc">{t('CUSTOMIZE_SEARCH.SORT.ASC')}</option>
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
                                    if (!e.target.checked) {
                                        setAlturaFilter('');
                                    }
                                }}
                                className="me-2"
                            />
                        </Col>
                        <Col xs={12} md={9} className="d-flex align-items-center">
                            <Form.Control
                                type="number"
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
                        <Col xs={12} md={9} className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="number"
                                step="any"
                                placeholder={t('CUSTOMIZE_SEARCH.LATITUDE')}
                                value={latFilter}
                                onChange={(e) => setLatFilter(e.target.value)}
                                disabled={!latLonChecked}
                            />
                            <Form.Control
                                type="number"
                                step="any"
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
                                <option value="">{t('CUSTOMIZE_SEARCH.SELECT_OPTIONAL')}</option>
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
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.RANGE_DATE')}
                            checked={dateRangeChecked}
                            onChange={(e) => setDateRangeChecked(e.target.checked)}
                            className="me-2"
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex align-items-center gap-2">
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={!dateRangeChecked}
                        />
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={!dateRangeChecked}
                        />
                    </Col>
                </Row>

                <hr />

                <Row className="mb-3">
                    <Col xs={12}>
                        <h6 className="mb-2">{t('CUSTOMIZE_SEARCH.ADVANCED.TITLE')}</h6>
                    </Col>
                    <Col xs={12} md={4} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.METEOR_ID')}</Form.Label>
                        <Form.Control
                            type="number"
                            value={meteorIdFilter}
                            onChange={(e) => setMeteorIdFilter(e.target.value)}
                            placeholder={t('CUSTOMIZE_SEARCH.ADVANCED.METEOR_ID')}
                        />
                    </Col>
                    <Col xs={12} md={4} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.OBSERVATORY')}</Form.Label>
                        <Form.Select
                            value={observatoryFilter}
                            onChange={(e) => setObservatoryFilter(e.target.value)}
                        >
                            <option value="">{t('CUSTOMIZE_SEARCH.SELECT_OPTIONAL')}</option>
                            {stations.map((station) => (
                                <option key={station.id} value={station.id}>
                                    {station.id} - {station.stationName || station.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.SHOWER')}</Form.Label>
                        <Form.Select
                            value={showerFilter}
                            onChange={(e) => setShowerFilter(e.target.value)}
                        >
                            <option value="">{t('CUSTOMIZE_SEARCH.SELECT_OPTIONAL')}</option>
                            {showers.map((shower) => (
                                <option key={`${shower.Identificador}-${shower.Año || shower.Nombre}`} value={shower.Identificador}>
                                    {shower.Identificador} - {shower.Nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col xs={12} md={6} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.TIME_FROM')}</Form.Label>
                        <Form.Control
                            type="time"
                            value={timeFrom}
                            onChange={(e) => setTimeFrom(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={6} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.TIME_TO')}</Form.Label>
                        <Form.Control
                            type="time"
                            value={timeTo}
                            onChange={(e) => setTimeTo(e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col xs={12} md={6} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MIN_VELOCITY')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={minVelocityFilter}
                            onChange={(e) => setMinVelocityFilter(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={6} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MAX_VELOCITY')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={maxVelocityFilter}
                            onChange={(e) => setMaxVelocityFilter(e.target.value)}
                        />
                    </Col>
                </Row>

                {isPhotometryReportType && (
                <Row className="mb-3">
                    <Col xs={12} md={3} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MIN_MAG_MAX')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={minMagMaxFilter}
                            onChange={(e) => setMinMagMaxFilter(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={3} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MAX_MAG_MAX')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={maxMagMaxFilter}
                            onChange={(e) => setMaxMagMaxFilter(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={3} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MIN_MASS')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={minMassFilter}
                            onChange={(e) => setMinMassFilter(e.target.value)}
                        />
                    </Col>
                    <Col xs={12} md={3} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.MAX_MASS')}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={maxMassFilter}
                            onChange={(e) => setMaxMassFilter(e.target.value)}
                        />
                    </Col>
                </Row>
                )}

                <Row className="mb-3">
                    <Col xs={12} className="d-flex flex-wrap gap-3">
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.ADVANCED.REQUIRE_Z')}
                            checked={requireReportZ}
                            onChange={(e) => setRequireReportZ(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.ADVANCED.REQUIRE_RADIANT')}
                            checked={requireReportRadiant}
                            onChange={(e) => setRequireReportRadiant(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.ADVANCED.REQUIRE_PHOTOMETRY')}
                            checked={requireReportPhotometry}
                            onChange={(e) => setRequireReportPhotometry(e.target.checked)}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} md={9}>
                        <Button
                            style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                            onClick={() => handleApplyFilters(0)}
                        >
                            {t('CUSTOMIZE_SEARCH.SEARCH_BTN')}
                        </Button>

                        <Button variant="secondary" className="ms-2" onClick={handleClear}>
                            {t('CUSTOMIZE_SEARCH.CLEAR_BTN')}
                        </Button>

                        {isNotQRUser(roleMask) && reportData.length > 0 && (
                            <Button
                                style={{ backgroundColor: '#28a745', borderColor: '#28a745', marginLeft: '10px' }}
                                onClick={handleCSV}
                            >
                                {t('CUSTOMIZE_SEARCH.DOWNLOAD_CSV')}
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card>

            {searchButton && (
                <div className="mt-4 shadow rounded">
                    <div className="p-3 rounded shadow-sm mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                            <h6 className="mb-0">{t('CUSTOMIZE_SEARCH.RESULTS_TITLE')}</h6>
                            <Badge bg="secondary">
                                {t('CUSTOMIZE_SEARCH.RESULTS_COUNT', { count: totalItems })}
                            </Badge>
                        </div>

                        <ul className="list-group">
                            {reportData.map((report, index) => (
                                <li
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                    key={report.IdInforme || report.Identificador || index}
                                >
                                    <div>
                                        <strong>
                                            #{report.Identificador} · {formatDate(report.Fecha)} {report.Hora?.substring(0, 8)}
                                        </strong>
                                        <div className="small text-muted">
                                            {report.velocidadMedia != null && `${t('CUSTOMIZE_SEARCH.ADVANCED.MIN_VELOCITY')}: ${report.velocidadMedia} km/s`}
                                            {report.magMax != null ? ` · ${t('CUSTOMIZE_SEARCH.RESULT_FIELDS.MAG_MAX')}: ${formatDecimal(report.magMax)}` : ''}
                                            {report.masaFotometrica != null ? ` · ${t('CUSTOMIZE_SEARCH.RESULT_FIELDS.PHOTOMETRIC_MASS')}: ${report.masaFotometrica}` : ''}
                                            {report.lluviasAsociadas ? ` · ${t('CUSTOMIZE_SEARCH.ADVANCED.SHOWER')}: ${report.lluviasAsociadas}` : ''}
                                        </div>
                                    </div>
                                    <div className="d-inline-flex gap-3">
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_Z')}: {report.hasReportZ ? <CheckIcon /> : <CrossIcon />}</div>
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_RADIANT')}: {report.hasReportRadiant ? <CheckIcon /> : <CrossIcon />}</div>
                                        <div>{t('CUSTOMIZE_SEARCH.REPORT_PHOTOMETRY')}: {report.hasReportPhotometry ? <CheckIcon /> : <CrossIcon />}</div>
                                    </div>
                                    <div>
                                        <Button
                                            style={{ backgroundColor: '#980100', borderColor: '#980100', marginTop: '5px' }}
                                            onClick={() => handleShowModal(report)}
                                        >
                                            {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <CustomizeSearchModal report={modalReport} show={showModal} onHide={handleCloseModal} />

                    <DownloadConfirmModal
                        show={showDownloadConfirmModal}
                        onHide={() => setShowDownloadConfirmModal(false)}
                        onConfirm={handleConfirmDownload}
                    />

                    <nav aria-label={t('CUSTOMIZE_SEARCH.PAGINATION.ARIA_LABEL')}>
                        <ul className="pagination justify-content-center py-4">
                            <li className={`page-item ${actualPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handlePrevPage}>
                                    {t('CUSTOMIZE_SEARCH.PAGINATION.PREVIOUS')}
                                </button>
                            </li>

                            {(() => {
                                const visiblePages = 10;
                                const halfVisible = Math.floor(visiblePages / 2);

                                let startPage = Math.max(0, actualPage - halfVisible);
                                let endPage = Math.min(totalPages - 1, actualPage + halfVisible);

                                if (actualPage < halfVisible) {
                                    endPage = Math.min(visiblePages - 1, totalPages - 1);
                                } else if (actualPage > totalPages - halfVisible - 1) {
                                    startPage = Math.max(totalPages - visiblePages, 0);
                                }

                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <li className={`page-item ${actualPage === i ? 'active' : ''}`} key={i}>
                                            <button className="page-link" onClick={() => handlePageChange(i)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    );
                                }

                                return pages;
                            })()}

                            <li className={`page-item ${actualPage === totalPages - 1 || totalPages === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handleNextPage}>
                                    {t('CUSTOMIZE_SEARCH.PAGINATION.NEXT')}
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
