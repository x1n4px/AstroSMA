import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Alert } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, AreaChart, Area } from "recharts";
import { API_ENDPOINTS, buildQueryUrl, fetchApi } from "../config/api";
import { logger } from "../utils/logger";
import { analysisTypes } from "../utils/analysisTypes";

import "./DataChart.css";

const DataChart = ({ selectedMeteorData }) => {
    const [selectedAnalysis, setSelectedAnalysis] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartType, setChartType] = useState("scatter");
    const [errorInfo, setErrorInfo] = useState(null);
    const DAY_START_HOUR = 8;

    // Get flat list of all analyses
    const getAllAnalyses = () => {
        const allAnalyses = [];
        Object.keys(analysisTypes).forEach(category => {
            analysisTypes[category].forEach(analysis => {
                allAnalyses.push({
                    ...analysis,
                    category: category
                });
            });
        });
        return allAnalyses;
    };

    // Helper function to describe what data type is missing
    const getDataTypeDescription = analysis => {
        const key = analysis.key;
        if (key.includes("velocity") || key.includes("Time")) return "velocity time-series data";
        if (key.includes("distance") && key.includes("Time")) return "distance time-series data";
        if (key.includes("acceleration")) return "acceleration data";
        if (key.includes("light") || key.includes("magnitude")) return "photometric data";
        if (key.includes("error")) return "measurement error data";
        if (key.includes("observatory")) return "multi-observatory data";
        return "measurement data";
    };

    // Auto-select analysis when meteor is selected
    useEffect(() => {
        if (selectedMeteorData && !selectedAnalysis) {
            setSelectedAnalysis("velocityAcceleration");
        }
    }, [selectedMeteorData, selectedAnalysis]);

    const fetchData = async () => {
        if (!selectedAnalysis) {
            return;
        }

        const analysis = getAllAnalyses().find(a => a.key === selectedAnalysis);
        if (!analysis) return;

        setLoading(true);
        setChartType(analysis.chartType);
        setErrorInfo(null); // Reset error info

        try {
            const applyAnalysisTransforms = (analysisKey, rows) => {
                if (analysisKey !== "dailyPattern") return rows;

                return [...rows].sort((a, b) => {
                    const ax = Number(a.x);
                    const bx = Number(b.x);
                    const aHour = Number.isNaN(ax) ? 0 : ((ax % 24) + 24) % 24;
                    const bHour = Number.isNaN(bx) ? 0 : ((bx % 24) + 24) % 24;
                    const aShifted = (aHour - DAY_START_HOUR + 24) % 24;
                    const bShifted = (bHour - DAY_START_HOUR + 24) % 24;
                    return aShifted - bShifted;
                });
            };

            const buildDataQueryUrl = query => {
                const params = { query };
                if (selectedMeteorData && query.startsWith("meteor")) {
                    params.meteorId = selectedMeteorData.identifier;
                }

                // Use runPredefinedQuery for all queries - it handles both meteor-specific and general queries
                const endpoint = API_ENDPOINTS.workflows.runPredefinedQuery;

                return buildQueryUrl(endpoint, params);
            };

            let xQuery, yQuery;

            if (selectedMeteorData && !analysis.generalOnly) {
                xQuery = analysis.xQuery;
                yQuery = analysis.yQuery;
            } else {
                xQuery = analysis.xQueryGeneral;
                yQuery = analysis.yQueryGeneral;
            }

            if (analysis.isXYPair) {
                // For X-Y pair queries, fetch once and extract both values
                const response = await fetchApi(buildDataQueryUrl(xQuery));
                if (!response.ok) throw new Error("Failed to fetch data");

                const rawData = await response.json();
                if (!Array.isArray(rawData)) throw new Error("Invalid data format");


                const combinedData = rawData.map((item, idx) => {
                    if (typeof item === "object" && item !== null) {
                        const keys = Object.keys(item);
                        const xVal = item[keys[0]];
                        const yVal = item[keys[1]];
                        
                        // Check if X value is categorical (non-numeric)
                        const isXCategorical = isNaN(parseFloat(xVal));
                        
                        const result = {
                            x: isXCategorical ? String(xVal) : (parseFloat(xVal) || 0),
                            y: parseFloat(yVal) || 0,
                            index: idx
                        };


                        return result;
                    }
                    return { x: idx, y: parseFloat(item) || 0, index: idx };
                });

                const transformedData = applyAnalysisTransforms(analysis.key, combinedData);

                if (transformedData.length === 0) {
                    setErrorInfo({
                        type: "no_data",
                        analysisType: analysis.label,
                        meteorId: selectedMeteorData?.Identificador,
                        dataType: getDataTypeDescription(analysis)
                    });
                }

                setData(transformedData);
            } else {
                // For separate X and Y queries
                const [xResponse, yResponse] = await Promise.all([
                    fetchApi(buildDataQueryUrl(xQuery)),
                    fetchApi(buildDataQueryUrl(yQuery))
                ]);

                if (!xResponse.ok || !yResponse.ok) {
                    throw new Error("Failed to fetch data");
                }

                const xData = await xResponse.json();
                const yData = await yResponse.json();

                if (!Array.isArray(xData) || !Array.isArray(yData)) {
                    throw new Error("Invalid data format");
                }

                const processDataArray = dataArray => {
                    if (dataArray.length === 0) return [];

                    const firstItem = dataArray[0];
                    if (typeof firstItem === "object" && firstItem !== null) {
                        const keys = Object.keys(firstItem);
                        return dataArray.map(item => item[keys[0]]);
                    }
                    return dataArray;
                };

                const processedX = processDataArray(xData);
                const processedY = processDataArray(yData);

                if (processedX.length !== processedY.length) {
                    logger.warn("X and Y data lengths do not match. Truncating to the shorter length.");
                    const minLength = Math.min(processedX.length, processedY.length);
                    processedX.length = minLength;
                    processedY.length = minLength;
                }

                // Determine if X data is categorical (contains non-numeric values)
                const isCategorical = processedX.some(val => isNaN(parseFloat(val)));
                
                const combinedData = processedX.map((xVal, idx) => ({
                    x: isCategorical ? String(xVal) : (parseFloat(xVal) || 0),
                    y: parseFloat(processedY[idx]) || 0,
                    index: idx
                }));

                const transformedData = applyAnalysisTransforms(analysis.key, combinedData);

                if (transformedData.length === 0) {
                    setErrorInfo({
                        type: "no_data",
                        analysisType: analysis.label,
                        meteorId: selectedMeteorData?.Identificador,
                        dataType: getDataTypeDescription(analysis)
                    });
                }

                setData(transformedData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            logger.error("Error fetching chart data:", error);
            
            // Clear previous chart data when error occurs
            setData([]);
            
            // Set error info to display to user
            setErrorInfo({
                meteorId: selectedMeteorData?.identifier || "Unknown",
                analysisType: analysis.label || selectedAnalysis,
                dataType: "valid query execution",
                errorMessage: error.message || "Database query failed"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (data.length === 0) return null;

        const analysis = getAllAnalyses().find(a => a.key === selectedAnalysis);
        if (!analysis) return null;
        const isDailyPattern = analysis.key === "dailyPattern";

        // Check if X data is categorical
        const isCategorical = data.some(item => typeof item.x === 'string');

        const commonProps = {
            width: "100%",
            height: 400,
            data: data,
            margin: { 
                top: 20, 
                right: 30, 
                left: 40, 
                bottom: isCategorical ? 120 : 70  // More space for angled labels
            }
        };

        // Configure XAxis based on data type
        const xAxisProps = {
            dataKey: "x",
            label: { value: analysis.xLabel, position: "insideBottom", offset: 0 },
            ...(isDailyPattern && {
                tickFormatter: value => String(value).padStart(2, "0")
            }),
            ...(isCategorical && { 
                type: "category",
                angle: -45,
                textAnchor: "end",
                height: 120,
                interval: 0  // Show all labels
            })
        };

        if (chartType === "line") {
            return (
                <ResponsiveContainer {...commonProps}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis {...xAxisProps} />
                        <YAxis label={{ value: analysis.yLabel, angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            labelFormatter={value => `${analysis.xLabel}: ${value}`}
                            formatter={value => [value, analysis.yLabel]}
                        />
                        <Line type="monotone" dataKey="y" stroke="#8884d8" dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            );
        } else if (chartType === "bar") {
            return (
                <ResponsiveContainer {...commonProps}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis {...xAxisProps} />
                        <YAxis label={{ value: analysis.yLabel, angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            labelFormatter={value => `${analysis.xLabel}: ${value}`}
                            formatter={value => [value, analysis.yLabel]}
                        />
                        <Bar dataKey="y" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            );
        } else if (chartType === "area") {
            return (
                <ResponsiveContainer {...commonProps}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis {...xAxisProps} />
                        <YAxis label={{ value: analysis.yLabel, angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            labelFormatter={value => `${analysis.xLabel}: ${value}`}
                            formatter={value => [value, analysis.yLabel]}
                        />
                        <Area type="monotone" dataKey="y" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                </ResponsiveContainer>
            );
        } else if (chartType === "column") {
            return (
                <ResponsiveContainer {...commonProps}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis {...xAxisProps} />
                        <YAxis label={{ value: analysis.yLabel, angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            labelFormatter={value => `${analysis.xLabel}: ${value}`}
                            formatter={value => [value, analysis.yLabel]}
                        />
                        <Bar dataKey="y" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            );
        } else {
            return (
                <ResponsiveContainer {...commonProps}>
                    <ScatterChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis {...xAxisProps} />
                        <YAxis label={{ value: analysis.yLabel, angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            labelFormatter={value => `${analysis.xLabel}: ${value}`}
                            formatter={value => [value, analysis.yLabel]}
                        />
                        <Scatter dataKey="y" fill="#8884d8" />
                    </ScatterChart>
                </ResponsiveContainer>
            );
        }
    };

    const currentAnalysis = getAllAnalyses().find(a => a.key === selectedAnalysis);

    return (
        <div className="data-chart-container">
            <div className="data-chart-header no-print">
                <h4>Gráfico de análisis</h4>
                {selectedMeteorData && (
                    <Alert variant="info">
                        <strong>Configurado automáticamente para el meteoro {selectedMeteorData.identifier || selectedMeteorData.Identificador}</strong>
                        <br />
                        Fecha: {selectedMeteorData.date || selectedMeteorData.Fecha} | Hora: {selectedMeteorData.time || selectedMeteorData.Hora}
                    </Alert>
                )}
            </div>

            <Form className="no-print">
                <Row className="mb-3">
                    <Col md={8}>
                        <Form.Group>
                            <Form.Label>Tipo de análisis</Form.Label>
                            <Form.Select value={selectedAnalysis} onChange={e => setSelectedAnalysis(e.target.value)}>
                                <option value="">Selecciona un análisis...</option>
                                {Object.keys(analysisTypes).map(category => (
                                    <optgroup key={category} label={category}>
                                        {analysisTypes[category].map(analysis => (
                                            <option key={analysis.key} value={analysis.key}>
                                                {analysis.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Form.Select>
                            {currentAnalysis && (
                                <Form.Text className="text-muted">
                                    {currentAnalysis.description}
                                    <br />
                                    <strong>Eje X:</strong> {currentAnalysis.xLabel} | <strong>Eje Y:</strong>{" "}
                                    {currentAnalysis.yLabel}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Tipo de gráfico</Form.Label>
                            <Form.Select
                                value={chartType}
                                onChange={e => setChartType(e.target.value)}
                                disabled={currentAnalysis && currentAnalysis.chartType}
                            >
                                <option value="scatter">Dispersión</option>
                                <option value="line">Líneas</option>
                                <option value="area">Áreas</option>
                                <option value="column">Columnas</option>
                                <option value="bar">Barras</option>
                            </Form.Select>
                            {currentAnalysis && currentAnalysis.chartType && (
                                <Form.Text className="text-muted">Se ha fijado automáticamente el tipo recomendado</Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Button onClick={fetchData} disabled={!selectedAnalysis || loading} className="widget-button">
                            {loading ? "Cargando..." : "Generar gráfico"}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {data.length > 0 && currentAnalysis && (
                <div className="chart-container exportable-content chart-visual">
                    <div className="chart-info">
                        <strong>{currentAnalysis.label}</strong>
                        <span className="data-points"> ({data.length} puntos de datos)</span>
                        <br />
                        <small>{currentAnalysis.description}</small>
                    </div>
                    {renderChart()}
                </div>
            )}

            {data.length === 0 && selectedAnalysis && !loading && (
                <Alert variant="warning" className="no-print">
                    {errorInfo ? (
                        <div>
                            {errorInfo.errorMessage ? (
                                // Database query error
                                <>
                                    <strong>Query Error for Meteor {errorInfo.meteorId}</strong>
                                    <p>
                                        The analysis <strong>"{errorInfo.analysisType}"</strong> failed due to a database error:
                                    </p>
                                    <div className="alert alert-danger">
                                        <code>{errorInfo.errorMessage}</code>
                                    </div>
                                    <small className="text-muted">
                                        Please check the query definition or contact support if this error persists.
                                    </small>
                                </>
                            ) : (
                                // Missing data error  
                                <>
                                    <strong>Missing Data for Meteor {errorInfo.meteorId}</strong>
                                    <p>
                                        The analysis <strong>"{errorInfo.analysisType}"</strong> cannot be performed because this meteor
                                        lacks <strong>{errorInfo.dataType}</strong> in the database.
                                    </p>
                                    <small className="text-muted">
                                        This is common - not all meteors have complete data for every type of analysis. Try selecting a
                                        different analysis or a different meteor.
                                    </small>
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            No data available for the selected analysis. This may be because:
                            <ul>
                                <li>The selected meteor has no data for these measurements</li>
                                <li>The database contains no records for this analysis type</li>
                                <li>The measurement fields are empty in the database</li>
                            </ul>
                        </div>
                    )}
                </Alert>
            )}
        </div>
    );
};

export default DataChart;
