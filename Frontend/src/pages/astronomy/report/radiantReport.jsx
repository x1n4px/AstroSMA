import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getRadiantReport } from '@/services/radiantReportService';
import ActiveRain from '@/pages/astronomy/report/pages/activeRain.jsx';
import RelatedReportsTab from '@/pages/astronomy/report/pages/relatedReportsTab.jsx';
import { formatDate } from '@/pipe/formatDate.jsx';
import { AstronomyLoader } from '@/components/loader/AstronomyLoader.jsx';
import {
  ReportPanel,
  ReportMetricsGrid,
  ReportMetricCard,
  ReportTableShell,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function formatTime(value) {
  if (!value) return '-';
  return String(value).substring(0, 8);
}

function RadiantReport() {
  const { t } = useTranslation(['text']);
  const params = useParams();
  const id = params?.reportId || '-1';

  const [reportData, setReportData] = useState(null);
  const [angularVelocity, setAngularVelocity] = useState([]);
  const [activeShowerData, setActiveShowerData] = useState([]);
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRadiantReport(id);
        if (cancelled) return;

        setReportData(response?.report || null);
        setAngularVelocity(Array.isArray(response?.angularVelocity) ? response.angularVelocity : []);
        setActiveShowerData(Array.isArray(response?.activeShower) ? response.activeShower : []);
        setTrajectoryData(Array.isArray(response?.trajectory) ? response.trajectory : []);
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id && id !== '-1') {
      fetchReportData();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const summaryMetrics = useMemo(() => {
    if (!reportData) return [];

    return [
      { label: t('REPORT.RELATED_REPORTS.TABLE.ID'), value: reportData.id ?? '-' },
      { label: t('REPORT.ESTIMATED_TRAJECTORY.VELOCITY'), value: reportData.associatedShowerVelocity ?? '-' },
      { label: t('REPORT.ACTIVE_RAIN.TABLE.DATE'), value: formatDate(reportData.date) || '-' },
      { label: t('REPORT.RELATED_REPORTS.TABLE.TIME'), value: formatTime(reportData.time) },
      { label: t('REPORT.ANGULAR_VELOCITY.TITLE'), value: reportData.angularVelocityDegSec ?? '-' },
      { label: t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '' }), value: reportData.angularDistanceDegrees ?? '-' }
    ];
  }, [reportData, t]);

  if (loading) {
    return <AstronomyLoader />;
  }

  if (error) {
    return <Container className="py-4"><ReportEmptyState message="No se pudo cargar el informe radiante." /></Container>;
  }

  if (!reportData) {
    return <Container className="py-4"><ReportEmptyState message="No hay datos del informe radiante." /></Container>;
  }

  return (
    <Container fluid className="px-3 px-md-4 py-3">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title={`${t('REPORT.TITLE_RADIAN', { id: reportData.id || '' })} ${formatDate(reportData.date)} ${formatTime(reportData.time)}`}
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map((metric) => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel title={t('REPORT.ACTIVE_RAIN.TITLE')} accent="cool">
            <ActiveRain activeShowerData={activeShowerData} reportType="2" />
          </ReportPanel>
        </Col>

        <Col xs={12} xl={8}>
          <ReportPanel title={t('REPORT.ESTIMATED_TRAJECTORY.TITLE')}>
            {trajectoryData.length === 0 ? (
              <ReportEmptyState message={t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')} />
            ) : (
              <ReportTableShell>
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.VELOCITY')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_LON')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_LAT')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_ALT')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.INITIAL_DIST')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_LON')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_LAT')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_ALT')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.FINAL_DIST')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.RECOR')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.E')}</th>
                      <th>{t('REPORT.ESTIMATED_TRAJECTORY.T')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trajectoryData.map((row, index) => (
                      <tr key={`trajectory-${index}`}>
                        <td>{row.Velocidad}</td>
                        <td>{row.Lon_Inicio}</td>
                        <td>{row.Lat_Inicio}</td>
                        <td>{row.Alt_Inicio}</td>
                        <td>{row.Dist_Inicio}</td>
                        <td>{row.Lon_Final}</td>
                        <td>{row.Lat_Final}</td>
                        <td>{row.Alt_Final}</td>
                        <td>{row.Dist_Final}</td>
                        <td>{row.Recor}</td>
                        <td>{row.e}</td>
                        <td>{row.t}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ReportTableShell>
            )}
          </ReportPanel>
        </Col>

        <Col xs={12} xl={4}>
          <ReportPanel title={t('REPORT.ANGULAR_VELOCITY.TITLE')} accent="neutral">
            {angularVelocity.length === 0 ? (
              <ReportEmptyState message={t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')} />
            ) : (
              <ReportTableShell>
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('REPORT.ANGULAR_VELOCITY.HI')}</th>
                      <th>{t('REPORT.ANGULAR_VELOCITY.SHOWER')}</th>
                      <th>{t('REPORT.ANGULAR_VELOCITY.METEOR')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {angularVelocity.map((row, index) => (
                      <tr key={`angular-${index}`}>
                        <td>{row.hi}</td>
                        <td>{row.Lluvia}</td>
                        <td>{row.Meteoro}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ReportTableShell>
            )}
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <RelatedReportsTab
            reportId={id}
            meteorId={reportData?.meteorId}
            currentReportType="RADIANT"
          />
        </Col>
      </Row>
    </Container>
  );
}

export default RadiantReport;
