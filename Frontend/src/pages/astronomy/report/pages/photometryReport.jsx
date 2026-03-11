import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPhotometryFromId } from '@/services/photometryService.jsx';
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setPhotometryCData(null);
        setRegressionData([]);
        setMeteorData(null);
        setAdjustmenPoints([]);
      }
    };

    if (isChild === false && id !== '-1') {
      fetchData(id);
    } else if (selectedId) {
      fetchData(selectedId);
    }
  }, [selectedId, isChild, id]);

  const summaryMetrics = useMemo(() => {
    if (!photometryCData) {
      return [];
    }

    return [
      { label: t('REPORT.PHOTOMETRY.INPUT.DATE'), value: photometryCData.Fecha },
      { label: t('REPORT.PHOTOMETRY.INPUT.HOUR'), value: photometryCData.Hora },
      { label: t('REPORT.PHOTOMETRY.INPUT.VISIBLE_STARS'), value: photometryCData.Estrellas_visibles },
      { label: t('REPORT.PHOTOMETRY.INPUT.STAR_USED_IN_REGRESSION'), value: photometryCData.Estrellas_usadas_para_regresion },
      { label: 'Puntos de regresion', value: regressionData.length },
      { label: 'Puntos de ajuste', value: adjustmenPoints.length }
    ];
  }, [adjustmenPoints.length, photometryCData, regressionData.length, t]);

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

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        {isChild !== false ? (
          <Col xs={12}>
            <ReportPanel title={t('REPORT.PHOTOMETRY.TITLE')} description="Selecciona un informe de fotometria asociado para cargar sus datos." accent="warm">
              <ReportSelectField
                label="Selecciona un ID"
                value={selectedId}
                onChange={event => setSelectedId(event.target.value)}
              >
                <option value="">Selecciona un ID</option>
                {photometryData.map(item => (
                  <option key={item.Identificador} value={item.Identificador}>
                    {item.Identificador}
                  </option>
                ))}
              </ReportSelectField>
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
                title={isChild !== false ? `Fotometria ${selectedId}` : t('REPORT.PHOTOMETRY.TITLE', { id })}
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

            <Col xs={12} lg={6}>
              <ReportPanel title="Calibracion fotometrica" description="Parametros principales del ajuste de Bouguer y de la regresion.">
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.DATE')} value={photometryCData.Fecha} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.HOUR')} value={photometryCData.Hora} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.VISIBLE_STARS')} value={photometryCData.Estrellas_visibles} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.STAR_USED_IN_REGRESSION')} value={photometryCData.Estrellas_usadas_para_regresion} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_EXTERNAL')} value={photometryCData.Coeficiente_externo_Recta_de_Bouger} />
              </ReportPanel>
            </Col>

            <Col xs={12} lg={6}>
              <ReportPanel title="Errores y coeficientes" description="Medidas de error tipico y coeficientes asociados al modelo.">
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.BOUGER_LINE_ZERO')} value={photometryCData.Punto_cero_Recta_de_Bouger} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.REGRESSION_STANDART_ERROR')} value={photometryCData.Error_tipico_regresion} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.STANDART_ZERO_POINT')} value={photometryCData.Error_tipico_punto_cero} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.STANDART_ERROR_EXTERNAL_COEFF')} value={photometryCData.Error_tipico_coeficiente_externo} />
                <ReportField label={t('REPORT.PHOTOMETRY.INPUT.PATH_PARABOLA_COEFF')} value={photometryCData.Coeficientes_parabola_trayectoria} />
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
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.X_START')} value={meteorData.X_Inicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.Y_START')} value={meteorData.Y_Inicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_START')} value={meteorData.Maire_Inicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_START')} value={meteorData.distInicio} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.X_END')} value={meteorData.X_Final} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.Y_END')} value={meteorData.Y_Final} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.AIR_MASS_END')} value={meteorData.Maire_Final} />
                    <ReportMetricCard label={t('REPORT.PHOTOMETRY.METEOR_DATA.DISTANCE_END')} value={meteorData.dist_Final} />
                  </ReportMetricsGrid>
                ) : (
                  <ReportEmptyState message="No hay datos del meteoro para este bloque fotometrico." />
                )}
              </ReportPanel>
            </Col>

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
