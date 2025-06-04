import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '@/pipe/formatDate.jsx'
import { getReportData } from '@/services/bolideService.jsx';
import { useParams, Link } from "react-router-dom";
// Internationalization
import { useTranslation } from 'react-i18next';


const CustomizeSearchModal = ({ report, show, onHide }) => {
    const { t } = useTranslation(['text']);
    
    const [reportZData, setReportZData] = React.useState([]);
    const [reportRadiantData, setReportRadiantData] = React.useState([]);
    const [reportPhotometryData, setReportPhotometryData] = React.useState([]);

    useEffect(() => {
        if (report && show) {
            const fetchReportDetails = async () => {
                try {
                    const details = await getReportData({
                        IDs_Informe_Radiante: report.IDs_Informe_Radiante,
                        IDs_Informe_Fotometria: report.IDs_Informe_Fotometria,
                        IDs_Informe_Z: report.IDs_Informe_Z,
                    });
                    setReportZData(details.reportData);
                    setReportRadiantData(details.reportDataRadiant);
                    setReportPhotometryData(details.reportDataPhotometry);
                } catch (error) {
                    console.error('Error fetching report details:', error);
                }
            };

            fetchReportDetails();
        }
    }, [report, show]);

    return (
        <Modal show={show} onHide={onHide} centered size="xl">
            <Modal.Header closeButton>
                {report && (
                    <Modal.Title>{formatDate(report?.Fecha)} {report.Hora.substring(0, 8)}</Modal.Title>
                )}
            </Modal.Header>
            <Modal.Body>
                {reportZData.length > 0 && (
                    <div>
                        <h4 className="mb-0">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.TITLE')}</h4>
                        {/* <small className="text-muted d-block">Disponible los informes de fotometría</small> */}
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    {/* <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.ID')}</th> */}
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.DATE')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.HOUR')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.STATION_1')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_Z.STATION_2')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportZData.map((item, index) => (
                                    <tr>
                                        {/* <th scope="row">{item.IdInforme}</th> */}
                                        <th>{formatDate(item.Fecha)}</th>
                                        <td>{item.Hora.toString().substring(0, 8)}</td>
                                        <td>{item.Ob1}</td>
                                        <td>{item.Ob2}</td>
                                        <td>
                                            <Link
                                                to={`/report/${item.IdInforme}`}
                                                className="btn btn-primary btn-sm"
                                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                                target="_blank"
                                            >
                                                {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportRadiantData.length > 0 && (
                    <div className="mt-4">
                        <h4>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.TITLE')}</h4>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    {/* <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ID')}</th> */}
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.DATE')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.HOUR')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.STATION')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ASSOCIATED_RAIN')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ESTIMATED_TRAJECTORY')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ANGULAR_DISTANCE', {measure: 'º'})}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_RADIANT.ANGULAR_VELOCITY')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportRadiantData.map((item, index) => (
                                    <tr>
                                        {/* <th scope="row">{item.Identificador}</th> */}
                                        <th >{formatDate(item.Fecha)}</th>
                                        <td>{item.Hora.toString().substring(0, 8)}</td>
                                        <td>{item.Observatorio_Número}</td>
                                        <td>{item.Lluvia_Asociada}</td>
                                        <td>{item.Trayectorias_estimadas_para}</td>
                                        <td>{item.Distancia_angular_grados}</td>
                                        <td>{item.Velocidad_angular_grad_sec}</td>
                                        <td>
                                            <Link
                                                to={`/radiant-report/${item.Identificador}`}
                                                className="btn btn-primary btn-sm"
                                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                                target="_blank"
                                            >
                                                {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportPhotometryData.length > 0 && (
                    <div className="mt-4">
                        <h4>{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.TITLE')}</h4>

                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    {/* <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.ID')}</th> */}
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.DATE')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.HOUR')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.VISIBLE_STARS')}</th>
                                    <th scope="col">{t('CUSTOMIZE_SEARCH.MODAL.REPORT_PHOTOMETRY.STAR_USED_IN_REGRESSION')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportPhotometryData.map((item, index) => (
                                    <tr>
                                        {/* <th scope="row">{item.Identificador}</th> */}
                                        <td>{formatDate(item.Fecha)}</td>
                                        <td>{item.Hora.toString().substring(0, 8)}</td>
                                        <td>{item.Estrellas_visibles}</td>
                                        <td>{item.Estrellas_usadas_para_regresion}</td>
                                        <td>
                                            <Link
                                                to={`/photometry-report/${item.Identificador}`}
                                                className="btn btn-primary btn-sm"
                                                style={{ backgroundColor: '#980100', borderColor: '#980100' }}
                                                target="_blank"
                                            >
                                                {t('CUSTOMIZE_SEARCH.SHOW_BUTTON')}
                                            </Link>
                                        </td>
                                    </tr>

                                ))}
                            </tbody>
                        </table>

                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomizeSearchModal;