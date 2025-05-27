"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from "react-bootstrap"
import { Check, X, Calendar, User, Building,AlarmClock } from "lucide-react"
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/pipe/formatDate.jsx'
import { getRequests, updateRequest } from '../../services/requestService'
import { useLocation } from "react-router-dom";
import { getBolideWithCustomSearchCSV } from '@/services/bolideService.jsx';
import { audit } from '@/services/auditService'


export default function Request() {
    const { t } = useTranslation(['text']);
    const location = useLocation();
    const isAdminView = location.pathname === '/admin-panel/request-panel';
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [downloadingId, setDownloadingId] = useState(null); // New state for tracking downloading request ID

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await getRequests(isAdminView);
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

    const handleAccept = async (id) => {
        try {
            await updateRequest(id, { status: "approved" });
            setRequests(requests.map((request) =>
                request.id === id ? { ...request, status: "approved" } : request
            ));
        } catch (error) {
            console.error("Error al aceptar la solicitud:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await updateRequest(id, { status: "rejected" });
            setRequests(requests.map((request) =>
                request.id === id ? { ...request, status: "rejected" } : request
            ));
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error);
        }
    };

    const handlePending = async (id) => {
        try {
            await updateRequest(id, { status: "pending" });
            setRequests(requests.map((request) =>
                request.id === id ? { ...request, status: "pending" } : request
            ));
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error);
        }
    };

    const handleApplyFiltersCSV = async (id) => {
        setDownloadingId(id); 
        try {
            const request = requests.find((req) => req.id === id);
            console.log(request)
            const heightFilter = request.height;
            const latFilter = request.latitude;
            const lonFilter = request.longitude;
            const ratioFilter = request.ratio;
            const heightChecked = request.height !== null && request.height !== undefined;
            const latLonChecked = request.latitude !== null && request.latitude !== undefined && request.longitude !== null && request.longitude !== undefined;
            const dateRangeChecked = request.from_date !== null && request.to_date !== null;
            const startDate = formatDate(request.from_date);
            const endDate = (request.to_date);
            const actualPage = 0; // Asumiendo que siempre se descarga desde la primera página
            const reportType = request.report_type;

            const response = await getBolideWithCustomSearchCSV({
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
                actualPage,
                reportType
            });
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            setDownloadingId(null); // Reset downloading ID after the request is made
            // Call the audit function
            const data = {
                isGuest: false,
                isMobile: isMobile,
                button_name: 'CSV',
                event_type: 'DOWNLOAD',
                event_target: `Descarga datos asociados a CSV en búsqueda personalizada`,
                report_id: 0
            };
            await audit(data);

            // Verifica que la respuesta sea un blob (archivo)
            if (response.data instanceof Blob) {
                const url = window.URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'meteor_reports.xlsx'); // Usa el mismo nombre que en el servidor
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('La respuesta no contiene un archivo válido');
            }
        } catch (error) {
            setDownloadingId(null); 
        }
    };


    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <Badge bg="warning" text="dark">
                        {t('REQUEST.STATUS.PENDING')}
                    </Badge>
                )
            case "approved":
                return <Badge bg="success">{t('REQUEST.STATUS.ACCEPTED')}</Badge>
            case "rejected":
                return <Badge bg="danger">{t('REQUEST.STATUS.REJECTED')}</Badge>
            default:
                return <Badge bg="secondary">{t('REQUEST.STATUS.UNKNOWN')}</Badge>
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
                    <h1 className="display-4 fw-bold">{isAdminView ? t('REQUEST.TITLE_ADMIN') : t('REQUEST.TITLE')}</h1>
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
                                        {t('REQUEST.PENDING_REQUESTS')} ({pendingRequests.length})
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    {pendingRequests.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">{t('REQUEST.NO_REQUESTS')}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table >
                                                <thead >
                                                    <tr>
                                                        {isAdminView && (
                                                            <>
                                                                <th>{t('REQUEST.TABLE.REQUESTER')}</th>
                                                                <th>{t('REQUEST.TABLE.ENTITY')}</th>
                                                            </>
                                                        )}
                                                        <th>{t('REQUEST.TABLE.FROM')}</th>
                                                        <th>{t('REQUEST.TABLE.TO')}</th>
                                                        <th>{t('REQUEST.TABLE.REQUEST_TYPE')}</th>
                                                        <th>{t('REQUEST.TABLE.DESCRIPTION')}</th>
                                                        <th>{t('REQUEST.TABLE.STATUS')}</th>
                                                        {isAdminView && (
                                                            <>
                                                                <th>{t('REQUEST.TABLE.ACTION')}</th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingRequests.map((request) => (
                                                        <tr key={request.id}>
                                                            {isAdminView && (
                                                                <>
                                                                    <td>{request.requester_name} {request.requester_surname}</td>
                                                                    <td>{request.requester_institucion}</td>
                                                                </>
                                                            )}
                                                            <td>{formatDate(request.from_date)}</td>
                                                            <td>{formatDate(request.to_date)}</td>
                                                            <td>
                                                                {request.report_type === "2" ? (
                                                                    <>
                                                                        {getReportType(request.report_type)}, {t('REQUEST.TABLE.HEIGHT')}: {request.height} km, {t('REQUEST.TABLE.LATITUDE')}: {request.latitude}, {t('REQUEST.TABLE.LONGITUDE')}: {request.longitude}, {t('REQUEST.TABLE.SEARCH_RADIUS')}: {request.ratio} km
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
                                                            {isAdminView && (
                                                                <>
                                                                    <td>
                                                                        <div className="d-flex gap-2 justify-content-center">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-success"
                                                                                onClick={() => handleAccept(request.id)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <Check size={16} />
                                                                                {t('REQUEST.TABLE.ACCEPT_BTN')}
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-danger"
                                                                                onClick={() => handleReject(request.id)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <X size={16} />
                                                                                {t('REQUEST.TABLE.REJECT_BTN')}
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}

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
                                    <Card.Title className="mb-0">{t('REQUEST.PROCESS_REQUESTS')} ({processedRequests.length})</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    {processedRequests.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">{t('REQUEST.NO_REQUESTS')}</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table >
                                                <thead  >
                                                    <tr>
                                                        {isAdminView && (
                                                            <>
                                                                <th>{t('REQUEST.TABLE.REQUESTER')}</th>
                                                                <th>{t('REQUEST.TABLE.REVIEWER')}</th>
                                                            </>
                                                        )}
                                                        <th>{t('REQUEST.TABLE.FROM')}</th>
                                                        <th>{t('REQUEST.TABLE.TO')}</th>
                                                        <th>{t('REQUEST.TABLE.REQUEST_TYPE')}</th>
                                                        <th>{t('REQUEST.TABLE.DESCRIPTION')}</th>
                                                        <th>{t('REQUEST.TABLE.STATUS')}</th>
                                                        <th className="text-center">{t('REQUEST.TABLE.ACTION')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {processedRequests.map((request) => (
                                                        <tr key={request.id}>
                                                            {isAdminView && (
                                                                <>
                                                                    <td>{request.requester_name} {request.requester_surname} ({request.requester_institucion})</td>
                                                                    <td>{request.reviewer_name} {request.reviewer_surname}</td>
                                                                </>
                                                            )}
                                                            <td>{formatDate(request.from_date)}</td>
                                                            <td>{formatDate(request.to_date)}</td>
                                                            <td>
                                                                {request.report_type === "2" ? (
                                                                    <>
                                                                        {getReportType(request.report_type)}, {t('REQUEST.TABLE.HEIGHT')}: {request.height} km, {t('REQUEST.TABLE.LATITUDE')}: {request.latitude}, {t('REQUEST.TABLE.LONGITUDE')}: {request.longitude}, {t('REQUEST.TABLE.SEARCH_RADIUS')}: {request.ratio} km
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
                                                            {isAdminView ? (
                                                                <>
                                                                    <td>
                                                                        <div className="d-flex gap-2 justify-content-center">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-success"
                                                                                onClick={() => handleAccept(request.id)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <Check size={16} />
                                                                                {t('REQUEST.TABLE.ACCEPT_BTN')}
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-danger"
                                                                                onClick={() => handleReject(request.id)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <X size={16} />
                                                                                {t('REQUEST.TABLE.REJECT_BTN')}
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-warning"
                                                                                onClick={() => handlePending(request.id)}
                                                                                className="d-flex align-items-center gap-1"
                                                                            >
                                                                                <AlarmClock size={16} />
                                                                                {t('REQUEST.TABLE.PENDING_BTN')}
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td>
                                                                        <div className="d-flex gap-2 justify-content-center">

                                                                            {request.status === "approved" && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline-primary"
                                                                                    onClick={() => handleApplyFiltersCSV(request.id)} // define esta función según tu lógica de descarga
                                                                                    className="d-flex align-items-center gap-1"
                                                                                    disabled={downloadingId === request.id} // Deshabilita el botón si ya se está descargando
                                                                                >
                                                                                     {downloadingId === request.id ? (
                                                                                        <>
                                                                                            <Spinner
                                                                                                as="span"
                                                                                                animation="border"
                                                                                                size="sm"
                                                                                                role="status"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                            Cargando...
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                             📥 {t('REQUEST.TABLE.REQUEST_DOWNLOAD')}
                                                                                        </>
                                                                                    )}
                                                                                   
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row >
                </>
            )
            }
        </Container >
    )
}
