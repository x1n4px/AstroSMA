import React, { useEffect, useState } from "react";
import axios from "axios";
import { getConfig, updateConfig } from "../../services/webConfigService";
import BackToAdminPanel from './BackToAdminPanel'; // Asegúrate de que la ruta sea correcta

const ConfigPanel = () => {
    const [configurations, setConfigurations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch configurations from the API
        const fetchConfigurations = async () => {
            try {
                const response = await getConfig();
                console.log("Configurations fetched:", response);
                setConfigurations(response);
            } catch (error) {
                console.error("Error fetching configurations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfigurations();
    }, []);

    // Esta función actualiza SOLO el valor en el estado, no en el servidor
    const handleLocalChange = (id, newValue) => {
        setConfigurations((prevConfigs) =>
            prevConfigs.map((config) =>
                config.id === id ? { ...config, value: newValue } : config
            )
        );
    };

    // Esta función llama al servidor
    const handleUpdate = async (id) => {
        const configToUpdate = configurations.find(config => config.id === id);
        if (!configToUpdate) return;

        try {
            await updateConfig(id, { value: configToUpdate.value });

            console.log("Configuration updated successfully");
        } catch (error) {
            console.error("Error updating configuration:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <BackToAdminPanel />

            <div className="container my-4">
                <h2 className="mb-4">Panel de configuración</h2>
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>Descripción</th>
                            <th>Valor</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configurations.map((config) => (
                            <tr key={config.id}>
                                <td>{config.description}</td>
                                <td>
                                    {config.value === "true" || config.value === "false" ? (
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={config.value === "true"}
                                            onChange={(e) =>
                                                handleLocalChange(config.id, e.target.checked.toString())
                                            }
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={config.value}
                                            onChange={(e) =>
                                                handleLocalChange(config.id, e.target.value)
                                            }
                                        />
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleUpdate(config.id)}
                                    >
                                        Modificar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ConfigPanel;