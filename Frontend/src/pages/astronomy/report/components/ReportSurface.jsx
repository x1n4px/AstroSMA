import React from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup } from 'react-bootstrap';
import '@/pages/astronomy/report/components/ReportSurface.css';

const accentMap = {
  neutral: {
    border: '1px solid #dde5f0',
    backgroundColor: '#ffffff'
  },
  warm: {
    border: '1px solid #f1ddd4',
    backgroundColor: '#fffaf7'
  },
  cool: {
    border: '1px solid #dbe7ff',
    backgroundColor: '#f8fbff'
  }
};

const basePanelStyle = {
  height: '100%',
  padding: '1.25rem',
  borderRadius: '1.35rem',
  boxShadow: '0 10px 26px rgba(15, 23, 42, 0.04)'
};

const eyebrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.4rem 0.75rem',
  borderRadius: '999px',
  backgroundColor: '#fff1e8',
  color: '#9a3412',
  fontSize: '0.82rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const titleStyle = {
  marginBottom: '0.45rem',
  color: '#172033'
};

const descriptionStyle = {
  marginBottom: '1rem',
  color: '#5b677d',
  lineHeight: 1.65
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(11.5rem, 1fr))',
  gap: '0.85rem'
};

const metricCardStyle = {
  padding: '0.95rem 1rem',
  border: '1px solid #e5ebf3',
  borderRadius: '1rem',
  backgroundColor: '#ffffff'
};

const tableShellStyle = {
  width: '100%',
  overflowX: 'auto',
  border: '1px solid #e5ebf3',
  borderRadius: '1rem',
  backgroundColor: '#ffffff'
};

const emptyStateStyle = {
  padding: '1rem 1.1rem',
  border: '1px dashed #d7dee9',
  borderRadius: '1rem',
  color: '#64748b',
  backgroundColor: '#f8fafc'
};

function resolveValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
}

export function ReportPanel({ title, description, eyebrow, accent, children, style }) {
  return (
    <div className={`report-panel report-panel--${accent}`} style={{ ...basePanelStyle, ...accentMap[accent], ...style }}>
      {eyebrow ? <div className="report-eyebrow" style={eyebrowStyle}>{eyebrow}</div> : null}
      {title ? (
        <div style={{ marginTop: eyebrow ? '1rem' : 0, marginBottom: description ? '0.2rem' : '1rem' }}>
          <h4 style={titleStyle}>{title}</h4>
          {description ? <p style={descriptionStyle}>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

ReportPanel.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  eyebrow: PropTypes.string,
  accent: PropTypes.oneOf(['neutral', 'warm', 'cool']),
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};

ReportPanel.defaultProps = {
  title: '',
  description: '',
  eyebrow: '',
  accent: 'neutral',
  style: {}
};

export function ReportMetricsGrid({ children }) {
  return <div style={metricsGridStyle}>{children}</div>;
}

ReportMetricsGrid.propTypes = {
  children: PropTypes.node.isRequired
};

export function ReportMetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
        {label}
      </div>
      <div style={{ color: '#182338', fontSize: '1.05rem', fontWeight: 700, overflowWrap: 'anywhere' }}>
        {resolveValue(value)}
      </div>
    </div>
  );
}

ReportMetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export function ReportField({ label, value, suffix, controlClassName, className, as, rows }) {
  const normalizedValue = resolveValue(value);

  return (
    <Form.Group className={`report-field ${className}`.trim()}>
      <Form.Label className="report-label">{label}</Form.Label>
      <InputGroup className="report-input-group">
        <Form.Control
          as={as}
          rows={rows}
          type={as === 'textarea' ? undefined : 'text'}
          value={normalizedValue}
          readOnly
          className={`report-control ${controlClassName}`.trim()}
        />
        {suffix ? <InputGroup.Text className="report-suffix">{suffix}</InputGroup.Text> : null}
      </InputGroup>
    </Form.Group>
  );
}

ReportField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  suffix: PropTypes.string,
  controlClassName: PropTypes.string,
  className: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea']),
  rows: PropTypes.number
};

ReportField.defaultProps = {
  value: '-',
  suffix: '',
  controlClassName: '',
  className: 'mb-3',
  as: 'input',
  rows: 3
};

export function ReportSelectField({ label, value, onChange, children }) {
  return (
    <Form.Group className="report-select-field mb-0">
      <Form.Label className="report-label">{label}</Form.Label>
      <Form.Select className="report-select" value={value} onChange={onChange}>
        {children}
      </Form.Select>
    </Form.Group>
  );
}

ReportSelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export function ReportTableShell({ children }) {
  return <div className="report-table-shell" style={tableShellStyle}>{children}</div>;
}

ReportTableShell.propTypes = {
  children: PropTypes.node.isRequired
};

export function ReportEmptyState({ message }) {
  return <div className="report-empty-state" style={emptyStateStyle}>{message}</div>;
}

ReportEmptyState.propTypes = {
  message: PropTypes.string.isRequired
};
