import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import {
    CalendarDays,
    CheckCircle2,
    Download,
    Eye,
    FileSearch,
    Gauge,
    MapPin,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Sparkles,
    Telescope,
    XCircle
} from 'lucide-react';
import { getBolideWithCustomSearch, getCustomSearchCatalogs } from '@/services/bolideService.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import CustomizeSearchModal from '@/components/modal/CustomizeSearchModal.jsx';
import { createRequest } from '@/services/requestService.jsx';
import DownloadConfirmModal from '@/components/modal/DownloadConfirmModal.jsx';
import { useTranslation } from 'react-i18next';
import { isNotQRUser } from '../../utils/roleMaskUtils';
import './customizeSearch.css';

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
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const isPhotometryReportType = reportType === '4';
    const isTwoStationReportType = reportType === '2';
    const supportsObservatoryAndShower = reportType === '2' || reportType === '3';
    const isAllReportTypes = reportType === '1';

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                setCatalogLoading(true);
                setCatalogError(false);
                const catalogs = await getCustomSearchCatalogs();
                setStations(Array.isArray(catalogs?.observatories) ? catalogs.observatories : []);
                setShowers(Array.isArray(catalogs?.showers) ? catalogs.showers : []);
            } catch (error) {
                console.error('Error loading custom search catalogs:', error);
                setCatalogError(true);
            } finally {
                setCatalogLoading(false);
            }
        };

        fetchCatalogs();
    }, []);

    const handleReportTypeChange = (value) => {
        setReportType(value);

        if (value !== '2') {
            setAlturaChecked(false);
            setAlturaFilter('');
            setLatLonChecked(false);
            setLatFilter('');
            setLonFilter('');
            setRadioBusqueda('');
            setMinVelocityFilter('');
            setMaxVelocityFilter('');
        }

        if (value !== '2' && value !== '3') {
            setObservatoryFilter('');
            setShowerFilter('');
        }

        if (value !== '4') {
            setMinMagMaxFilter('');
            setMaxMagMaxFilter('');
            setMinMassFilter('');
            setMaxMassFilter('');
        }

        if (value !== '1') {
            setRequireReportZ(false);
            setRequireReportRadiant(false);
            setRequireReportPhotometry(false);
        }
    };

    const formatDecimal = (value, decimals = 2) => {
        if (value === null || value === undefined || value === '') return '';
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue.toFixed(decimals) : value;
    };

    const handleApplyFilters = async (page = 0) => {
        try {
            setIsSearching(true);
            setSearchError(false);
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
            setSearchError(true);
            setSearchButton(true);
        } finally {
            setIsSearching(false);
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
        setSearchError(false);
    };

    return (
        <div className="custom-search-page">
        <Container className="custom-search-shell">
            <header className="custom-search-hero">
                <div className="custom-search-hero__icon" aria-hidden="true">
                    <FileSearch size={30} />
                </div>
                <div>
                    <span className="custom-search-eyebrow">{t('CUSTOMIZE_SEARCH.EYEBROW')}</span>
                    <h1>{t('CUSTOMIZE_SEARCH.TITLE')}</h1>
                    <p>{t('CUSTOMIZE_SEARCH.DESCRIPTION')}</p>
                </div>
            </header>

            <Card className="custom-search-panel">
                <Card.Body>
                <div className="custom-search-section-heading">
                    <div className="custom-search-section-heading__icon"><SlidersHorizontal size={19} /></div>
                    <div>
                        <h2>{t('CUSTOMIZE_SEARCH.SECTIONS.CONFIGURATION')}</h2>
                        <p>{t('CUSTOMIZE_SEARCH.SECTIONS.CONFIGURATION_HELP')}</p>
                    </div>
                </div>

                <Row className="g-3 mb-4">
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

                <Row className="g-3 mb-4">
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

                <div className="custom-search-divider" />
                <div className="custom-search-section-heading custom-search-section-heading--compact">
                    <div className="custom-search-section-heading__icon"><CalendarDays size={19} /></div>
                    <div>
                        <h2>{t('CUSTOMIZE_SEARCH.SECTIONS.PERIOD')}</h2>
                        <p>{t('CUSTOMIZE_SEARCH.SECTIONS.PERIOD_HELP')}</p>
                    </div>
                </div>

                <Row className="g-3 mb-4">
                    <Col xs={12} md={3} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            label={t('CUSTOMIZE_SEARCH.RANGE_DATE')}
                            checked={dateRangeChecked}
                            onChange={(e) => setDateRangeChecked(e.target.checked)}
                        />
                    </Col>
                    <Col xs={12} md={9} className="d-flex flex-column flex-sm-row align-items-stretch gap-2">
                        <Form.Group className="flex-fill">
                            <Form.Label className="visually-hidden">{t('CUSTOMIZE_SEARCH.DATE_FROM')}</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!dateRangeChecked} />
                        </Form.Group>
                        <span className="custom-search-range-separator">{t('CUSTOMIZE_SEARCH.RANGE_SEPARATOR')}</span>
                        <Form.Group className="flex-fill">
                            <Form.Label className="visually-hidden">{t('CUSTOMIZE_SEARCH.DATE_TO')}</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!dateRangeChecked} />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.TIME_FROM')}</Form.Label>
                        <Form.Control type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.TIME_TO')}</Form.Label>
                        <Form.Control type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
                    </Col>
                </Row>

                <div className="custom-search-divider" />
                <div className="custom-search-section-heading custom-search-section-heading--compact">
                    <div className="custom-search-section-heading__icon">
                        {isPhotometryReportType ? <Sparkles size={19} /> : isTwoStationReportType ? <Telescope size={19} /> : <Gauge size={19} />}
                    </div>
                    <div>
                        <h2>{t('CUSTOMIZE_SEARCH.ADVANCED.TITLE')}</h2>
                        <p>{t(`CUSTOMIZE_SEARCH.REPORT_TYPE.HELP.${reportType}`)}</p>
                    </div>
                </div>

                {catalogError && supportsObservatoryAndShower && (
                    <Alert variant="warning" className="custom-search-alert">
                        {t('CUSTOMIZE_SEARCH.CATALOG_ERROR')}
                    </Alert>
                )}

                {isTwoStationReportType && (
                    <Row className="g-3 mb-3">
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

                {isTwoStationReportType && (
                    <Row className="g-3 mb-3">
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

                {isTwoStationReportType && (
                    <Row className="g-3 mb-4">
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

                <Row className="g-3 mb-4">
                    <Col xs={12} md={supportsObservatoryAndShower ? 4 : 12} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.METEOR_ID')}</Form.Label>
                        <Form.Control
                            type="number"
                            value={meteorIdFilter}
                            onChange={(e) => setMeteorIdFilter(e.target.value)}
                            placeholder={t('CUSTOMIZE_SEARCH.ADVANCED.METEOR_ID')}
                        />
                    </Col>
                    {supportsObservatoryAndShower && <Col xs={12} md={4} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.OBSERVATORY')}</Form.Label>
                        <Form.Select
                            value={observatoryFilter}
                            onChange={(e) => setObservatoryFilter(e.target.value)}
                            disabled={catalogLoading || catalogError}
                        >
                            <option value="">{catalogLoading ? t('CUSTOMIZE_SEARCH.CATALOG_LOADING') : t('CUSTOMIZE_SEARCH.SELECT_OPTIONAL')}</option>
                            {stations.map((station) => (
                                <option key={station.id} value={station.id}>
                                    {station.id} - {station.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>}
                    {supportsObservatoryAndShower && <Col xs={12} md={4} className="mb-2">
                        <Form.Label>{t('CUSTOMIZE_SEARCH.ADVANCED.SHOWER')}</Form.Label>
                        <Form.Select
                            value={showerFilter}
                            onChange={(e) => setShowerFilter(e.target.value)}
                            disabled={catalogLoading || catalogError}
                        >
                            <option value="">{catalogLoading ? t('CUSTOMIZE_SEARCH.CATALOG_LOADING') : t('CUSTOMIZE_SEARCH.SELECT_OPTIONAL')}</option>
                            {showers.map((shower) => (
                                <option key={shower.id} value={shower.id}>
                                    {shower.id} - {shower.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>}
                </Row>

                {isTwoStationReportType && <Row className="g-3 mb-4">
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
                </Row>}

                {isPhotometryReportType && (
                <Row className="g-3 mb-4">
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

                {isAllReportTypes && <Row className="mb-3">
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
                </Row>}

                <div className="custom-search-actions">
                    <Button variant="outline-secondary" onClick={handleClear} disabled={isSearching}>
                        <RotateCcw size={17} />
                        {t('CUSTOMIZE_SEARCH.CLEAR_BTN')}
                    </Button>
                    {isNotQRUser(roleMask) && reportData.length > 0 && (
                        <Button variant="outline-success" onClick={handleCSV} disabled={isSearching}>
                            <Download size={17} />
                            {t('CUSTOMIZE_SEARCH.DOWNLOAD_CSV')}
                        </Button>
                    )}
                    <Button className="custom-search-primary" onClick={() => handleApplyFilters(0)} disabled={isSearching}>
                        {isSearching ? <Spinner size="sm" animation="border" /> : <Search size={18} />}
                        {isSearching ? t('CUSTOMIZE_SEARCH.SEARCHING') : t('CUSTOMIZE_SEARCH.SEARCH_BTN')}
                    </Button>
                </div>
                </Card.Body>
            </Card>

            {searchButton && (
                <Card className="custom-search-results">
                    <Card.Body>
                        <div className="custom-search-results__header">
                            <div>
                                <span className="custom-search-eyebrow">{t('CUSTOMIZE_SEARCH.RESULTS.EYEBROW')}</span>
                                <h2>{t('CUSTOMIZE_SEARCH.RESULTS_TITLE')}</h2>
                                <p>{t('CUSTOMIZE_SEARCH.RESULTS.DESCRIPTION')}</p>
                            </div>
                            <Badge pill className="custom-search-count">
                                {t('CUSTOMIZE_SEARCH.RESULTS_COUNT', { count: totalItems })}
                            </Badge>
                        </div>

                        {searchError && (
                            <Alert variant="danger" className="custom-search-alert">
                                {t('CUSTOMIZE_SEARCH.SEARCH_ERROR')}
                            </Alert>
                        )}

                        {!searchError && reportData.length === 0 && (
                            <div className="custom-search-empty">
                                <div className="custom-search-empty__icon"><Search size={28} /></div>
                                <h3>{t('CUSTOMIZE_SEARCH.EMPTY.TITLE')}</h3>
                                <p>{t('CUSTOMIZE_SEARCH.EMPTY.DESCRIPTION')}</p>
                                <Button variant="outline-secondary" onClick={handleClear}>
                                    <RotateCcw size={17} />
                                    {t('CUSTOMIZE_SEARCH.EMPTY.ACTION')}
                                </Button>
                            </div>
                        )}

                        {!searchError && reportData.length > 0 && <div className="custom-search-result-list">
                            {reportData.map((report, index) => (
                                <article
                                    className="custom-search-result"
                                    key={report.IdInforme || report.Identificador || index}
                                >
                                    <div className="custom-search-result__main">
                                        <div className="custom-search-result__identity">
                                            <span>{t('CUSTOMIZE_SEARCH.RESULT_FIELDS.METEOR')}</span>
                                            <h3>#{report.Identificador}</h3>
                                            <p><CalendarDays size={15} /> {formatDate(report.Fecha)} · {report.Hora?.substring(0, 8)}</p>
                                        </div>
                                        <div className="custom-search-metrics">
                                            {report.velocidadMedia != null && (
                                                <span><Gauge size={14} /> {t('CUSTOMIZE_SEARCH.RESULT_FIELDS.AVERAGE_VELOCITY')}: <strong>{report.velocidadMedia} km/s</strong></span>
                                            )}
                                            {report.magMax != null && (
                                                <span><Sparkles size={14} /> {t('CUSTOMIZE_SEARCH.RESULT_FIELDS.MAG_MAX')}: <strong>{formatDecimal(report.magMax)}</strong></span>
                                            )}
                                            {report.masaFotometrica != null && (
                                                <span>{t('CUSTOMIZE_SEARCH.RESULT_FIELDS.PHOTOMETRIC_MASS')}: <strong>{report.masaFotometrica} g</strong></span>
                                            )}
                                            {report.lluviasAsociadas && (
                                                <span><MapPin size={14} /> {t('CUSTOMIZE_SEARCH.ADVANCED.SHOWER')}: <strong>{report.lluviasAsociadas}</strong></span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="custom-search-availability" aria-label={t('CUSTOMIZE_SEARCH.RESULTS.AVAILABILITY')}>
                                        {[
                                            [t('CUSTOMIZE_SEARCH.REPORT_Z'), report.hasReportZ],
                                            [t('CUSTOMIZE_SEARCH.REPORT_RADIANT'), report.hasReportRadiant],
                                            [t('CUSTOMIZE_SEARCH.REPORT_PHOTOMETRY'), report.hasReportPhotometry]
                                        ].map(([label, available]) => (
                                            <span key={label} className={available ? 'is-available' : 'is-unavailable'}>
                                                {available ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    <Button className="custom-search-view" onClick={() => handleShowModal(report)}>
                                        <Eye size={17} />
                                        {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                    </Button>
                                </article>
                            ))}
                        </div>}

                    {!searchError && totalPages > 1 && <nav className="custom-search-pagination" aria-label={t('CUSTOMIZE_SEARCH.PAGINATION.ARIA_LABEL')}>
                        <ul className="pagination justify-content-center mb-0">
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
                    </nav>}
                    </Card.Body>
                </Card>
            )}

            <CustomizeSearchModal report={modalReport} show={showModal} onHide={handleCloseModal} />
            <DownloadConfirmModal
                show={showDownloadConfirmModal}
                onHide={() => setShowDownloadConfirmModal(false)}
                onConfirm={handleConfirmDownload}
            />
        </Container>
        </div>
    );
};

export default CustomizeSearch;
