import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Container, Dropdown, Form, Spinner, Tab, Table, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllShower } from '@/services/activeShower.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import './activeShower.css';

const SHOWER_VISUALIZATIONS = {
    CAP: 'Alpha-Capricornids',
    ETA: 'Eta-Aquariids',
    GEM: 'Geminids',
    LEO: 'Leonids',
    LYR: 'Lyrids',
    NTA: 'Northern-Taurids',
    ORI: 'Orionids',
    PER: 'Perseids',
    QUA1: 'Quadrantids',
    QUA2: 'Quadrantids',
    QUA: 'Quadrantids',
    SDA: 'Southern-Delta-Aquariids',
    STA: 'Southern-Taurids',
    URS: 'Ursids',
};

const getStartYear = (shower) => {
    const startDate = shower?.Fecha_Inicio ? new Date(shower.Fecha_Inicio) : null;
    const year = startDate?.getFullYear();

    return Number.isInteger(year) ? String(year) : '';
};

const getAvailableStartYears = (showers = []) => (
    Array.from(new Set(showers.map(getStartYear).filter(Boolean)))
        .sort((yearA, yearB) => Number(yearB) - Number(yearA))
);

const getShowerCode = (shower) => shower?.Identificador || shower?.Code || '';
const getShowerName = (shower) => shower?.Nombre || shower?.ShowerNameDesignation || '';
const getShowerFamilyCode = (shower) => getShowerCode(shower).replace(/\d+$/, '');

