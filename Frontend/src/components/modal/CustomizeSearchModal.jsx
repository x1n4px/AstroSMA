import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import {
    CalendarDays,
    ExternalLink,
    FileText,
    Gauge,
    MapPin,
    RadioTower,
    Sparkles,
    Star,
    Telescope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/pipe/formatDate.jsx';
import { getReportData } from '@/services/bolideService.jsx';

const formatTime = (value) => value == null ? '' : String(value).substring(0, 8);

const CustomizeSearchModal = ({ report, show, onHide }) => {
    const { t } = useTranslation(['text']);
    const [reportZData, setReportZData] = useState([]);
    const [reportRadiantData, setReportRadiantData] = useState([]);
    const [reportPhotometryData, setReportPhotometryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!report || !show) return undefined;

        let active = true;
        const fetchReportDetails = async () => {
            setLoading(true);
            setLoadError(false);
            setReportZData([]);
            setReportRadiantData([]);
            setReportPhotometryData([]);

            try {
                const details = await getReportData({
                    IDs_Informe_Radiante: report.IDs_Informe_Radiante,
                    IDs_Informe_Fotometria: report.IDs_Informe_Fotometria,
                    IDs_Informe_Z: report.IDs_Informe_Z,
                });

                if (!active) return;
                setReportZData(details.reportData || []);
                setReportRadiantData(details.reportDataRadiant || []);
                setReportPhotometryData(details.reportDataPhotometry || []);
            } catch (error) {
                console.error('Error fetching report details:', error);
                if (active) setLoadError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchReportDetails();
        return () => {
            active = false;
        };
    }, [report, show]);

    const totalReports = reportZData.length + reportRadiantData.length + reportPhotometryData.length;
    const valueOrFallback = (value) => value == null || value === '' ? t('CUSTOMIZE_SEARCH.MODAL.NOT_AVAILABLE') : value;
    const formatDateTime = (date, time) => t('CUSTOMIZE_SEARCH.MODAL.DATE_TIME', {
        date: valueOrFallback(formatDate(date)),
        time: valueOrFallback(formatTime(time))
    });
    const formatMeasurement = (value, unitKey) => value == null || value === ''
        ? t('CUSTOMIZE_SEARCH.MODAL.NOT_AVAILABLE')
        : t('CUSTOMIZE_SEARCH.MODAL.MEASUREMENT', { value, unit: t(unitKey) });

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            className="custom-search-detail-modal"
            contentClassName="custom-search-detail-modal__content"
        >
            <Modal.Header closeButton className="custom-search-detail-modal__header">
                <div className="custom-search-detail-modal__heading">
                    <div className="custom-search-detail-modal__heading-icon" aria-hidden="true">
                        <FileText size={23} />
                    </div>
                    <div>
                        <span>{t('CUSTOMIZE_SEARCH.MODAL.EYEBROW')}</span>
                        <Modal.Title>
                            {t('CUSTOMIZE_SEARCH.MODAL.TITLE', { meteorId: report?.Identificador ?? t('CUSTOMIZE_SEARCH.MODAL.NOT_AVAILABLE') })}
                        </Modal.Title>
                        {report && (
                            <p><CalendarDays size={15} /> {formatDateTime(report.Fecha, report.Hora)}</p>
                        )}
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="custom-search-detail-modal__body">
                {loading && (
                    <div className="custom-search-modal-state" role="status">
                        <Spinner animation="border" />
                        <p>{t('CUSTOMIZE_SEARCH.MODAL.LOADING')}</p>
                    </div>
                )}

                {!loading && loadError && (
                    <Alert variant="danger" className="custom-search-alert mb-0">
                        {t('CUSTOMIZE_SEARCH.MODAL.ERROR')}
                    </Alert>
                )}

                {!loading && !loadError && totalReports === 0 && (
                    <div className="custom-search-modal-state">
                        <FileText size={30} />
                        <h3>{t('CUSTOMIZE_SEARCH.MODAL.EMPTY_TITLE')}</h3>
                        <p>{t('CUSTOMIZE_SEARCH.MODAL.EMPTY_DESCRIPTION')}</p>
                    </div>
                )}

                {!loading && !loadError && reportZData.length > 0 && (
                    <section className="custom-search-report-section">
                        <div className="custom-search-report-section__header">
                            <div><Telescope size={20} /><h3>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.TITLE')}</h3></div>
                            <Badge pill>{reportZData.length}</Badge>
                        </div>
                        <div className="custom-search-report-grid">
                            {reportZData.map((item) => (
                                <article className="custom-search-report-card" key={item.IdInforme}>
                                    <div className="custom-search-report-card__topline">
                                        <span>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_ID', { id: item.IdInforme })}</span>
                                        <span>{formatDateTime(item.Fecha, item.Hora)}</span>
                                    </div>
                                    <dl>
                                        <div><dt><MapPin size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.STATION_1')}</dt><dd>{valueOrFallback(item.Ob1)}</dd></div>
                                        <div><dt><MapPin size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.STATION_2')}</dt><dd>{valueOrFallback(item.Ob2)}</dd></div>
                                    </dl>
                                    <Link to={`/report/${item.IdInforme}`} className="btn custom-search-report-card__link" target="_blank" rel="noreferrer">
                                        {t('CUSTOMIZE_SEARCH.MODAL.OPEN_REPORT')} <ExternalLink size={16} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {!loading && !loadError && reportRadiantData.length > 0 && (
                    <section className="custom-search-report-section">
                        <div className="custom-search-report-section__header">
                            <div><RadioTower size={20} /><h3>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.TITLE')}</h3></div>
                            <Badge pill>{reportRadiantData.length}</Badge>
                        </div>
                        <div className="custom-search-report-grid custom-search-report-grid--wide">
                            {reportRadiantData.map((item) => (
                                <article className="custom-search-report-card" key={item.Identificador}>
                                    <div className="custom-search-report-card__topline">
                                        <span>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_ID', { id: item.Identificador })}</span>
                                        <span>{formatDateTime(item.Fecha, item.Hora)}</span>
                                    </div>
                                    <dl className="custom-search-report-card__metrics">
                                        <div><dt><MapPin size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.STATION')}</dt><dd>{valueOrFallback(item.Observatorio_Número)}</dd></div>
                                        <div><dt><Sparkles size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ASSOCIATED_RAIN')}</dt><dd>{valueOrFallback(item.Lluvia_Asociada)}</dd></div>
                                        <div><dt>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ESTIMATED_TRAJECTORY')}</dt><dd>{valueOrFallback(item.Trayectorias_estimadas_para)}</dd></div>
                                        <div><dt><Gauge size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ANGULAR_DISTANCE')}</dt><dd>{formatMeasurement(item.Distancia_angular_grados, 'CUSTOMIZE_SEARCH.MODAL.UNITS.DEGREES')}</dd></div>
                                        <div><dt><Gauge size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ANGULAR_VELOCITY')}</dt><dd>{formatMeasurement(item.Velocidad_angular_grad_sec, 'CUSTOMIZE_SEARCH.MODAL.UNITS.DEGREES_PER_SECOND')}</dd></div>
                                    </dl>
                                    <Link to={`/radiant-report/${item.Identificador}`} className="btn custom-search-report-card__link" target="_blank" rel="noreferrer">
                                        {t('CUSTOMIZE_SEARCH.MODAL.OPEN_REPORT')} <ExternalLink size={16} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {!loading && !loadError && reportPhotometryData.length > 0 && (
                    <section className="custom-search-report-section">
                        <div className="custom-search-report-section__header">
                            <div><Sparkles size={20} /><h3>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.TITLE')}</h3></div>
                            <Badge pill>{reportPhotometryData.length}</Badge>
                        </div>
                        <div className="custom-search-report-grid">
                            {reportPhotometryData.map((item) => (
                                <article className="custom-search-report-card" key={item.Identificador}>
                                    <div className="custom-search-report-card__topline">
                                        <span>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_ID', { id: item.Identificador })}</span>
                                        <span>{formatDateTime(item.Fecha, item.Hora)}</span>
                                    </div>
                                    <dl>
                                        <div><dt><Star size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.VISIBLE_STARS')}</dt><dd>{valueOrFallback(item.Estrellas_visibles)}</dd></div>
                                        <div><dt><Star size={15} /> {t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.STAR_USED_IN_REGRESSION')}</dt><dd>{valueOrFallback(item.Estrellas_usadas_para_regresion)}</dd></div>
                                    </dl>
                                    <Link to={`/photometry-report/${item.Identificador}`} className="btn custom-search-report-card__link" target="_blank" rel="noreferrer">
                                        {t('CUSTOMIZE_SEARCH.MODAL.OPEN_REPORT')} <ExternalLink size={16} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </Modal.Body>

            <Modal.Footer className="custom-search-detail-modal__footer">
                <Button variant="outline-secondary" onClick={onHide}>
                    {t('CUSTOMIZE_SEARCH.MODAL.CLOSE')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomizeSearchModal;
