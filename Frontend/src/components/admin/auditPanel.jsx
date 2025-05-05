import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Container, Row, Col } from 'react-bootstrap';
import { getDataByDateRange } from '../../services/auditService'
import { formatFullDate } from '@/pipe/formatFullDate.jsx'
import { useTranslation } from 'react-i18next';
import AccessChart from '../chart/AccessChart';
import BackToAdminPanel from './BackToAdminPanel';


const formatDateToInput = (date) => {
    return date.toISOString().split('T')[0];
};

const AuditPanel = () => {
    const { t } = useTranslation(['text']);

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(formatDateToInput(sevenDaysAgo));
    const [endDate, setEndDate] = useState(formatDateToInput(today));
    const [results, setResults] = useState([]);
    const [infoData, setInfoData] = useState([]);
    const [evenTypeData, setEventTypeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lineChartData, setLineChartData] = useState([]);

    const fetchAuditData = async () => {
        try {
            const response = await getDataByDateRange(startDate, endDate); // Suponiendo que AuditService está importado y tiene este método
            console.log(response)
            setResults(response.list);
            setInfoData(response.info);
            setEventTypeData(response.eventType);
            setLineChartData(response.lineChart);

            setLoading(true);
        } catch (error) {
            console.error('Error fetching audit data:', error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAuditData();
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    return (
        <>
            <BackToAdminPanel />

            <Container className="my-4">
                <h1 >{t('ADMIN.AUDIT_PAGE.TITLE')}</h1>
                <Form onSubmit={handleSearch}>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="startDate">
                                <Form.Label>{t('ADMIN.AUDIT_PAGE.START_DATE')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={(startDate)}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="endDate">
                                <Form.Label>{t('ADMIN.AUDIT_PAGE.END_DATE')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" type="submit">
                        {t('ADMIN.AUDIT_PAGE.SEARCH_BUTTON')}
                    </Button>
                </Form>

                {loading && (
                    <div className="row gx-4 gy-4 mt-3">
                        <div className="col-6 col-md-3">
                            <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.access_count}</small>
                                <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.ACCESS')}</span>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.not_mobile_count}</small>
                                <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.WEB_USER')}</span>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.is_mobile_count}</small>
                                <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.MOBILE_USER')}</span>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.ufoorbit_count}</small>
                                <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.DOWNLOAD_OF', { software: 'UFOORBIT' })}</span>
                            </div>
                        </div>

                        {infoData?.wmpl_count !== undefined && (
                            <div className="col-6 col-md-3">
                                <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                    <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.wmpl_count}</small>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.DOWNLOAD_OF', { software: 'WMPL' })}</span>
                                </div>
                            </div>
                        )}
                        {infoData?.gritsevich_count !== undefined && (
                            <div className="col-6 col-md-3">
                                <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                    <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.gritsevich_count}</small>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.DOWNLOAD_OF', { software: 'GRITSEVICH' })}</span>
                                </div>
                            </div>
                        )}
                        {infoData?.csv_count !== undefined && (
                            <div className="col-6 col-md-3">
                                <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                    <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.csv_count}</small>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.DOWNLOAD_OF', { software: 'CSV' })}</span>
                                </div>
                            </div>
                        )}
                        {infoData?.total_count !== undefined && (
                            <div className="col-6 col-md-3">
                                <div className="d-flex flex-column justify-content-center align-items-center border rounded-3 shadow-sm p-3 bg-white" style={{ height: '100px' }}>
                                    <small style={{ fontWeight: '600', fontSize: '1.3rem', color: '#212529' }}>{infoData?.new_user_count}</small>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: '#6c757d' }}>{t('ADMIN.AUDIT_PAGE.GRID.NEW_USERS')}</span>
                                </div>
                            </div>
                        )}
                    </div>

                )}

                {loading && (
                    <>
                        <AccessChart data={lineChartData} starDate={startDate} endDate={endDate} />
                    </>
                )}


                {loading ? (
                    <>
                        <h2 className="mt-4">Results</h2>
                        <table className="table table-striped mt-3">
                            <thead>
                                <tr>
                                    <th>{t('ADMIN.AUDIT_PAGE.TABLE.EVENT_TYPE')}</th>
                                    <th>{t('ADMIN.AUDIT_PAGE.TABLE.DATE')}</th>
                                    <th>{t('ADMIN.AUDIT_PAGE.TABLE.EVENT_TARGET')}</th>
                                    <th>{t('ADMIN.AUDIT_PAGE.TABLE.GUEST_USER')}</th>
                                    <th>{t('ADMIN.AUDIT_PAGE.TABLE.MOBILE_USER')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result, index) => (
                                    <tr key={index}>
                                        <td>{result.event_type}</td>
                                        <td>{formatFullDate(result.timestamp)}</td>
                                        <td>{result.event_target}</td>
                                        <td>{result.isGuest ? 'Yes' : 'No'}</td>
                                        <td>{result.isMobile ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>No results found.</p>
                )}
            </Container>
        </>
    );
};

export default AuditPanel;