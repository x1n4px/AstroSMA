import React, { useState } from "react";
import { API_ENDPOINTS, buildQueryUrl, fetchApi } from "../config/api";
import "./ShowMeteors.css";

const ShowMeteors = () => {
    const [rows, setRows] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchRows = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetchApi(
                buildQueryUrl(API_ENDPOINTS.workflows.runPredefinedQuery, {
                    query: "getAllMeteors"
                })
            );
            if (!response.ok) {
                throw new Error("No se pudo recuperar el listado de meteoros");
            }
            const data = await response.json();
            setRows(data);
            setIsDialogOpen(true);
        } catch (requestError) {
            console.error("Error fetching rows:", requestError);
            setRows([]);
            setIsDialogOpen(false);
            setError(requestError.message || "Se produjo un error cargando los meteoros.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="show-meteors-container wf-data-panel">
            <div className="wf-widget-head">
                <div>
                    <h4>Listado de meteoros</h4>
                    <p>Consulta rápidamente los meteoros disponibles para revisar identificadores y validar datos antes de montar el informe.</p>
                </div>
                {isDialogOpen && rows.length > 0 && <span className="wf-inline-badge">{rows.length} registros</span>}
            </div>

            <div className="wf-inline-actions">
                <button onClick={fetchRows} className="widget-button" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <i className="fa fa-spinner fa-spin"></i>
                            Cargando...
                        </>
                    ) : (
                        <>
                            <i className="fa fa-database"></i>
                            Obtener meteoros
                        </>
                    )}
                </button>
                {isDialogOpen && (
                    <button onClick={() => setIsDialogOpen(false)} className="widget-button-clear">
                        <i className="fa fa-eye-slash"></i>
                        Ocultar tabla
                    </button>
                )}
            </div>

            {error && <div className="wf-widget-feedback wf-widget-feedback-error">{error}</div>}

            {isDialogOpen && (
                <div className="wf-results-shell exportable-content">
                    <div className="wf-results-header">
                        <h5>Resultado de la consulta predefinida</h5>
                        <span>{rows.length} fila{rows.length === 1 ? "" : "s"}</span>
                    </div>
                    {rows.length > 0 ? (
                        <div className="wf-table-wrap">
                            <table className="meteor-table">
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
                        <div className="wf-empty-state">No se encontraron meteoros en la respuesta actual.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShowMeteors;
