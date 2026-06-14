import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/pipe/formatDate.jsx';
import { getRelatedReportsByReportZId } from '@/services/reportService.jsx';
import { getBolideWithCustomSearch, getReportData } from '@/services/bolideService.jsx';
import { ReportPanel, ReportEmptyState, ReportTableShell } from '@/pages/astronomy/report/components/ReportSurface.jsx';

function resolveReportPath(report) {
  if (report.reportType === 'RADIANT') {
    return `/radiant-report/${report.reportId}`;
  }

  return `/report/${report.reportId}/RADIANT`;
}

function formatTime(value) {
  if (!value) return '-';
  const normalized = String(value).trim();
  return normalized.substring(0, 8);
}

function normalizeRelatedReportsFromBolidePayload(reportDataPayload, currentReportId) {
  const zReports = (reportDataPayload?.reportData || [])
    .filter((item) => Number(item?.IdInforme) !== Number(currentReportId))
    .map((item) => ({
      reportType: 'REPORT_Z',
      reportId: item.IdInforme,
      date: item.Fecha,
      time: item.Hora,
      primaryStation: item.Ob1,
      secondaryStation: item.Ob2
    }));

  const radiantReports = (reportDataPayload?.reportDataRadiant || []).map((item) => ({
    reportType: 'RADIANT',
    reportId: item.Identificador,
    date: item.Fecha,
    time: item.Hora,
    primaryStation: item.Ob2,
    secondaryStation: null
  }));

  const merged = [...zReports, ...radiantReports];

  return merged.sort((a, b) => {
    const aTime = new Date(`${String(a.date).slice(0, 10)}T${formatTime(a.time) || '00:00:00'}Z`).getTime();
    const bTime = new Date(`${String(b.date).slice(0, 10)}T${formatTime(b.time) || '00:00:00'}Z`).getTime();
    return bTime - aTime;
  });
}

