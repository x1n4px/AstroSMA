import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner, Tab, Table, Tabs } from 'react-bootstrap';
import { FilePenLine, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import BackToAdminPanel from './BackToAdminPanel';
import ScientificTableEditor from './ScientificTableEditor';
import { getStations } from '@/services/stationService';
import {
    createAdminBolide,
    createAdminReportZ,
    deleteAdminBolide,
    deleteAdminReportZ,
    getAdminBolides,
    getAdminReportZ,
    updateAdminBolide,
    updateAdminReportZ
} from '@/services/adminCatalogService';

const EMPTY_FILTERS = { meteorId: '', stationId: '', startDate: '', endDate: '' };
const EMPTY_BOLIDE = { Identificador: '', Fecha: '', Hora: '' };
const REPORT_ACTION_COLUMN_STYLE = {
    left: 0,
    minWidth: '92px',
    position: 'sticky',
    width: '92px',
    zIndex: 2
};
const KEY_REPORT_COLUMNS = new Set([
    'IdInforme',
    'Meteoro_Identificador',
    'Fecha',
    'Hora',
    'Observatorio_Número',
    'Observatorio_Número2'
]);
const NUMBER_REPORT_COLUMNS = new Set([
    'IdInforme',
    'Observatorio_Número2',
    'Observatorio_Número',
    'Fotogramas_usados',
    'Ángulo_diedro_entre_planos_trayectoria',
    'Peso_estadístico',
    'Azimut',
    'Dist_Cenital',
    'Distancia_recorrida_Estacion_1',
    'Error_distancia_Estacion_1',
    'Error_alturas_Estacion_1',
    'Distancia_recorrida_Estacion_2',
    'Error_distancia_Estacion_2',
    'Error_alturas_Estacion_2',
    'Tiempo_Estacion_1',
    'Velocidad_media',
    'Tiempo_trayectoria_en_estacion_2',
    'Error_Velocidad',
    'Velocidad_Inicial_Estacion_2',
    'Aceleración_en_Kms',
    'Aceleración_en_gs',
    'Método_utilizado',
    'Ecuacion_parametrica_IdEc',
    'Meteoro_Identificador'
]);
const toDateInput = (value) => value ? String(value).slice(0, 10) : '';
const toTextValue = (value) => value ?? '';
const renderCell = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (String(value).length > 76) return `${String(value).slice(0, 76)}...`;
    return String(value);
};
const fieldTypeForReportColumn = (column) => {
    if (column === 'Fecha') return 'date';
    if (NUMBER_REPORT_COLUMNS.has(column)) return 'number';
    return 'text';
};
const toReportForm = (columns, report = {}) => columns.reduce((form, column) => {
    form[column] = column === 'Fecha' ? toDateInput(report[column]) : toTextValue(report[column]);
    return form;
}, {});

