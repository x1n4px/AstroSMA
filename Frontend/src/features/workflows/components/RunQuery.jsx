import React, { useState } from "react";
import { API_ENDPOINTS, buildQueryUrl, fetchApi } from "../config/api";
import "./RunQuery.css";

const RunQuery = ({ query: initialQuery }) => {
    const [query, setQuery] = useState(initialQuery || "");
    const [rows, setRows] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchRows = async () => {
        if (!query.trim()) {
            setError("Introduce una consulta SQL antes de ejecutarla.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetchApi(buildQueryUrl(API_ENDPOINTS.workflows.runQuery, { query }));
            if (!response.ok) {
                throw new Error("No se pudo ejecutar la consulta");
            }
            const data = await response.json();
            setRows(data);
            setIsDialogOpen(true);
        } catch (requestError) {
            console.error("Error running query:", requestError);
            setRows([]);
            setIsDialogOpen(false);
            setError(requestError.message || "Se produjo un error al ejecutar la consulta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="run-query-container wf-data-panel">
            <div className="wf-widget-head">
                <div>
                    <h4>Consulta SQL personalizada</h4>
                    <p>Lanza consultas directas sobre la base de datos integrada y revisa el resultado dentro del informe.</p>
                </div>
                {isDialogOpen && rows.length > 0 && <span className="wf-inline-badge">{rows.length} filas</span>}
            </div>

            <textarea
                className="query-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="SELECT * FROM Meteoro LIMIT 10"
                rows={5}
            />

            <div className="wf-inline-actions">
                <button onClick={fetchRows} className="widget-button" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <i className="fa fa-spinner fa-spin"></i>
                            Ejecutando...
                        </>
                    ) : (
                        <>
                            <i className="fa fa-play"></i>
                            Ejecutar consulta
                        </>
                    )}
                </button>
                {isDialogOpen && (
                    <button onClick={() => setIsDialogOpen(false)} className="widget-button-clear">
                        <i className="fa fa-eye-slash"></i>
                        Ocultar resultados
                    </button>
                )}
            </div>

            {error && <div className="wf-widget-feedback wf-widget-feedback-error">{error}</div>}

            {isDialogOpen && (
                <div className="wf-results-shell exportable-content">
                    <div className="wf-results-header">
                        <h5>Resultado de la consulta</h5>
                        <span>{rows.length} registro{rows.length === 1 ? "" : "s"}</span>
                    </div>
                    {rows.length > 0 ? (
                        <div className="wf-table-wrap">
                            <table className="query-results">
                                <thead>
                                    <tr>{Object.keys(rows[0]).map(key => <th key={key}>{key}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index}>
                                            {Object.values(row).map((value, valueIndex) => (
                                                <td key={valueIndex}>{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="wf-empty-state">La consulta se ejecutó correctamente pero no devolvió filas.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RunQuery;
