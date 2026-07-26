import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Table } from 'react-bootstrap';
import formatDate from '@/pipe/formatDate.jsx';
import truncateDecimal from '@/pipe/truncateDecimal';
import {
  ReportPanel,
  ReportMetricCard,
  ReportMetricsGrid,
  ReportTableShell,
  ReportEmptyState
} from '@/pages/astronomy/report/components/ReportSurface.jsx';

function DataTable({ columns, rows, rowKey, tableClassName }) {
  return (
    <ReportTableShell>
      <Table hover responsive className={`mb-0 align-middle ${tableClassName}`.trim()}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} style={{ textTransform: 'none' }}>{column.label}</th>
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
  rowKey: PropTypes.func.isRequired,
  tableClassName: PropTypes.string
};

DataTable.defaultProps = {
  tableClassName: ''
};

function formatFitsDateTime(row) {
  const date = formatDate(row.Fecha);
  const time = String(row.Hora || '').trim();
  return date && time ? `${date}T${time}` : date || time || '-';
}

const PointAdjustReport = ({ regressionTrajectory, trajectoryData }) => {
  const summaryMetrics = [
    { label: 'Número de fotogramas usados para trayectoria', value: trajectoryData.length },
    { label: 'Número de fotogramas usados para velocidad', value: regressionTrajectory.length }
  ];

  const regressionColumns = [
    { key: 'dateTime', label: 'Fecha/hora', render: row => <span className="text-nowrap">{formatFitsDateTime(row)}</span> },
    { key: 't', label: 't (segundos)', render: row => truncateDecimal(row.t) },
    { key: 's', label: 's (Km)', render: row => truncateDecimal(row.s) },
    { key: 'v', label: 'v (Km/s)', render: row => truncateDecimal(row.v_Kms) }
  ];

  const trajectoryColumns = [
    { key: 'dateTime', label: 'Fecha/hora', render: row => <span className="text-nowrap">{formatFitsDateTime(row)}</span> },
    { key: 's', label: 's (Km)', render: row => truncateDecimal(row.s) },
    { key: 't', label: 't (segundos)', render: row => truncateDecimal(row.t) },
    { key: 'v', label: 'v (Km/s)', render: row => truncateDecimal(row.v) },
    { key: 'lambda', label: 'λ (grados)', render: row => truncateDecimal(row.lambda) },
    { key: 'phi', label: 'φ (grados)', render: row => truncateDecimal(row.phi) },
    { key: 'ra1', label: 'RA (estación 1) (grados)', render: row => truncateDecimal(row.AR_Estacion_1, 5) },
    { key: 'de1', label: 'De (estación 1) (grados)', render: row => truncateDecimal(row.De_Estacion_1, 5) },
    { key: 'ra2', label: 'RA (estación 2) (grados)', render: row => truncateDecimal(row.Ar_Estacion_2, 5) },
    { key: 'de2', label: 'De (estación 2) (grados)', render: row => truncateDecimal(row.De_Estacion_2, 5) }
  ];

  return (
    <Container fluid className="px-0">
      <Row className="g-4">
        <Col xs={12}>
          <ReportPanel
            title="Fotogramas"
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
          <ReportPanel title="Trayectoria" description="Datos de cada fotograma.">
            {trajectoryData.length > 0 ? (
              <DataTable
                columns={trajectoryColumns}
                rows={trajectoryData}
                tableClassName="point-adjust-table"
                rowKey={(row, index) => `${row.Fecha}-${row.s}-${index}`}
              />
            ) : (
              <ReportEmptyState message="No hay puntos de trayectoria disponibles." />
            )}
          </ReportPanel>
        </Col>

        <Col xs={12}>
          <ReportPanel title="Ajuste de velocidades" description="Velocidad ajustada a un polinomio de segundo grado.">
            {regressionTrajectory.length > 0 ? (
              <DataTable
                columns={regressionColumns}
                rows={regressionTrajectory}
                tableClassName="point-adjust-table"
                rowKey={(row, index) => `${row.Fecha}-${row.t}-${index}`}
              />
            ) : (
              <ReportEmptyState message="No hay puntos de regresion disponibles." />
            )}
          </ReportPanel>
        </Col>
      </Row>
    </Container>
  );
};

PointAdjustReport.propTypes = {
  regressionTrajectory: PropTypes.arrayOf(PropTypes.object),
  trajectoryData: PropTypes.arrayOf(PropTypes.object)
};

PointAdjustReport.defaultProps = {
  regressionTrajectory: [],
  trajectoryData: []
};

export default PointAdjustReport;