const BolideReportPanel = () => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [bolides, setBolides] = useState([]);
    const [reports, setReports] = useState([]);
    const [reportColumns, setReportColumns] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [bolideForm, setBolideForm] = useState(EMPTY_BOLIDE);
    const [editingBolideId, setEditingBolideId] = useState(null);
    const [showBolideModal, setShowBolideModal] = useState(false);
    const [reportForm, setReportForm] = useState({});
    const [editingReportId, setEditingReportId] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeTab, setActiveTab] = useState('reports');

    const orderedReportColumns = useMemo(() => [
        ...reportColumns.filter(column => KEY_REPORT_COLUMNS.has(column)),
        ...reportColumns.filter(column => !KEY_REPORT_COLUMNS.has(column))
    ], [reportColumns]);

    const loadCatalog = useCallback(async (nextFilters) => {
        try {
            setLoading(true);
            setError(null);
            const [bolideRows, reportData] = await Promise.all([
                getAdminBolides(nextFilters),
                getAdminReportZ(nextFilters)
            ]);
            setBolides(bolideRows);
            setReports(reportData.reports || []);
            setReportColumns(reportData.columns || []);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudieron cargar los bólidos e informes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCatalog(EMPTY_FILTERS);
        getStations().then(setStations).catch(() => setStations([]));
    }, [loadCatalog]);

    const submitFilters = (event) => {
        event.preventDefault();
        loadCatalog(filters);
    };
    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        loadCatalog(EMPTY_FILTERS);
    };
    const openBolideCreate = () => {
        setEditingBolideId(null);
        setBolideForm(EMPTY_BOLIDE);
        setError(null);
        setShowBolideModal(true);
    };
    const openBolideEdit = (bolide) => {
        setEditingBolideId(bolide.Identificador);
        setBolideForm({
            Identificador: bolide.Identificador ?? '',
            Fecha: toDateInput(bolide.Fecha),
            Hora: bolide.Hora ?? ''
        });
        setError(null);
        setShowBolideModal(true);
    };
    const saveBolide = async () => {
        try {
            setSaving(true);
            setError(null);
            const savedBolide = editingBolideId
                ? await updateAdminBolide(editingBolideId, bolideForm)
                : await createAdminBolide(bolideForm);
            setBolides(currentBolides => editingBolideId
                ? currentBolides.map(bolide => bolide.Identificador === editingBolideId ? savedBolide : bolide)
                : [savedBolide, ...currentBolides]
            );
            setShowBolideModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar el bólido.');
        } finally {
            setSaving(false);
        }
    };
    const openReportCreate = () => {
        setEditingReportId(null);
        setReportForm(toReportForm(reportColumns));
        setError(null);
        setShowReportModal(true);
    };
    const openReportEdit = (report) => {
        setEditingReportId(report.IdInforme);
        setReportForm(toReportForm(reportColumns, report));
        setError(null);
        setShowReportModal(true);
    };
    const saveReport = async () => {
        try {
            setSaving(true);
            setError(null);
            const savedReport = editingReportId
                ? await updateAdminReportZ(editingReportId, reportForm)
                : await createAdminReportZ(reportForm);
            setReports(currentReports => editingReportId
                ? currentReports.map(report => report.IdInforme === editingReportId ? savedReport : report)
                : [savedReport, ...currentReports]
            );
            setShowReportModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar el informe.');
        } finally {
            setSaving(false);
        }
    };
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setSaving(true);
            setError(null);
            if (deleteTarget.kind === 'bolide') {
                await deleteAdminBolide(deleteTarget.id);
                setBolides(currentBolides => currentBolides.filter(bolide => bolide.Identificador !== deleteTarget.id));
            } else {
                await deleteAdminReportZ(deleteTarget.id);
                setReports(currentReports => currentReports.filter(report => report.IdInforme !== deleteTarget.id));
            }
            setDeleteTarget(null);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar el registro.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <BackToAdminPanel />
            <main className="container-fluid px-3 px-lg-4 my-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center mb-4">
                    <div>
                        <h1 className="h3 mb-1">Gestión de informes y bólidos</h1>
                        <p className="text-muted mb-0">Edición directa de bólidos e informes de dos estaciones.</p>
                    </div>
                </div>
                <Form onSubmit={submitFilters} className="border rounded p-3 mb-4 bg-body-tertiary">
                    <Row className="g-3 align-items-end">
                        <Col md={3} xl={2}><Form.Group><Form.Label>Bólido</Form.Label><Form.Control type="number" min="1" name="meteorId" value={filters.meteorId} onChange={event => setFilters(current => ({ ...current, meteorId: event.target.value }))} /></Form.Group></Col>
                        <Col md={4} xl={3}>
                            <Form.Group>
                                <Form.Label>Estación</Form.Label>
                                <Form.Select name="stationId" value={filters.stationId} onChange={event => setFilters(current => ({ ...current, stationId: event.target.value }))}>
                                    <option value="">Todas</option>
                                    {stations.map(station => <option key={station.id} value={station.id}>{station.id} - {station.stationName || station.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} xl={2}><Form.Group><Form.Label>Desde</Form.Label><Form.Control type="date" name="startDate" value={filters.startDate} onChange={event => setFilters(current => ({ ...current, startDate: event.target.value }))} /></Form.Group></Col>
                        <Col md={3} xl={2}><Form.Group><Form.Label>Hasta</Form.Label><Form.Control type="date" name="endDate" value={filters.endDate} onChange={event => setFilters(current => ({ ...current, endDate: event.target.value }))} /></Form.Group></Col>
                        <Col className="d-flex flex-wrap gap-2"><Button type="submit" className="d-inline-flex align-items-center gap-2"><Search size={18} />Buscar</Button><Button variant="outline-secondary" type="button" onClick={clearFilters}>Limpiar</Button></Col>
                    </Row>
                </Form>
                {error && <Alert variant="danger">{error}</Alert>}
                <Tabs activeKey={activeTab} onSelect={nextTab => setActiveTab(nextTab || 'reports')} className="mb-3">
                    <Tab eventKey="reports" title={`Informes (${reports.length})`}>
                        <section>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                                <div>
                                    <h2 className="h4 mb-1">Informes</h2>
                                    <p className="text-muted mb-0">La tabla conserva todas las columnas; las acciones quedan siempre a mano.</p>
                                </div>
                                <Button
                                    className="d-inline-flex align-items-center gap-2 align-self-start align-self-md-center"
                                    style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                    onClick={openReportCreate}
                                    disabled={!reportColumns.length}
                                >
                                    <FilePenLine size={18} />
                                    Nuevo informe
                                </Button>
                            </div>
                            <Table striped bordered hover responsive className="align-middle small">
                                <thead>
                                    <tr>
                                        <th className="bg-body" style={{ ...REPORT_ACTION_COLUMN_STYLE, zIndex: 3 }}>Acciones</th>
                                        {orderedReportColumns.map(column => <th key={column}>{column}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.IdInforme}>
                                            <td className="bg-body" style={REPORT_ACTION_COLUMN_STYLE}>
                                                <div className="d-flex gap-2">
                                                    <Button variant="outline-primary" size="sm" title="Editar informe" aria-label={`Editar informe ${report.IdInforme}`} onClick={() => openReportEdit(report)}><Pencil size={16} /></Button>
                                                    <Button variant="outline-danger" size="sm" title="Eliminar informe" aria-label={`Eliminar informe ${report.IdInforme}`} onClick={() => setDeleteTarget({ kind: 'report', id: report.IdInforme })}><Trash2 size={16} /></Button>
                                                </div>
                                            </td>
                                            {orderedReportColumns.map(column => <td key={column} title={String(toTextValue(report[column]))}>{renderCell(column === 'Fecha' ? toDateInput(report[column]) : report[column])}</td>)}
                                        </tr>
                                    ))}
                                    {!loading && !reports.length && <tr><td colSpan={orderedReportColumns.length + 1} className="text-center text-muted">No hay informes para la búsqueda.</td></tr>}
                                </tbody>
                            </Table>
                        </section>
                    </Tab>
                    <Tab eventKey="radiant-reports" title="Informes radiantes">
                        <ScientificTableEditor
                            tableKey="radiant-reports"
                            filters={filters}
                            title="Informes radiantes"
                            subtitle="Informes de una estación filtrables por bólido, fecha y estación."
                        />
                    </Tab>
                    <Tab eventKey="photometry-reports" title="Fotometría">
                        <ScientificTableEditor
                            tableKey="photometry-reports"
                            filters={filters}
                            title="Informes de fotometría"
                            subtitle="Informes de fotometría filtrables por bólido y fecha."
                        />
                    </Tab>
                    <Tab eventKey="bolides" title={`Bólidos (${bolides.length})`}>
                        <section>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                                <div>
                                    <h2 className="h4 mb-1">Bólidos</h2>
                                    <p className="text-muted mb-0">Identificador, fecha y hora del meteoro.</p>
                                </div>
                                <Button className="d-inline-flex align-items-center gap-2 align-self-start align-self-md-center" onClick={openBolideCreate}>
                                    <Plus size={18} />
                                    Nuevo bólido
                                </Button>
                            </div>
                            <Table striped bordered hover responsive className="align-middle">
                                <thead><tr><th>Identificador</th><th>Fecha</th><th>Hora</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {bolides.map(bolide => (
                                        <tr key={bolide.Identificador}>
                                            <td>{bolide.Identificador}</td><td>{toDateInput(bolide.Fecha) || '-'}</td><td>{bolide.Hora || '-'}</td>
                                            <td><div className="d-flex gap-2"><Button variant="outline-primary" size="sm" title="Editar bólido" onClick={() => openBolideEdit(bolide)}><Pencil size={16} /></Button><Button variant="outline-danger" size="sm" title="Eliminar bólido" onClick={() => setDeleteTarget({ kind: 'bolide', id: bolide.Identificador })}><Trash2 size={16} /></Button></div></td>
                                        </tr>
                                    ))}
                                    {!loading && !bolides.length && <tr><td colSpan={4} className="text-center text-muted">No hay bólidos para la búsqueda.</td></tr>}
                                </tbody>
                            </Table>
                        </section>
                    </Tab>
                </Tabs>
                {loading && <div className="d-flex align-items-center gap-2 text-muted pb-4"><Spinner size="sm" />Cargando datos...</div>}
            </main>
            <Modal show={showBolideModal} onHide={() => !saving && setShowBolideModal(false)}>
                <Modal.Header closeButton><Modal.Title>{editingBolideId ? 'Editar bólido' : 'Nuevo bólido'}</Modal.Title></Modal.Header>
                <Modal.Body><Form><Row className="g-3"><Col md={4}><Form.Group><Form.Label>Identificador</Form.Label><Form.Control required disabled={!!editingBolideId} type="number" min="1" value={bolideForm.Identificador} onChange={event => setBolideForm(current => ({ ...current, Identificador: event.target.value }))} /></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Fecha</Form.Label><Form.Control required type="date" value={bolideForm.Fecha} onChange={event => setBolideForm(current => ({ ...current, Fecha: event.target.value }))} /></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Hora</Form.Label><Form.Control value={bolideForm.Hora} onChange={event => setBolideForm(current => ({ ...current, Hora: event.target.value }))} /></Form.Group></Col></Row></Form></Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowBolideModal(false)} disabled={saving}>Cancelar</Button><Button onClick={saveBolide} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></Modal.Footer>
            </Modal>
            <Modal show={showReportModal} onHide={() => !saving && setShowReportModal(false)} size="xl">
                <Modal.Header closeButton><Modal.Title>{editingReportId ? 'Editar informe' : 'Nuevo informe'}</Modal.Title></Modal.Header>
                <Modal.Body><Form><Row className="g-3">{orderedReportColumns.map(column => <Col md={KEY_REPORT_COLUMNS.has(column) ? 4 : 6} key={column}><Form.Group><Form.Label>{column}</Form.Label><Form.Control disabled={column === 'IdInforme' && !!editingReportId} type={fieldTypeForReportColumn(column)} step={fieldTypeForReportColumn(column) === 'number' ? 'any' : undefined} value={reportForm[column] ?? ''} onChange={event => setReportForm(current => ({ ...current, [column]: event.target.value }))} /></Form.Group></Col>)}</Row></Form></Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowReportModal(false)} disabled={saving}>Cancelar</Button><Button onClick={saveReport} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></Modal.Footer>
            </Modal>
            <Modal show={!!deleteTarget} onHide={() => !saving && setDeleteTarget(null)}>
                <Modal.Header closeButton><Modal.Title>Eliminar registro</Modal.Title></Modal.Header>
                <Modal.Body>Se eliminará {deleteTarget?.kind === 'bolide' ? `el bólido ${deleteTarget.id}` : `el informe ${deleteTarget?.id}`}.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={saving}>Cancelar</Button><Button variant="danger" onClick={confirmDelete} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</Button></Modal.Footer>
            </Modal>
        </>
    );
};

export default BolideReportPanel;
