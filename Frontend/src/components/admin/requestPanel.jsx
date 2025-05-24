"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from "react-bootstrap"
import { Check, X, Calendar, User, Building } from "lucide-react"
import { useTranslation } from 'react-i18next';
import {formatDate} from '@/pipe/formatDate.jsx'
import { getRequests } from '../../services/requestService'

export default function RequestManager() {
    const { t } = useTranslation(['text']);
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await getRequests();
                console.log(response)
                setRequests(response)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [])

    const handleAccept = (id) => {
        setRequests(requests.map((request) => (request.id === id ? { ...request, status: "accepted" } : request)))
    }

    const handleReject = (id) => {
        setRequests(requests.map((request) => (request.id === id ? { ...request, status: "rejected" } : request)))
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <Badge bg="warning" text="dark">
                        Pendiente
                    </Badge>
                )
            case "approved":
                return <Badge bg="success">Aceptada</Badge>
            case "rejected":
                return <Badge bg="danger">Rechazada</Badge>
            default:
                return <Badge bg="secondary">Desconocido</Badge>
        }
    }


    const getReportType = (report_type) => {
        switch (report_type) {
            case "1":
                return t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.ALL_TYPES');
            case "2":
                return t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_Z');
            case "3":
                return t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_RADIANT');
            case "4":
                return t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.REPORT_PHOTOMETRY');
            default:
                return t('CUSTOMIZE_SEARCH.REPORT_TYPE.SELECT.ALL_TYPES');
        }

    }

    

    const pendingRequests = requests?.filter((request) => request.status === "pending")
    const processedRequests = requests?.filter((request) => request.status !== "pending")

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="display-4 fw-bold">Mis Solicitudes</h1>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status" />
                </div>
            ) : error ? (
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            ) : (
                <>
                    {/* Solicitudes Pendientes */}
                    <Row className="mb-4">
                        <Col>
                            <Card>
                                <Card.Header className="bg-light">
                                    <Card.Title className="d-flex align-items-center gap-2 mb-0">
                                        <Calendar size={20} />
                                        Solicitudes Pendientes ({pendingRequests.length})
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    {pendingRequests.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No hay solicitudes pendientes</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table >
                                                <thead >
                                                    <tr>
                                                        <th>Desde</th>
                                                        <th>Hasta</th>
                                                        <th>Tipo de búsqueda</th>
                                                        <th>Descripción</th>
                                                        <th>Estado</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingRequests.map((request) => (
                                                        <tr key={request.id}>
                                                            <td>{formatDate(request.from_date)}</td>
                                                            <td>{formatDate(request.to_date)}</td>
                                                            <td>
                                                                {request.report_type === "2" ? (
                                                                    <>
                                                                        {getReportType(request.report_type)}, Altura: {request.height} km, Lat: {request.latitude}, Long: {request.longitude}, Radio: {request.ratio} km
                                                                    </>
                                                                ) : (
                                                                    getReportType(request.report_type)
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className="d-inline-block text-truncate"
                                                                    style={{ maxWidth: "200px" }}
                                                                    title={request.description}
                                                                >
                                                                    {request.description}
                                                                </span>
                                                            </td>
                                                            <td>{getStatusBadge(request.status)}</td>


                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Solicitudes Procesadas */}
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header className="bg-light">
                                    <Card.Title className="mb-0">Solicitudes Procesadas ({processedRequests.length})</Card.Title>
                                    <Card.Text className="text-muted mb-0">Historial de solicitudes aceptadas y rechazadas</Card.Text>
                                </Card.Header>
                                <Card.Body>
                                    {processedRequests.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No hay solicitudes procesadas</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table >
                                                <thead  >
                                                    <tr>
                                                        <th>Desde</th>
                                                        <th>Hasta</th>
                                                        <th>Tipo de búsqueda</th>
                                                        <th>Descripción</th>
                                                        <th>Estado</th>
                                                        <th className="text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {processedRequests.map((request) => (
                                                        <tr key={request.id}>
                                                            <td>{formatDate(request.from_date)}</td>
                                                            <td>{formatDate(request.to_date)}</td>
                                                            <td>
                                                                {request.report_type === "2" ? (
                                                                    <>
                                                                        {getReportType(request.report_type)}, Altura: {request.height} km, Lat: {request.latitude}, Long: {request.longitude}, Radio: {request.ratio} km
                                                                    </>
                                                                ) : (
                                                                    getReportType(request.report_type)
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className="d-inline-block text-truncate"
                                                                    style={{ maxWidth: "200px" }}
                                                                    title={request.description}
                                                                >
                                                                    {request.description}
                                                                </span>
                                                            </td>
                                                            <td>{getStatusBadge(request.status)}</td>
                                                            <td>
                                                                <div className="d-flex gap-2 justify-content-center">

                                                                    {request.status === "approved" && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-primary"
                                                                            onClick={() => handleDownload(request.id)} // define esta función según tu lógica de descarga
                                                                            className="d-flex align-items-center gap-1"
                                                                        >
                                                                            📥 Descargar
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    )
}
