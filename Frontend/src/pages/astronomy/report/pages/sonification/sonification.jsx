import './sonification.css';

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { getSonificationMethod, getSonificationOverview } from '@/services/sonificationService.jsx';
import {
  ReportEmptyState,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportPanel,
  ReportTableShell,
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

const getSonificationApiBaseUrl = () => (
  import.meta.env.VITE_SONIFICATION_API_URL
  || import.meta.env.VITE_API_URL
  || (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

const API_BASE_URL = getSonificationApiBaseUrl();

function toAbsoluteApiUrl(relativePath) {
  if (!relativePath) {
    return '';
  }

  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  return `${API_BASE_URL}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

function buildVideoFilename(reportId, method) {
  if (!reportId) {
    return '';
  }

  return method === 'midi'
    ? `sonificacion-midi-ID-${reportId}.mp4`
    : `sonificacion-simple-ID-${reportId}.mp4`;
}

function MethodButton({ active, disabled, label, helpText, onClick }) {
  return (
    <button
      type="button"
      className={`sonification-method-button ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sonification-method-button__label">{label}</span>
      <span className="sonification-method-button__help">{helpText}</span>
    </button>
  );
}

MethodButton.propTypes = {
  active: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function SonificationFeedbackCard({ tone, title, description, details, actions }) {
  return (
    <div className={`sonification-feedback sonification-feedback--${tone}`}>
      <div className="sonification-feedback__visual" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="sonification-feedback__content">
        <h5 className="sonification-feedback__title">{title}</h5>
        <p className="sonification-feedback__description">{description}</p>
        {details ? <p className="sonification-feedback__details">{details}</p> : null}
        {actions}
      </div>
    </div>
  );
}

SonificationFeedbackCard.propTypes = {
  tone: PropTypes.oneOf(['neutral', 'warm', 'danger']).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  details: PropTypes.string,
  actions: PropTypes.node,
};

SonificationFeedbackCard.defaultProps = {
  details: '',
  actions: null,
};

function buildDownloadRows(reportId, t) {
  return [
    {
      key: 'simple_mp4',
      label: t('REPORT.SONIFICATION.RESOURCES.SIMPLE_MP4'),
      filename: `sonificacion-simple-ID-${reportId}.mp4`,
      downloadPath: `/files/sonif/sonificacion-simple-ID-${reportId}.mp4`,
      description: t('REPORT.SONIFICATION.RESOURCES.SIMPLE_MP4_DESC'),
    },
    {
      key: 'midi_mp4',
      label: t('REPORT.SONIFICATION.RESOURCES.MIDI_MP4'),
      filename: `sonificacion-midi-ID-${reportId}.mp4`,
      downloadPath: `/files/sonif/sonificacion-midi-ID-${reportId}.mp4`,
      description: t('REPORT.SONIFICATION.RESOURCES.MIDI_MP4_DESC'),
    },
    {
      key: 'simple_wav',
      label: t('REPORT.SONIFICATION.RESOURCES.SIMPLE_WAV'),
      filename: `sonido-simple-ID-${reportId}.wav`,
      downloadPath: `/files/sonif/sonido-simple-ID-${reportId}.wav`,
      description: t('REPORT.SONIFICATION.RESOURCES.SIMPLE_WAV_DESC'),
    },
    {
      key: 'midi_wav',
      label: t('REPORT.SONIFICATION.RESOURCES.MIDI_WAV'),
      filename: `sonido-midi-ID-${reportId}.wav`,
      downloadPath: `/files/sonif/sonido-midi-ID-${reportId}.wav`,
      description: t('REPORT.SONIFICATION.RESOURCES.MIDI_WAV_DESC'),
    },
    {
      key: 'midi_file',
      label: t('REPORT.SONIFICATION.RESOURCES.MIDI_FILE'),
      filename: `sonido-midi-ID-${reportId}.mid`,
      downloadPath: `/files/sonif/sonido-midi-ID-${reportId}.mid`,
      description: t('REPORT.SONIFICATION.RESOURCES.MIDI_FILE_DESC'),
    },
  ];
}

function SonificationReport({ report }) {
  const { t } = useTranslation(['text']);
  const reportId = report?.reportId ?? report?.IdInforme ?? null;
  const [overview, setOverview] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('simple');
  const [videoState, setVideoState] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState(false);
  const [overviewError, setOverviewError] = useState(null);
  const [methodError, setMethodError] = useState(null);
  const [overviewRefreshTick, setOverviewRefreshTick] = useState(0);
  const [methodRefreshTick, setMethodRefreshTick] = useState(0);

  const expectedVideoFilename = useMemo(
    () => buildVideoFilename(reportId, selectedMethod),
    [reportId, selectedMethod],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchOverview = async () => {
      if (!reportId) {
        setOverview(null);
        setVideoState(null);
        return;
      }

      setLoadingOverview(true);
      setOverviewError(null);
      setOverview(null);
      setVideoState(null);
      setSelectedMethod('simple');
      setMethodError(null);

      try {
        const data = await getSonificationOverview(reportId);
        if (cancelled) return;
        setOverview(data);
      } catch (fetchError) {
        if (cancelled) return;
        setOverviewError(fetchError);
        setOverview(null);
      } finally {
        if (!cancelled) {
          setLoadingOverview(false);
        }
      }
    };

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [reportId, overviewRefreshTick]);

  useEffect(() => {
    let cancelled = false;

    const fetchMethod = async () => {
      if (!reportId || loadingOverview || !overview) {
        return;
      }

      setLoadingMethod(true);
      setMethodError(null);

      try {
        const data = await getSonificationMethod(reportId, selectedMethod);
        if (cancelled) return;
        const resolvedVideoFilename = data?.videoFilename || expectedVideoFilename;
        setVideoState({
          ...data,
          videoFilename: resolvedVideoFilename,
          vid: data?.vid || (resolvedVideoFilename ? `/vids/${resolvedVideoFilename}` : ''),
        });
      } catch (fetchError) {
        if (cancelled) return;
        setMethodError(fetchError);
        setVideoState(null);
      } finally {
        if (!cancelled) {
          setLoadingMethod(false);
        }
      }
    };

    fetchMethod();

    return () => {
      cancelled = true;
    };
  }, [reportId, selectedMethod, loadingOverview, overview, methodRefreshTick, expectedVideoFilename]);

  const methodOptions = useMemo(() => ([
    {
      value: 'simple',
      label: t('REPORT.SONIFICATION.METHODS.SIMPLE'),
      help: t('REPORT.SONIFICATION.RESOURCES.SIMPLE_MP4_DESC'),
    },
    {
      value: 'midi',
      label: t('REPORT.SONIFICATION.METHODS.MIDI'),
      help: t('REPORT.SONIFICATION.RESOURCES.MIDI_MP4_DESC'),
    },
  ]), [t]);

  const summaryMetrics = useMemo(() => ([
    { label: t('REPORT.SONIFICATION.SUMMARY.REPORT_ID'), value: reportId ?? '-' },
    { label: t('REPORT.SONIFICATION.SUMMARY.DATE'), value: overview?.date ?? overview?.fecha ?? report?.date ?? report?.Fecha ?? '-' },
    { label: t('REPORT.SONIFICATION.SUMMARY.HOUR'), value: overview?.time?.substring(0, 8) ?? overview?.hora?.substring(0, 8) ?? report?.time?.substring(0, 8) ?? report?.Hora?.substring(0, 8) ?? '-' },
  ]), [overview, report, reportId, t]);

  const downloadRows = useMemo(() => buildDownloadRows(reportId, t), [reportId, t]);
  const hasOverviewError = Boolean(overviewError);
  const hasMethodError = Boolean(methodError);
  const hasGenerationError = hasOverviewError || hasMethodError;
  const videoFilename = videoState?.videoFilename || '';
  const videoUrl = videoState?.vid ? toAbsoluteApiUrl(videoState.vid) : '';
  const hasOverview = Boolean(overview);
  const hasVideo = Boolean(videoState?.videoFilename);

  const handleDownload = (downloadPath, filename) => {
    const link = document.createElement('a');
    link.href = toAbsoluteApiUrl(downloadPath);
    link.download = filename;
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!reportId) {
    return <ReportEmptyState message={t('REPORT.SONIFICATION.EMPTY')} />;
  }

  return (
    <Container fluid className="px-0">
      <Row className="g-4 sonification-shell">
        <Col xs={12}>
          <ReportPanel
            title={t('REPORT.SONIFICATION.TITLE')}
            description={t('REPORT.SONIFICATION.DESCRIPTION')}
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map((metric) => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
        </Col>

        {hasGenerationError ? (
          <Col xs={12}>
            <Alert
              variant="danger"
              className="sonification-global-alert"
            >
              <div className="sonification-global-alert__layout">
                <div className="sonification-global-alert__copy">
                  <Alert.Heading className="sonification-global-alert__title">
                    {t('REPORT.SONIFICATION.FEEDBACK.ERROR_TITLE')}
                  </Alert.Heading>
                  <p className="sonification-global-alert__description">
                    {t('REPORT.SONIFICATION.FEEDBACK.ERROR_DESCRIPTION')}
                  </p>
                </div>

                <div className="sonification-global-alert__actions">
                  {hasOverviewError ? (
                    <Button
                      style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                      onClick={() => setOverviewRefreshTick((value) => value + 1)}
                    >
                      {t('REPORT.SONIFICATION.FEEDBACK.REFRESH_OVERVIEW')}
                    </Button>
                  ) : null}

                  {hasMethodError ? (
                    <>
                      <Button
                        style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                        onClick={() => setMethodRefreshTick((value) => value + 1)}
                      >
                        {t('REPORT.SONIFICATION.FEEDBACK.RETRY')}
                      </Button>
                      <Button
                        variant="outline-light"
                        onClick={() => {
                          setSelectedMethod((value) => (value === 'simple' ? 'midi' : 'simple'));
                          setMethodRefreshTick((value) => value + 1);
                        }}
                      >
                        {t('REPORT.SONIFICATION.FEEDBACK.TRY_OTHER_METHOD')}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </Alert>
          </Col>
        ) : null}

        <Col xs={12}>
          <ReportPanel
            title={t('REPORT.SONIFICATION.CONTROLS.TITLE')}
            description={t('REPORT.SONIFICATION.CONTROLS.DESCRIPTION')}
          >
            <div className="sonification-method-group" role="group" aria-label={t('REPORT.SONIFICATION.CONTROLS.METHOD_LABEL')}>
              {methodOptions.map((option) => (
                <MethodButton
                  key={option.value}
                  active={selectedMethod === option.value}
                  disabled={loadingOverview || loadingMethod || hasOverviewError}
                  label={option.label}
                  helpText={option.help}
                  onClick={() => {
                    setSelectedMethod(option.value);
                    setMethodRefreshTick((value) => value + 1);
                  }}
                />
              ))}
            </div>

            {hasGenerationError ? null : (
              <div className="sonification-control-actions">
                <Button
                  className="sonification-download"
                  style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                  disabled={!hasVideo || loadingOverview || loadingMethod}
                  onClick={() => handleDownload(videoState?.downloadPath || `/files/sonif/${videoFilename || ''}`, videoFilename || '')}
                >
                  {t('REPORT.SONIFICATION.CONTROLS.DOWNLOAD_VIDEO')}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => setMethodRefreshTick((value) => value + 1)}
                  disabled={loadingOverview || loadingMethod}
                >
                  {t('REPORT.SONIFICATION.FEEDBACK.RETRY')}
                </Button>
              </div>
            )}
          </ReportPanel>
        </Col>

        {!hasGenerationError ? (
          <>
            <Col xs={12}>
              <ReportPanel
                title={t('REPORT.SONIFICATION.VIDEO.TITLE')}
                description={t('REPORT.SONIFICATION.VIDEO.DESCRIPTION')}
                accent="cool"
              >
                {loadingOverview || loadingMethod ? (
                  <div className="sonification-loading-card">
                    <Spinner animation="border" size="sm" />
                    <div>
                      <strong>{t('REPORT.SONIFICATION.LOADING')}</strong>
                      <div className="sonification-loading-card__subtext">
                        {hasOverview
                          ? t('REPORT.SONIFICATION.STATUS.GENERATING')
                          : t('REPORT.SONIFICATION.FEEDBACK.NO_VIDEO_DESCRIPTION')}
                      </div>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <div className="sonification-video-frame">
                    <video controls preload="metadata" src={videoUrl}>
                      <track kind="captions" />
                    </video>
                  </div>
                ) : (
                  <SonificationFeedbackCard
                    tone="neutral"
                    title={t('REPORT.SONIFICATION.FEEDBACK.NO_VIDEO_TITLE')}
                    description={t('REPORT.SONIFICATION.FEEDBACK.NO_VIDEO_DESCRIPTION')}
                  />
                )}
              </ReportPanel>
            </Col>

            <Col xs={12}>
              <ReportPanel
                title={t('REPORT.SONIFICATION.RESOURCES.TITLE')}
                description={t('REPORT.SONIFICATION.RESOURCES.DESCRIPTION')}
              >
                {hasVideo ? (
                  <ReportTableShell>
                    <Table responsive hover className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>{t('REPORT.SONIFICATION.RESOURCES.TABLE.RESOURCE')}</th>
                          <th>{t('REPORT.SONIFICATION.RESOURCES.TABLE.FILE')}</th>
                          <th>{t('REPORT.SONIFICATION.RESOURCES.TABLE.ACTION')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadRows.map((row) => (
                          <tr key={row.key}>
                            <td>
                              <div className="fw-semibold">{row.label}</div>
                              <div className="text-muted small">{row.description}</div>
                            </td>
                            <td>{row.filename}</td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                disabled={loadingOverview || loadingMethod}
                                onClick={() => handleDownload(row.downloadPath, row.filename)}
                              >
                                {t('REPORT.SONIFICATION.RESOURCES.DOWNLOAD')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ReportTableShell>
                ) : (
                  <ReportEmptyState
                    message={t('REPORT.SONIFICATION.FEEDBACK.NO_VIDEO_DESCRIPTION')}
                  />
                )}
              </ReportPanel>
            </Col>
          </>
        ) : null}
      </Row>

      <div className="sonification-footer" aria-label="Créditos de sonificación">
        El módulo de sonificación ha sido desarrollado por:{' '}
        <a
          href="https://www.linkedin.com/in/hilaria-romero-bouyahia/"
          target="_blank"
          rel="noreferrer"
          className="sonification-footer__link"
        >
          Hilaria Romero Bouyahia
        </a>
      </div>
    </Container>
  );
}

SonificationReport.propTypes = {
  report: PropTypes.object,
};

SonificationReport.defaultProps = {
  report: null,
};

export default SonificationReport;
