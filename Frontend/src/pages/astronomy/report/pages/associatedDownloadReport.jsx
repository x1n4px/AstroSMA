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

function compactDateTime(date, time) {
  const rawDate = String(date || '').slice(0, 10).replaceAll('-', '');
  const rawTime = String(time || '').substring(0, 8).replaceAll(':', '');
  return `${rawDate}${rawTime}`;
}

function resolveStationNumbers(report) {
  return [
    report?.observatoryNumber ?? report?.Observatorio_Número ?? report?.stationNumber1,
    report?.observatoryNumber2 ?? report?.Observatorio_Número2 ?? report?.stationNumber2
  ].map(value => value ?? '');
}

function buildDownloadItems(report) {
  const timestamp = compactDateTime(report?.date ?? report?.Fecha, report?.time ?? report?.Hora);
  const [id1, id2] = resolveStationNumbers(report);
  const pair = `${id1}-${id2}`;

  return [
    {
      id: 'raw-measures',
      title: 'Medidas en bruto',
      apiButtonName: 'RAW_MEASURES',
      fileName: `Coordenadas-${timestamp}-${id1}.csv`,
      buttonText: 'Descargar datos en bruto del meteoro',
      description: 'Coordenadas celestes (acimut, distancia zenital, ascensión recta y declinación a la fecha) de los centroides de las trazas de los fotogramas individuales sin ajustar a una circunferencia máxima.'
    },
    {
      id: 'ufoorbit',
      title: 'UFOORBIT',
      apiButtonName: 'UFOORBIT',
      fileName: 'UFOORBIT.tgz',
      buttonText: 'Descargar archivo para UFOORBIT',
      description: 'Ficheros csv que pueden ser usados como entrada de datos para UFOORBIT (http://sonotaco.com/soft/e_index.html).'
    },
    {
      id: 'los',
      title: 'Líneas de visión (LoS)',
      apiButtonName: 'LOS',
      fileName: `Magnitudes-${timestamp}-${pair}`,
      buttonText: 'Descargar archivo LoS',
      description: 'Coordenadas ECI de la estación en movimiento con la rotación de la Tierra y coordenadas del centroide del meteoro en el mismo sistema.'
    },
    {
      id: 'wmpl',
      title: 'Western Meteor PyLib',
      apiButtonName: 'WMPL',
      fileName: 'wmpl.txt',
      buttonText: 'Descargar archivo para wmpl',
      description: 'Ficheros que sirven como entrada para WesternMeteorPyLib (https://github.com/wmpg/WesternMeteorPyLib).',
      secondaryButton: {
        apiButtonName: 'WMPL_PROGRAM',
        fileName: 'trayectorias-interactivo.py',
        buttonText: 'Descarga del programa Python'
      }
    },
    {
      id: 'meteortoolkit',
      title: 'Meteor ToolKit',
      apiButtonName: 'METEOR_TOOLKIT',
      fileName: `Gritsevivh-${timestamp}-${pair}`,
      buttonText: 'Descargar datos MeteorToolKit',
      description: 'Ficheros que contienen los datos de entrada del software Meteor ToolKit (https://sourceforge.net/projects/meteortoolkit/).'
    },
    {
      id: 'alpha-beta',
      title: 'Parámetros alpha-beta',
      apiButtonName: 'ALPHA_BETA',
      fileName: `alpha-beta-${timestamp}-${pair}.csv`,
      buttonText: 'Descargar datos para alpha-beta',
      description: 'Ficheros csv que pueden usarse para calcular parámetros alpha-beta con alpha_beta_modules_master (https://github.com/desertfireballnetwork/alpha_beta_modules).'
    }
  ];
}

const AssociatedDownloadReport = ({ report }) => {
  const { t } = useTranslation(['text']);
  const [loadingSoftware, setLoadingSoftware] = useState(null);
  const [error, setError] = useState(null);
  const downloadItems = buildDownloadItems(report);
  const downloadCount = downloadItems.reduce((count, item) => count + (item.secondaryButton ? 2 : 1), 0);

  const handleDownload = async (apiButtonName, fileNameToDownload) => {
    setLoadingSoftware(fileNameToDownload);
    setError(null);

    try {
      const fileData = await getOrbitFile(
        apiButtonName,
        report?.Fecha ?? report?.date,
        report?.Hora ?? report?.time,
        fileNameToDownload,
        report?.Observatorio_Número ?? report?.stationNumber1,
        report?.Observatorio_Número2 ?? report?.stationNumber2
      );

      const blob = fileData instanceof Blob
        ? fileData
        : new Blob([fileData], { type: 'application/octet-stream' });
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
        event_target: `Descarga datos asociados a ${apiButtonName} en /report/${report?.reportId ?? report?.IdInforme} en la pestaña de recursos`,
        report_id: report?.reportId ?? report?.IdInforme
      });
    } catch (err) {
      setError(t('REPORT.ASSOCIATED_DOWNLOAD_LINK.ERROR_GENERAL', { software: apiButtonName }));
    } finally {
      setLoadingSoftware(null);
    }
  };

  const summaryMetrics = [
    { label: 'Informe', value: report?.reportId ?? report?.IdInforme ?? '-' },
    { label: 'Descargas disponibles', value: downloadCount },
    { label: 'Estación 1', value: resolveStationNumbers(report)[0] || '-' },
    { label: 'Estación 2', value: resolveStationNumbers(report)[1] || '-' }
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

          return (
            <Col xs={12} md={6} key={item.id}>
              <ReportPanel title={item.title} description={item.description}>
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
                    item.buttonText
                  )}
                </Button>
                {item.secondaryButton ? (
                  <Button
                    className="ms-2"
                    variant="outline-secondary"
                    onClick={() => handleDownload(item.secondaryButton.apiButtonName, item.secondaryButton.fileName)}
                    disabled={loadingSoftware !== null}
                  >
                    {item.secondaryButton.buttonText}
                  </Button>
                ) : null}
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
