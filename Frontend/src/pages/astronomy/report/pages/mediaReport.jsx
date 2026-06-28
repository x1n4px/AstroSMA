import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getReportMediaByReportZId } from '@/services/reportService.jsx';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function getMediaTypeLabel(type, t) {
  if (type === 'video') return t('REPORT.MEDIA.VIDEO');
  if (type === 'image') return t('REPORT.MEDIA.IMAGE');
  return t('REPORT.MEDIA.LINK');
}

function MediaPreview({ item }) {
  if (item.type === 'video') {
    return (
      <video
        controls
        preload="metadata"
        src={item.url}
        style={{ width: '100%', maxHeight: '18rem', borderRadius: '0.9rem', background: '#000' }}
      >
        Tu navegador no soporta la reproducción de vídeo.
      </video>
    );
  }

  if (item.type === 'image') {
    return (
      <img
        src={item.url}
        alt={item.filename}
        style={{ width: '100%', maxHeight: '18rem', objectFit: 'contain', borderRadius: '0.9rem', background: '#f5f7fb' }}
      />
    );
  }

  return (
    <div className="text-muted small">
      {item.url}
    </div>
  );
}

MediaPreview.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired
  }).isRequired
};

const MediaReport = ({ reportId }) => {
  const { t } = useTranslation(['text']);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      if (!reportId || reportId === '-1') {
        setMedia([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getReportMediaByReportZId(reportId);
        if (!cancelled) {
          setMedia(Array.isArray(response?.media) ? response.media : []);
        }
      } catch (err) {
        if (!cancelled) {
          setMedia([]);
          setError(t('REPORT.MEDIA.ERROR'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [reportId, t]);

  const summaryMetrics = useMemo(() => {
    const videoCount = media.filter(item => item.type === 'video').length;
    const imageCount = media.filter(item => item.type === 'image').length;

    return [
      { label: t('REPORT.MEDIA.REPORT_ID'), value: reportId ?? '-' },
      { label: t('REPORT.MEDIA.TOTAL'), value: String(media.length) },
      { label: t('REPORT.MEDIA.VIDEOS'), value: String(videoCount) },
      { label: t('REPORT.MEDIA.IMAGES'), value: String(imageCount) }
    ];
  }, [media, reportId, t]);

  if (loading) {
    return (
      <Container fluid className="px-0">
        <ReportPanel title={t('REPORT.MEDIA.TITLE')} description={t('REPORT.MEDIA.DESCRIPTION')} accent="warm">
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t('REPORT.MEDIA.LOADING')}</span>
          </div>
        </ReportPanel>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title={t('REPORT.MEDIA.TITLE')}
            description={t('REPORT.MEDIA.DESCRIPTION')}
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
            {error ? (
              <Alert variant="warning" className="mt-4 mb-0">
                {error}
              </Alert>
            ) : null}
          </ReportPanel>
        </Col>

        {!error && media.length === 0 ? (
          <Col xs={12}>
            <ReportEmptyState message={t('REPORT.MEDIA.EMPTY')} />
          </Col>
        ) : null}

        {media.map(item => (
          <Col xs={12} lg={6} key={item.id}>
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '1.1rem' }}>
              <Card.Body className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <div className="fw-semibold">{item.filename}</div>
                    <div className="text-muted small">{item.url}</div>
                  </div>
                  <Badge bg={item.type === 'video' ? 'danger' : item.type === 'image' ? 'primary' : 'secondary'}>
                    {getMediaTypeLabel(item.type, t)}
                  </Badge>
                </div>

                <MediaPreview item={item} />

                <div className="d-flex justify-content-end">
                  <Button
                    as="a"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-primary"
                  >
                    {t('REPORT.MEDIA.OPEN')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

MediaReport.propTypes = {
  reportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

MediaReport.defaultProps = {
  reportId: null
};

export default MediaReport;
