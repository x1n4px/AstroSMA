import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { audit } from '@/services/auditService';
import { useTranslation } from 'react-i18next';
import { getOrbitFile } from '@/services/fileService';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

const downloadItems = [
  {
    id: 'ufoorbit',
    apiButtonName: 'UFOORBIT',
    fileName: 'UFOORBIT.tgz',
    translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK',
    translationValues: { name: 'UFOORBIT' },
    description: 'Paquete comprimido listo para procesado orbital.'
  },
  {
    id: 'wmpl',
    apiButtonName: 'WMPL',
    fileName: 'wmpl.txt',
    translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK',
    translationValues: { name: 'WMPL' },
    description: 'Exportacion textual adaptada al flujo WMPL.'
  },
  {
    id: 'gritsevich',
    apiButtonName: 'GRITSEVICH',
    fileName: 'Gritsevich.zip',
    translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK',
    translationValues: { name: 'Gritsevich' },
    description: 'Datos preparados para analisis por el metodo de Gritsevich.'
  },
  {
    id: 'meteorglow',
    apiButtonName: 'METEORGLOW',
    fileName: 'MeteorGlow_data.zip',
    translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.METEOR_GLOW',
    translationValues: {},
    description: 'Conjunto de datos exportado para MeteorGlow.'
  },
  {
    id: 'rawdata',
    apiButtonName: 'RAWDATA',
    fileName: 'RawData.zip',
    translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.RAW_DATA',
    translationValues: {},
    description: 'Datos brutos asociados al informe.'
  }
];

const AssociatedDownloadReport = ({ report }) => {
  const { t } = useTranslation(['text']);
  const [loadingSoftware, setLoadingSoftware] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async (apiButtonName, fileNameToDownload) => {
    setLoadingSoftware(fileNameToDownload);
    setError(null);

    try {
      const fileData = await getOrbitFile(
        apiButtonName,
        report.Fecha,
        report.Hora,
        fileNameToDownload,
        report.Observatorio_Número,
        report.Observatorio_Número2
      );

      const blob = new Blob([fileData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameToDownload;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

      await audit({
        isGuest: false,
        isMobile,
        button_name: apiButtonName,
        event_type: 'DOWNLOAD',
        event_target: `Descarga datos asociados a ${apiButtonName} en /report/${report.IdInforme} en la pestaña de descargar informe asociado`,
        report_id: report.IdInforme
      });
    } catch (err) {
      setError(t('REPORT.ASSOCIATED_DOWNLOAD_LINK.ERROR_GENERAL', { software: apiButtonName }));
    } finally {
      setLoadingSoftware(null);
    }
  };

  const summaryMetrics = [
    { label: 'Informe', value: report?.IdInforme ?? '-' },
    { label: 'Paquetes disponibles', value: downloadItems.length },
    { label: 'Estacion 1', value: report?.Observatorio_Número ?? '-' },
    { label: 'Estacion 2', value: report?.Observatorio_Número2 ?? '-' }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title={t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}
            description={t('REPORT.ASSOCIATED_DOWNLOAD_LINK.DESCRIPTION')}
            accent="warm"
          >
            <ReportMetricsGrid>
              {summaryMetrics.map(metric => (
                <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </ReportMetricsGrid>
            {error ? (
              <Alert variant="danger" onClose={() => setError(null)} dismissible className="mt-4 mb-0">
                {error}
              </Alert>
            ) : null}
          </ReportPanel>
        </Col>

        {downloadItems.map(item => {
          const isLoading = loadingSoftware === item.fileName;
          const title = item.translationValues?.name ? item.translationValues.name : t(item.translationKey);

          return (
            <Col xs={12} md={6} key={item.id}>
              <ReportPanel title={title} description={item.description}>
                <Button
                  style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                  onClick={() => handleDownload(item.apiButtonName, item.fileName)}
                  disabled={isLoading || (loadingSoftware !== null && loadingSoftware !== item.fileName)}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LOADING_TEXT')}</span>
                    </>
                  ) : (
                    t(item.translationKey, item.translationValues)
                  )}
                </Button>
              </ReportPanel>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

AssociatedDownloadReport.propTypes = {
  report: PropTypes.object
};

AssociatedDownloadReport.defaultProps = {
  report: null
};

export default AssociatedDownloadReport;
