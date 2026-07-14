import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPhotometryFromId, getPhotometryGraph } from '@/services/photometryService.jsx';
import truncateDecimal from '@/pipe/truncateDecimal';
import { buildPhotometryEventTitle } from '@/utils/photometryReportTitle';
import {
  ReportPanel,
  ReportField,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportSelectField,
  ReportTableShell,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function TableBlock({ columns, rows }) {
  return (
    <ReportTableShell>
      <Table hover responsive className="mb-0 align-middle">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${columns[0].key}-${index}`}>
              {columns.map(column => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </ReportTableShell>
  );
}

function round(value, decimalPlaces) {
  return truncateDecimal(value, decimalPlaces);
}

function formatMovementCoefficients(value) {
  if (!value) {
    return '-';
  }

  return String(value)
    .trim()
    .split(/\s+/)
    .map(coefficient => round(coefficient, 4))
    .join(' / ');
}

TableBlock.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired
};

const PhotometryReport = ({ photometryData, isChild }) => {
  const { t } = useTranslation(['text']);
  const [selectedId, setSelectedId] = useState('');
  const [photometryCData, setPhotometryCData] = useState(null);
  const [regressionData, setRegressionData] = useState([]);
  const [meteorData, setMeteorData] = useState(null);
  const [adjustmenPoints, setAdjustmenPoints] = useState([]);
  const [graphUrl, setGraphUrl] = useState('');

  const params = useParams();
  const id = params?.reportId || '-1';

  useEffect(() => {
    const fetchData = async currentId => {
      try {
        const response = await getPhotometryFromId(currentId);
        setPhotometryCData(response.photometry);
        setRegressionData(response.regressionStart || []);
        setMeteorData(response.meteor || null);
        setAdjustmenPoints(response.adjustPoint || []);

        try {
          const graphBlob = await getPhotometryGraph(currentId);
          setGraphUrl(currentUrl => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }
            return URL.createObjectURL(graphBlob);
          });
        } catch {
          setGraphUrl(currentUrl => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }
            return '';
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPhotometryCData(null);
        setRegressionData([]);
        setMeteorData(null);
        setAdjustmenPoints([]);
        setGraphUrl('');
      }
    };

    if (isChild === false && id !== '-1') {
      fetchData(id);
    } else if (selectedId) {
      fetchData(selectedId);
    }
  }, [selectedId, isChild, id]);

  useEffect(() => () => {
    if (graphUrl) {
      URL.revokeObjectURL(graphUrl);
    }
  }, [graphUrl]);

  const selectedPhotometry = photometryData.find(item => String(item.Identificador) === String(selectedId));
  const selectedStations = [selectedPhotometry?.station1, selectedPhotometry?.station2]
    .filter(Boolean)
    .join(' - ');
  const eventTitle = buildPhotometryEventTitle(photometryCData || selectedPhotometry);

  const summaryMetrics = useMemo(() => {
    if (!photometryCData) {
      return [];
    }

    return [
      { label: t('REPORT.PHOTOMETRY.INPUT.VISIBLE_STARS'), value: photometryCData.Estrellas_visibles },
      { label: t('REPORT.PHOTOMETRY.INPUT.STAR_USED_IN_REGRESSION'), value: photometryCData.Estrellas_usadas_para_regresion },
      { label: 'Puntos de ajuste', value: adjustmenPoints.length },
      { label: 'Magnitud máxima', value: round(photometryCData.MagMax, 2) },
      { label: 'Magnitud mínima', value: round(photometryCData.MagMin, 2) },
      { label: 'Masa fotométrica (gramos)', value: round(photometryCData.Masa_fotometrica, 2) }
    ];
  }, [adjustmenPoints.length, photometryCData, t]);

  const regressionColumns = [
    { key: 'id', label: t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.START_ID'), render: row => row.Id_estrella },
    { key: 'airmass', label: t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.AIR_MASS'), render: row => row.Masa_de_aire },
    { key: 'catalog', label: t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.CATALOG_MAGNITUDE'), render: row => row.Magnitud_de_catalogo },
    { key: 'instrumental', label: t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.INSTRUMENTAL_MAGNITUDE'), render: row => row.Magnitud_instrumental }
  ];

  const adjustmentColumns = [
    { key: 't', label: t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.T'), render: row => row.t },
    { key: 'dist', label: t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.DISTANCE'), render: row => row.Dist },
    { key: 'mc', label: t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.MC'), render: row => row.Mc },
    { key: 'ma', label: t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.MA'), render: row => row.Ma }
  ];

  const content = (
    <Container fluid className="px-0">
      <Row className="g-4">
        {isChild !== false ? (
          <Col xs={12}>
            <ReportPanel title={eventTitle || t('REPORT.PHOTOMETRY.TITLE')} description="Selecciona un informe de fotometria asociado para cargar sus datos." accent="warm">
              <ReportSelectField
                label="Selecciona un ID"
                value={selectedId}
                onChange={event => setSelectedId(event.target.value)}
              >
                <option value="">Selecciona un ID</option>
                {photometryData.map(item => (
                  <option key={item.Identificador} value={item.Identificador}>
                    {item.Identificador}{item.station1 ? ` - ${item.station1}` : ''}
                  </option>
                ))}
              </ReportSelectField>
              {selectedStations ? <p className="mb-0 mt-3 text-muted">Estaciones: {selectedStations}</p> : null}
            </ReportPanel>
          </Col>
        ) : null}

        {!photometryCData ? (
          <Col xs={12}>
            <ReportEmptyState
              message={selectedId
                ? `ID seleccionado: ${selectedId}, no encontrado.`
                : 'No hay datos de fotometria cargados para este informe.'}
            />
          </Col>
        ) : (
          <>
            <Col xs={12}>
              <ReportPanel
                title="Resumen fotométrico"
                description="Resumen general del ajuste fotometrico y de sus tablas derivadas."
                accent="warm"
              >
                <ReportMetricsGrid>
                  {summaryMetrics.map(metric => (
                    <ReportMetricCard key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </ReportMetricsGrid>
              </ReportPanel>
            </Col>

            <Col xs={12}>
              <ReportPanel title="Calibracion fotometrica" description="Parametros principales del ajuste de Bouguer, errores y coeficientes asociados al modelo.">
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_EXTERNAL')} value={round(photometryCData.Coeficiente_externo_Recta_de_Bouger, 4)} />
                  </Col>
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_ZERO')} value={round(photometryCData.Punto_cero_Recta_de_Bouger, 4)} />
                  </Col>
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.REGRESSION_STANDART_ERROR')} value={round(photometryCData.Error_tipico_regresion, 4)} />
                  </Col>
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.STANDART_ZERO_POINT')} value={round(photometryCData.Error_tipico_punto_cero, 4)} />
                  </Col>
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.STANDART_ERROR_EXTERNAL_COEFF')} value={round(photometryCData.Error_tipico_coeficiente_externo, 4)} />
                  </Col>
                  <Col xs={12} md={6}>
                    <ReportField className="mb-0" label={t('REPORT.PHOTOMETRY.INPUT.PATH_PARABOLA_COEFF')} value={formatMovementCoefficients(photometryCData.Coeficientes_parabola_trayectoria)} />
                  </Col>
                </Row>
              </ReportPanel>
            </Col>

            <Col xs={12}>
              <ReportPanel title={t('REPORT.PHOTOMETRY.REGRESSION_DATA_TAB.TITLE')} description="Estrellas utilizadas en la regresion y sus magnitudes asociadas.">
                {regressionData.length > 0 ? (
                  <TableBlock columns={regressionColumns} rows={regressionData} />
                ) : (
                  <ReportEmptyState message="No hay datos de regresion fotometrica." />
                )}
              </ReportPanel>
            </Col>

            <Col xs={12}>
              <ReportPanel title={t('REPORT.PHOTOMETRY.METEOR_DATA.TITLE')} description="Valores resumidos del meteoro al inicio y al final de la trayectoria fotometrica.">
                {meteorData ? (
                  <ReportMetricsGrid>
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_START')} value={meteorData.Maire_Inicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_START')} value={meteorData.distInicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_END')} value={meteorData.Maire_Final} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_END')} value={meteorData.dist_Final} />
                  </ReportMetricsGrid>
                ) : (
                  <ReportEmptyState message="No hay datos del meteoro para este bloque fotometrico." />
                )}
              </ReportPanel>
            </Col>

            {graphUrl ? (
              <Col xs={12}>
                <ReportPanel title="Gráfico de fotometría" description="Gráfico JPG asociado al informe fotométrico seleccionado.">
                  <img
                    src={graphUrl}
                    alt={`Gráfico de fotometría ${selectedId || id}`}
                    className="img-fluid d-block"
                    style={{ maxHeight: '48rem', margin: '0 auto' }}
                  />
                </ReportPanel>
              </Col>
            ) : null}

            <Col xs={12}>
              <ReportPanel title={t('REPORT.PHOTOMETRY.ADJUSTEMENT_POINT.TITLE')} description="Puntos de ajuste fotometrico a lo largo del evento.">
                {adjustmenPoints.length > 0 ? (
                  <TableBlock columns={adjustmentColumns} rows={adjustmenPoints} />
                ) : (
                  <ReportEmptyState message="No hay puntos de ajuste fotometrico." />
                )}
              </ReportPanel>
            </Col>
          </>
        )}
      </Row>
    </Container>
  );

  if (isChild !== false) {
    return content;
  }

  return (
    <Container>
      <Row className="mb-4">
        <div className="p-4">
          <Row className="justify-content-between align-items-center mb-4">
            <Col xs="auto">
              <h1>{eventTitle || 'Cargando...'}</h1>
            </Col>
          </Row>
          {content}
        </div>
      </Row>
    </Container>
  );
};

PhotometryReport.propTypes = {
  photometryData: PropTypes.arrayOf(PropTypes.object),
  isChild: PropTypes.bool
};

PhotometryReport.defaultProps = {
  photometryData: [],
  isChild: false
};

export default PhotometryReport;