const matchesSearch = (shower, searchTerm) => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    if (!normalizedSearch) return true;

    return `${getShowerCode(shower)} ${getShowerName(shower)}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
};

const groupShowersByIdentifier = (showers) => {
    const groups = showers.reduce((result, shower) => {
        const familyCode = getShowerFamilyCode(shower) || getShowerCode(shower);
        if (!result[familyCode]) result[familyCode] = { familyCode, showers: [] };
        result[familyCode].showers.push(shower);
        return result;
    }, {});

    return Object.values(groups).sort((groupA, groupB) => (
        groupA.familyCode.localeCompare(groupB.familyCode)
    ));
};

const EmptyState = ({ icon = 'bi-inbox', title, description }) => (
    <div className="active-showers__empty">
        <i className={`bi ${icon}`} aria-hidden="true" />
        <strong>{title}</strong>
        {description && <p>{description}</p>}
    </div>
);

const ReportLinks = ({ codes, t }) => {
    if (codes.length === 1) {
        return (
            <Link className="active-showers__detail-link" to={`/shower-info/${codes[0]}`} target="_blank" rel="noopener noreferrer">
                {t('ACTIVE_SHOWER_PAGE.ACTIONS.REPORTS')}<i className="bi bi-arrow-up-right" aria-hidden="true" />
            </Link>
        );
    }

    return (
        <Dropdown align="end">
            <Dropdown.Toggle className="active-showers__reports-menu" variant="link" size="sm">
                {t('ACTIVE_SHOWER_PAGE.ACTIONS.REPORTS')}<i className="bi bi-chevron-down" aria-hidden="true" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {codes.map((code) => (
                    <Dropdown.Item key={code} as={Link} to={`/shower-info/${code}`} target="_blank" rel="noopener noreferrer">
                        {code}<i className="bi bi-arrow-up-right" aria-hidden="true" />
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

const VisualizationButton = ({ shower, visualization, onShowVisualization, t, compact = false }) => (
    <Button
        className="active-showers__visualize-button"
        size="sm"
        onClick={() => onShowVisualization({ ...shower, src: visualization })}
    >
        <i className="bi bi-stars" aria-hidden="true" />
        {!compact && t('ACTIVE_SHOWER_PAGE.ACTIONS.VISUALIZE')}
    </Button>
);

const ShowerGroup = ({ group, catalog, onShowVisualization, t }) => {
    const [expanded, setExpanded] = useState(false);
    const codes = Array.from(new Set(group.showers.map(getShowerCode))).sort();
    const familyVisualization = SHOWER_VISUALIZATIONS[group.familyCode];
    const representativeShower = group.showers[0];
    const years = Array.from(new Set(group.showers.map(getStartYear).filter(Boolean))).sort().reverse();
    const yearSummary = years.length > 1 ? `${years.at(-1)}–${years[0]}` : years[0];
    const groupName = getShowerName(representativeShower);

    return (
        <article className={`active-showers__group${expanded ? ' is-expanded' : ''}`}>
            <div className="active-showers__group-header">
                <button
                    className="active-showers__group-toggle"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((current) => !current)}
                >
                    <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} aria-hidden="true" />
                    <Badge className="active-showers__code">{group.familyCode}</Badge>
                    <span className="active-showers__group-title">
                        <strong>{groupName}</strong>
                        <small>
                            {t('ACTIVE_SHOWER_PAGE.GROUP.RECORDS', { count: group.showers.length })}
                            {yearSummary && ` · ${yearSummary}`}
                        </small>
                    </span>
                </button>
                <div className="active-showers__group-actions">
                    <ReportLinks codes={codes} t={t} />
                    {familyVisualization && (
                        <VisualizationButton
                            shower={{ ...representativeShower, Identificador: group.familyCode, Code: group.familyCode }}
                            visualization={familyVisualization}
                            onShowVisualization={onShowVisualization}
                            t={t}
                        />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="table-responsive active-showers__group-content">
                    <Table className="active-showers__table" hover>
                        <thead><tr>
                            <th>{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                            <th>{t('REPORT.ACTIVE_RAIN.TABLE.NAME')}</th>
                            {catalog === 'imo' ? (
                                <>
                                    <th>{t('ACTIVE_SHOWER_PAGE.TABLE.YEAR')}</th>
                                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.START_DATE')}</th>
                                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.END_DATE')}</th>
                                    <th>{t('ACTIVE_SHOWER_PAGE.TABLE.SPEED')}</th>
                                </>
                            ) : (
                                <>
                                    <th>{t('REPORT.ACTIVE_RAIN.TABLE.DATE')}</th>
                                    <th>{t('ACTIVE_SHOWER_PAGE.TABLE.ACTIVITY')}</th>
                                </>
                            )}
                            <th className="text-end">{t('ACTIVE_SHOWER_PAGE.TABLE.ACTIONS')}</th>
                        </tr></thead>
                        <tbody>{group.showers.map((shower, index) => {
                            const code = getShowerCode(shower);
                            const variantVisualization = !familyVisualization ? SHOWER_VISUALIZATIONS[code] : null;
                            return (
                                <tr key={`${code}-${shower.Fecha_Inicio || shower.SubDate || index}`}>
                                    <td><Badge className="active-showers__code">{code}</Badge></td>
                                    <td><strong>{getShowerName(shower)}</strong></td>
                                    {catalog === 'imo' ? (
                                        <>
                                            <td>{getStartYear(shower) || '—'}</td>
                                            <td>{shower.Fecha_Inicio ? formatDate(shower.Fecha_Inicio) : '—'}</td>
                                            <td>{shower.Fecha_Fin ? formatDate(shower.Fecha_Fin) : '—'}</td>
                                            <td>{shower.Velocidad ?? '—'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{shower.SubDate ? formatDate(shower.SubDate) : '—'}</td>
                                            <td>{shower.Activity || '—'}</td>
                                        </>
                                    )}
                                    <td>
                                        <div className="active-showers__actions">
                                            <Link className="active-showers__detail-link" to={`/shower-info/${code}`} target="_blank" rel="noopener noreferrer">
                                                {t('ACTIVE_SHOWER_PAGE.ACTIONS.REPORTS')}<i className="bi bi-arrow-up-right" aria-hidden="true" />
                                            </Link>
                                            {variantVisualization && (
                                                <VisualizationButton shower={shower} visualization={variantVisualization} onShowVisualization={onShowVisualization} t={t} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}</tbody>
                    </Table>
                </div>
            )}
        </article>
    );
};

const ActiveShower = () => {
    const { t } = useTranslation(['text']);
    const [showerDetails, setShowerDetails] = useState([]);
    const [iauShowerDetails, setIauShowerDetails] = useState([]);
    const [selectedShower, setSelectedShower] = useState(null);
    const [selectedIMOYears, setSelectedIMOYears] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('imo');
    const visualizationRef = useRef(null);

    const loadShowers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllShower();
            const imoShowers = Array.isArray(response?.shower) ? response.shower : [];
            const iauShowers = Array.isArray(response?.IAUShower) ? response.IAUShower : [];

            setShowerDetails(imoShowers);
            setIauShowerDetails(iauShowers);
            setSelectedIMOYears(getAvailableStartYears(imoShowers));
        } catch (loadError) {
            console.error('Error fetching meteor shower details:', loadError);
            setError(t('ACTIVE_SHOWER_PAGE.ERROR'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadShowers();
    }, [loadShowers]);

    const availableIMOYears = useMemo(() => getAvailableStartYears(showerDetails), [showerDetails]);

    const filteredIMOShowers = useMemo(() => {
        const selectedYears = new Set(selectedIMOYears);
        return showerDetails.filter((shower) => {
            const startYear = getStartYear(shower);
            return startYear && selectedYears.has(startYear) && matchesSearch(shower, searchTerm);
        });
    }, [searchTerm, selectedIMOYears, showerDetails]);

    const filteredIAUShowers = useMemo(
        () => iauShowerDetails.filter((shower) => matchesSearch(shower, searchTerm)),
        [iauShowerDetails, searchTerm]
    );

    const groupedIMOShowers = useMemo(
        () => groupShowersByIdentifier(filteredIMOShowers),
        [filteredIMOShowers]
    );
    const groupedIAUShowers = useMemo(
        () => groupShowersByIdentifier(filteredIAUShowers),
        [filteredIAUShowers]
    );
    const visibleIMOCount = filteredIMOShowers.length;

    const handleIMOYearChange = (year) => {
        setSelectedIMOYears((currentYears) => (
            currentYears.includes(year)
                ? currentYears.filter((currentYear) => currentYear !== year)
                : [...currentYears, year].sort((yearA, yearB) => Number(yearB) - Number(yearA))
        ));
    };

    const handleShowVisualization = (shower) => {
        setSelectedShower(shower);
        window.setTimeout(() => visualizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedShower(null);
    };

    const selectedCode = getShowerCode(selectedShower);
    const selectedName = getShowerName(selectedShower);

    return (
        <main className="active-showers">
            <header className="active-showers__hero">
                <Container>
                    <span className="active-showers__eyebrow">{t('ACTIVE_SHOWER_PAGE.EYEBROW')}</span>
                    <h1>{t('ACTIVE_SHOWER_PAGE.TITLE')}</h1>
                    <p>{t('ACTIVE_SHOWER_PAGE.DESCRIPTION')}</p>
                </Container>
            </header>

            <Container className="active-showers__content">
                {error && (
                    <Alert variant="danger" className="active-showers__error">
                        <span><i className="bi bi-exclamation-triangle" aria-hidden="true" />{error}</span>
                        <Button variant="outline-danger" size="sm" onClick={loadShowers}>{t('ACTIVE_SHOWER_PAGE.RETRY')}</Button>
                    </Alert>
                )}

                <section className="active-showers__summary" aria-label={t('ACTIVE_SHOWER_PAGE.SUMMARY.LABEL')}>
                    <div>
                        <span className="active-showers__summary-icon"><i className="bi bi-calendar-event" /></span>
                        <span><strong>{showerDetails.length}</strong>{t('ACTIVE_SHOWER_PAGE.SUMMARY.IMO')}</span>
                    </div>
                    <div>
                        <span className="active-showers__summary-icon"><i className="bi bi-globe" /></span>
                        <span><strong>{iauShowerDetails.length}</strong>{t('ACTIVE_SHOWER_PAGE.SUMMARY.IAU')}</span>
                    </div>
                    <div>
                        <span className="active-showers__summary-icon"><i className="bi bi-clock-history" /></span>
                        <span><strong>{availableIMOYears.length}</strong>{t('ACTIVE_SHOWER_PAGE.SUMMARY.YEARS')}</span>
                    </div>
                </section>

                <section className="active-showers__catalog" aria-labelledby="catalog-title">
                    <div className="active-showers__catalog-heading">
                        <div>
                            <span className="active-showers__section-icon"><i className="bi bi-list-stars" /></span>
                            <div>
                                <h2 id="catalog-title">{t('ACTIVE_SHOWER_PAGE.CATALOG.TITLE')}</h2>
                                <p>{t('ACTIVE_SHOWER_PAGE.CATALOG.DESCRIPTION')}</p>
                            </div>
                        </div>
                        <div className="active-showers__search">
                            <i className="bi bi-search" aria-hidden="true" />
                            <Form.Control
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={t('ACTIVE_SHOWER_PAGE.SEARCH_PLACEHOLDER')}
                                aria-label={t('ACTIVE_SHOWER_PAGE.SEARCH_LABEL')}
                            />
                            {searchTerm && (
                                <Button variant="link" onClick={() => setSearchTerm('')} aria-label={t('ACTIVE_SHOWER_PAGE.CLEAR_SEARCH')}>
                                    <i className="bi bi-x-lg" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="active-showers__loading" aria-live="polite">
                            <Spinner animation="border" role="status" />
                            <span>{t('ACTIVE_SHOWER_PAGE.LOADING')}</span>
                        </div>
                    ) : error ? (
                        <EmptyState icon="bi-cloud-slash" title={t('ACTIVE_SHOWER_PAGE.ERROR')} />
                    ) : (
                        <Tabs activeKey={activeTab} onSelect={handleTabChange} className="active-showers__tabs">
                            <Tab eventKey="imo" title={`IMO · ${visibleIMOCount}`}>
                                <div className="active-showers__year-filter">
                                    <div>
                                        <strong>{t('ACTIVE_SHOWER_PAGE.YEARS.TITLE')}</strong>
                                        <span>{t('ACTIVE_SHOWER_PAGE.YEARS.SELECTED', { selected: selectedIMOYears.length, total: availableIMOYears.length })}</span>
                                    </div>
                                    <div className="active-showers__year-actions">
                                        <Button variant="link" size="sm" onClick={() => setSelectedIMOYears(availableIMOYears)} disabled={selectedIMOYears.length === availableIMOYears.length}>
                                            {t('ACTIVE_SHOWER_PAGE.YEARS.ALL')}
                                        </Button>
                                        <Button variant="link" size="sm" onClick={() => setSelectedIMOYears([])} disabled={selectedIMOYears.length === 0}>
                                            {t('ACTIVE_SHOWER_PAGE.YEARS.NONE')}
                                        </Button>
                                    </div>
                                    <div className="active-showers__year-chips">
                                        {availableIMOYears.map((year) => {
                                            const isSelected = selectedIMOYears.includes(year);
                                            return (
                                                <button key={year} type="button" className={isSelected ? 'is-selected' : ''} aria-pressed={isSelected} onClick={() => handleIMOYearChange(year)}>
                                                    {year}<i className={`bi ${isSelected ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedIMOYears.length === 0 ? (
                                    <EmptyState icon="bi-calendar2-check" title={t('ACTIVE_SHOWER_PAGE.EMPTY.SELECT_YEAR')} />
                                ) : visibleIMOCount === 0 ? (
                                    <EmptyState icon="bi-search" title={t('ACTIVE_SHOWER_PAGE.EMPTY.NO_RESULTS')} description={t('ACTIVE_SHOWER_PAGE.EMPTY.NO_RESULTS_DESCRIPTION')} />
                                ) : (
                                    <div className="active-showers__groups">
                                        {groupedIMOShowers.map((group) => (
                                            <ShowerGroup key={group.familyCode} group={group} catalog="imo" onShowVisualization={handleShowVisualization} t={t} />
                                        ))}
                                    </div>
                                )}
                            </Tab>

                            <Tab eventKey="iau" title={`IAU · ${filteredIAUShowers.length}`}>
                                {filteredIAUShowers.length === 0 ? (
                                    <EmptyState icon="bi-search" title={t('ACTIVE_SHOWER_PAGE.EMPTY.NO_RESULTS')} description={t('ACTIVE_SHOWER_PAGE.EMPTY.NO_RESULTS_DESCRIPTION')} />
                                ) : (
                                    <div className="active-showers__groups">
                                        {groupedIAUShowers.map((group) => (
                                            <ShowerGroup key={group.familyCode} group={group} catalog="iau" onShowVisualization={handleShowVisualization} t={t} />
                                        ))}
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    )}
                </section>

                {selectedShower?.src && (
                    <section className="active-showers__visualization" ref={visualizationRef} aria-labelledby="visualization-title">
                        <div className="active-showers__visualization-heading">
                            <div>
                                <span className="active-showers__section-icon"><i className="bi bi-stars" /></span>
                                <div>
                                    <small>{t('ACTIVE_SHOWER_PAGE.VISUALIZATION.EYEBROW')}</small>
                                    <h2 id="visualization-title">{selectedCode} · {selectedName}</h2>
                                </div>
                            </div>
                            <Button variant="outline-secondary" size="sm" onClick={() => setSelectedShower(null)}>
                                <i className="bi bi-x-lg" aria-hidden="true" />{t('ACTIVE_SHOWER_PAGE.VISUALIZATION.HIDE')}
                            </Button>
                        </div>
                        <div className="active-showers__iframe-wrap">
                            <iframe
                                src={`https://www.meteorshowers.org/view/${selectedShower.src}`}
                                title={t('ACTIVE_SHOWER_PAGE.VISUALIZATION.IFRAME_TITLE', { code: selectedCode })}
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                        <p className="active-showers__credits">
                            {t('ACTIVE_SHOWER_PAGE.VISUALIZATION.CREDITS')}{' '}
                            <a href="https://www.meteorshowers.org/" target="_blank" rel="noopener noreferrer">MeteorShowers.org</a>
                            {' · Ian Webster'}
                        </p>
                    </section>
                )}
            </Container>
        </main>
    );
};

export default ActiveShower;
