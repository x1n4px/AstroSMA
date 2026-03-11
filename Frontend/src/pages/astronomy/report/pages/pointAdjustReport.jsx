import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import formatDate from '@/pipe/formatDate.jsx';
import truncateDecimal from '@/pipe/truncateDecimal';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportTableShell,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function DataTable({ columns, rows, rowKey }) {
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
            <tr key={rowKey(row, index)}>
              {columns.map(column => (
                <td key={column.key}>{column.render(row, index)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </ReportTableShell>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowKey: PropTypes.func.isRequired
};

const PointAdjustReport = ({ zwoAdjustmentPoints, regressionTrajectory, trajectoryData }) => {
  const { t } = useTranslation(['text']);

  const summaryMetrics = [
    { label: 'Puntos ZWO', value: zwoAdjustmentPoints.length },
    { label: 'Puntos de regresion', value: regressionTrajectory.length },
    { label: 'Puntos de trayectoria', value: trajectoryData.length }
  ];

  const zwoColumns = [
    { key: 'date', label: t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.DATE'), render: row => formatDate(row.Fecha) },
    { key: 'hour', label: t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.HOUR'), render: row => new Date(`1970-01-01T${row.Hora}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
    { key: 'ar', label: t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.Ar_Grados'), render: row => truncateDecimal(row.Ar_Grados) },
    { key: 'de', label: t('REPORT.POINT_ADJUST.ZWO.TABLE.HEADER.De_Grados'), render: row => truncateDecimal(row.De_Grados) }
  ];

  const regressionColumns = [
    { key: 'date', label: t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.DATE'), render: row => formatDate(row.Fecha) },
    { key: 'hour', label: t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.HOUR'), render: row => row.Hora },
    { key: 't', label: t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.t'), render: row => truncateDecimal(row.t) },
    { key: 's', label: t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.s'), render: row => truncateDecimal(row.s) },
    { key: 'v', label: t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TABLE.HEADER.v'), render: row => truncateDecimal(row.v_Kms) }
  ];

  const trajectoryColumns = [
    { key: 'date', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DATE'), render: row => formatDate(row.Fecha) },
    { key: 'hour', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.HOUR'), render: row => row.Hora },
    { key: 's', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.S'), render: row => truncateDecimal(row.s) },
    { key: 't', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.T'), render: row => truncateDecimal(row.t) },
    { key: 'v', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.V'), render: row => truncateDecimal(row.v) },
    { key: 'lambda', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.LAMBDA'), render: row => truncateDecimal(row.lambda) },
    { key: 'phi', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.PHI'), render: row => truncateDecimal(row.phi) },
    { key: 'ra1', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', { id: '1' }), render: row => truncateDecimal(row.AR_Estacion_1) },
    { key: 'de1', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', { id: '1' }), render: row => truncateDecimal(row.De_Estacion_1) },
    { key: 'ra2', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.RA', { id: '2' }), render: row => truncateDecimal(row.Ar_Estacion_2) },
    { key: 'de2', label: t('REPORT.POINT_ADJUST.TRAJECTORY.TABLE.HEADER.DE', { id: '2' }), render: row => truncateDecimal(row.De_Estacion_2) }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Resumen de ajuste"
            description="Inventario de puntos utilizados para ajuste, regresion y trayectoria observada."
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
          <ReportPanel title={t('REPORT.POINT_ADJUST.ZWO.TITLE')} description="Puntos de ajuste ZWO utilizados para calibracion angular.">
            {zwoAdjustmentPoints.length > 0 ? (
              <DataTable
                columns={zwoColumns}
                rows={zwoAdjustmentPoints}
                rowKey={(row, index) => `${row.Fecha}-${row.X}-${index}`}
              />
            ) : (
              <ReportEmptyState message="No hay puntos ZWO disponibles." />
            )}
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel title={t('REPORT.POINT_ADJUST.REGRESSION_TRAJECTORY.TITLE')} description="Serie temporal derivada por regresion para la trayectoria.">
            {regressionTrajectory.length > 0 ? (
              <DataTable
                columns={regressionColumns}
                rows={regressionTrajectory}
                rowKey={(row, index) => `${row.Fecha}-${row.t}-${index}`}
              />
            ) : (
              <ReportEmptyState message="No hay puntos de regresion disponibles." />
            )}
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel title={t('REPORT.POINT_ADJUST.TRAJECTORY.TITLE')} description="Detalle completo de la trayectoria medida y sus coordenadas derivadas.">
            {trajectoryData.length > 0 ? (
              <DataTable
                columns={trajectoryColumns}
                rows={trajectoryData}
                rowKey={(row, index) => `${row.Fecha}-${row.s}-${index}`}
              />
            ) : (
              <ReportEmptyState message="No hay puntos de trayectoria disponibles." />
            )}
          </ReportPanel>
        </Col>
      </Row>
    </Container>
  );
};

PointAdjustReport.propTypes = {
  zwoAdjustmentPoints: PropTypes.arrayOf(PropTypes.object),
  regressionTrajectory: PropTypes.arrayOf(PropTypes.object),
  trajectoryData: PropTypes.arrayOf(PropTypes.object)
};

PointAdjustReport.defaultProps = {
  zwoAdjustmentPoints: [],
  regressionTrajectory: [],
  trajectoryData: []
};

export default PointAdjustReport;
