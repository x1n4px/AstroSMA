import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
    createAdminScientificRow,
    deleteAdminScientificRow,
    getAdminScientificTable,
    updateAdminScientificRow
} from '@/services/adminCatalogService';

const ACTION_COLUMN_STYLE = {
    left: 0,
    minWidth: '92px',
    position: 'sticky',
    width: '92px',
    zIndex: 2
};
const EMPTY_FILTERS = {};

const toDateInput = (value) => value ? String(value).slice(0, 10) : '';
const toTextValue = (value) => value ?? '';
const renderCell = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (String(value).length > 76) return `${String(value).slice(0, 76)}...`;
    return String(value);
};
const getRowKey = (config, row) => config.primaryKeys.map(column => `${column}:${row[column]}`).join('|');
const getPrimaryKey = (config, row) => config.primaryKeys.reduce((key, column) => ({ ...key, [column]: row[column] }), {});
const toForm = (config, row = {}) => config.columns.reduce((form, column) => {
    form[column] = config.dateColumns.includes(column) ? toDateInput(row[column]) : toTextValue(row[column]);
    return form;
}, {});

const ScientificTableEditor = ({ tableKey, filters, title, subtitle, compactHeader = false }) => {
    const [config, setConfig] = useState(null);
    const [rows, setRows] = useState([]);
    const [relatedId, setRelatedId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});
    const [editingKey, setEditingKey] = useState(null);
    const [deleteRow, setDeleteRow] = useState(null);

    const requestFilters = useMemo(() => ({
        ...(filters || EMPTY_FILTERS),
        relatedId: relatedId || undefined
    }), [filters, relatedId]);

    const loadRows = useCallback(async (nextFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAdminScientificTable(tableKey, nextFilters);
            setConfig(response.config);
            setRows(response.rows || []);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo cargar la tabla.');
        } finally {
            setLoading(false);
        }
    }, [tableKey]);

    useEffect(() => {
        setRelatedId('');
    }, [tableKey]);

    useEffect(() => {
        loadRows(requestFilters);
    }, [loadRows, requestFilters]);

    const openCreate = () => {
        if (!config) return;
        setEditingKey(null);
        setForm(toForm(config));
        setError(null);
        setShowModal(true);
    };
    const openEdit = (row) => {
        setEditingKey(getPrimaryKey(config, row));
        setForm(toForm(config, row));
        setError(null);
        setShowModal(true);
    };
    const saveRow = async () => {
        try {
            setSaving(true);
            setError(null);
            if (editingKey) {
                await updateAdminScientificRow(tableKey, editingKey, form);
            } else {
                await createAdminScientificRow(tableKey, form);
            }
            setShowModal(false);
            await loadRows(requestFilters);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar el registro.');
        } finally {
            setSaving(false);
        }
    };
    const confirmDelete = async () => {
        if (!deleteRow) return;
        try {
            setSaving(true);
            setError(null);
            await deleteAdminScientificRow(tableKey, getPrimaryKey(config, deleteRow));
            setDeleteRow(null);
            await loadRows(requestFilters);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar el registro.');
        } finally {
            setSaving(false);
        }
    };
    const fieldType = (column) => {
        if (config?.dateColumns.includes(column)) return 'date';
        if (config?.numberColumns.includes(column)) return 'number';
        return 'text';
    };

    return (
        <>
            <section>
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-end mb-3">
                    <div>
                        {!compactHeader && <h2 className="h4 mb-1">{title || config?.label || 'Tabla'}</h2>}
                        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                    </div>
                    <div className="d-flex flex-column flex-md-row gap-2 align-items-md-end">
                        {config?.relatedColumn && (
                            <Form onSubmit={event => { event.preventDefault(); loadRows(requestFilters); }} className="d-flex gap-2 align-items-end">
                                <Form.Group>
                                    <Form.Label>{config.relatedLabel}</Form.Label>
                                    <Form.Control value={relatedId} onChange={event => setRelatedId(event.target.value)} />
                                </Form.Group>
                                <Button type="submit" variant="outline-secondary" title="Filtrar por informe asociado">
                                    <Search size={18} />
                                </Button>
                            </Form>
                        )}
                        <Button className="d-inline-flex align-items-center gap-2 align-self-start align-self-md-end" onClick={openCreate} disabled={!config}>
                            <Plus size={18} />
                            Nuevo
                        </Button>
                    </div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover responsive className="align-middle small">
                    <thead>
                        <tr>
                            <th className="bg-body" style={{ ...ACTION_COLUMN_STYLE, zIndex: 3 }}>Acciones</th>
                            {config?.columns.map(column => <th key={column}>{column}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {config && rows.map(row => (
                            <tr key={getRowKey(config, row)}>
                                <td className="bg-body" style={ACTION_COLUMN_STYLE}>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-primary" size="sm" title="Editar" onClick={() => openEdit(row)}><Pencil size={16} /></Button>
                                        <Button variant="outline-danger" size="sm" title="Eliminar" onClick={() => setDeleteRow(row)}><Trash2 size={16} /></Button>
                                    </div>
                                </td>
                                {config.columns.map(column => <td key={column} title={String(toTextValue(row[column]))}>{renderCell(config.dateColumns.includes(column) ? toDateInput(row[column]) : row[column])}</td>)}
                            </tr>
                        ))}
                        {!loading && config && !rows.length && <tr><td colSpan={config.columns.length + 1} className="text-center text-muted">No hay registros para la búsqueda.</td></tr>}
                    </tbody>
                </Table>
                {loading && <div className="d-flex align-items-center gap-2 text-muted pb-3"><Spinner size="sm" />Cargando tabla...</div>}
            </section>
            <Modal show={showModal} onHide={() => !saving && setShowModal(false)} size="xl">
                <Modal.Header closeButton><Modal.Title>{editingKey ? 'Editar registro' : 'Nuevo registro'} · {config?.label}</Modal.Title></Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Row className="g-3">
                            {config?.columns.map(column => (
                                <Col md={6} xl={4} key={column}>
                                    <Form.Group>
                                        <Form.Label>{column}</Form.Label>
                                        <Form.Control
                                            disabled={!!editingKey && config.primaryKeys.includes(column)}
                                            type={fieldType(column)}
                                            step={fieldType(column) === 'number' ? 'any' : undefined}
                                            value={form[column] ?? ''}
                                            onChange={event => setForm(current => ({ ...current, [column]: event.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button><Button onClick={saveRow} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></Modal.Footer>
            </Modal>
            <Modal show={!!deleteRow} onHide={() => !saving && setDeleteRow(null)}>
                <Modal.Header closeButton><Modal.Title>Eliminar registro</Modal.Title></Modal.Header>
                <Modal.Body>Se eliminará este registro de {config?.label?.toLowerCase()}.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setDeleteRow(null)} disabled={saving}>Cancelar</Button><Button variant="danger" onClick={confirmDelete} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</Button></Modal.Footer>
            </Modal>
        </>
    );
};

export default ScientificTableEditor;