function RelatedReportsTab({ reportId, meteorId: meteorIdFromReport, currentReportType }) {
  const { t } = useTranslation(['text']);
  const [relatedReports, setRelatedReports] = useState([]);
  const [meteorId, setMeteorId] = useState(meteorIdFromReport ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRelatedReports = async () => {
      setLoading(true);
      setError(null);

      try {
        let resolvedMeteorId = meteorIdFromReport;
        let endpointReports = [];

        // Solo en /report (dos estaciones) intentamos el endpoint dedicado
        if (currentReportType === 'REPORT_Z') {
          const response = await getRelatedReportsByReportZId(reportId);
          if (cancelled) return;
          resolvedMeteorId = response?.meteorId ?? meteorIdFromReport;
          setMeteorId(resolvedMeteorId ?? null);
          endpointReports = Array.isArray(response?.reports) ? response.reports : [];
        }

        if (endpointReports.length > 0) {
          const filtered = endpointReports.filter((item) => {
            if (currentReportType === 'RADIANT' && item.reportType === 'RADIANT') {
              return Number(item.reportId) !== Number(reportId);
            }
            return true;
          });
          setRelatedReports(filtered);
          return;
        }

        if (!resolvedMeteorId) {
          setRelatedReports([]);
          return;
        }

        const searchResponse = await getBolideWithCustomSearch({
          actualPage: 0,
          meteorIdFilter: resolvedMeteorId
        });

        const row = Array.isArray(searchResponse?.data) ? searchResponse.data[0] : null;
        if (!row) {
          setRelatedReports([]);
          return;
        }

        const reportPayload = await getReportData({
          IDs_Informe_Z: row?.IDs_Informe_Z || '',
          IDs_Informe_Radiante: row?.IDs_Informe_Radiante || '',
          IDs_Informe_Fotometria: ''
        });

        const normalized = normalizeRelatedReportsFromBolidePayload(reportPayload, reportId ?? null);
        const filtered = normalized.filter((item) => {
          if (currentReportType === 'RADIANT' && item.reportType === 'RADIANT') {
            return Number(item.reportId) !== Number(reportId);
          }
          return true;
        });
        setRelatedReports(filtered);
      } catch (err) {
        if (cancelled) return;
        // Si falla el endpoint dedicado, intentamos recuperar por meteorId recibido en reportData
        try {
          if (!meteorIdFromReport) {
            setError(err);
            return;
          }

          const searchResponse = await getBolideWithCustomSearch({
            actualPage: 0,
            meteorIdFilter: meteorIdFromReport
          });

          const row = Array.isArray(searchResponse?.data) ? searchResponse.data[0] : null;
          if (!row) {
            setRelatedReports([]);
            return;
          }

          const reportPayload = await getReportData({
            IDs_Informe_Z: row?.IDs_Informe_Z || '',
            IDs_Informe_Radiante: row?.IDs_Informe_Radiante || '',
            IDs_Informe_Fotometria: ''
          });

          const normalized = normalizeRelatedReportsFromBolidePayload(reportPayload, reportId ?? null);
          const filtered = normalized.filter((item) => {
            if (currentReportType === 'RADIANT' && item.reportType === 'RADIANT') {
              return Number(item.reportId) !== Number(reportId);
            }
            return true;
          });
          setRelatedReports(filtered);
        } catch (fallbackError) {
          setError(fallbackError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (reportId || meteorIdFromReport) {
      fetchRelatedReports();
    } else {
      setLoading(false);
      setRelatedReports([]);
    }

    return () => {
      cancelled = true;
    };
  }, [reportId, meteorIdFromReport, currentReportType]);

  const rows = useMemo(() => {
    return relatedReports.map((item) => ({
      ...item,
      path: resolveReportPath(item),
      typeLabel: item.reportType === 'RADIANT'
        ? t('CUSTOMIZE_SEARCH.REPORT_RADIANT')
        : t('CUSTOMIZE_SEARCH.REPORT_Z')
    }));
  }, [relatedReports, t]);

  if (loading) {
    return <ReportEmptyState message={t('REPORT.RELATED_REPORTS.LOADING')} />;
  }

  if (error) {
    return <ReportEmptyState message={t('REPORT.RELATED_REPORTS.ERROR')} />;
  }

  return (
    <ReportPanel
      title={t('REPORT.RELATED_REPORTS.TITLE')}
      description={t('REPORT.RELATED_REPORTS.DESCRIPTION', { meteorId: meteorId ?? '-' })}
      accent="cool"
    >
      {meteorId ? (
        <div className="mb-3">
          <Link to={`/bolide/${meteorId}`}>{t('REPORT.RELATED_REPORTS.METEOR_PAGE')}</Link>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <ReportEmptyState message={t('REPORT.RELATED_REPORTS.EMPTY')} />
      ) : (
        <ReportTableShell>
          <Table responsive className="mb-0">
            <thead>
              <tr>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.TYPE')}</th>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.ID')}</th>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.DATE')}</th>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.TIME')}</th>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.STATION')}</th>
                <th>{t('REPORT.RELATED_REPORTS.TABLE.ACTION')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((report) => (
                <tr key={`${report.reportType}-${report.reportId}`}>
                  <td>{report.typeLabel}</td>
                  <td>{report.reportId}</td>
                  <td>{formatDate(report.date)}</td>
                  <td>{formatTime(report.time)}</td>
                  <td>{report.secondaryStation ? `${report.primaryStation} / ${report.secondaryStation}` : report.primaryStation || '-'}</td>
                  <td>
                    <Link to={report.path}>{t('REPORT.RELATED_REPORTS.OPEN')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ReportTableShell>
      )}
    </ReportPanel>
  );
}

RelatedReportsTab.propTypes = {
  reportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  meteorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentReportType: PropTypes.oneOf(['REPORT_Z', 'RADIANT', 'METEOR'])
};

RelatedReportsTab.defaultProps = {
  reportId: null,
  meteorId: null,
  currentReportType: 'REPORT_Z'
};

export default RelatedReportsTab;
