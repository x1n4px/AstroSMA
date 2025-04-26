import React, { useState, useMemo } from 'react';
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { formatDate } from '@/pipe/formatDate.jsx';
import { useTranslation } from 'react-i18next';
import truncateDecimal from '@/pipe/truncateDecimal';
import formatShowerState from '@/pipe/formatShowerState';
import { useLogicDistance } from '@/pipe/useLogicDistance';

const ActiveRain = ({ activeShowerData = [], reportType, AIUShowerData = [] }) => {
    console.log(AIUShowerData);
    const { t } = useTranslation(['text']);
    const [selectedShower, setSelectedShower] = useState(null);
    const hasValidShowers = useMemo(() => {
        if (!activeShowerData || activeShowerData.length === 0) return false;
        return activeShowerData.some(shower => shower.src);
    }, [activeShowerData]);

    const allShowersEmpty = useMemo(() => {
        if (!activeShowerData || activeShowerData.length === 0) return true;
        return activeShowerData.every(shower => !shower.src);
    }, [activeShowerData]);

    const { getDistanceLabel } = useLogicDistance();

    return (
        <Container>
            <Row>
                <Col>
                    <h2 className="mb-3">{t('REPORT.ACTIVE_RAIN.IMO_TITLE')}</h2>
                    <div className="table-responsive mb-4">
                        {reportType === '1' && (
                            <Table striped bordered hover>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.NAME')}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.START_DATE')}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.END_DATE')}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '' })}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeShowerData && activeShowerData.length > 0 ? ( // Add this check
                                        activeShowerData.map((shower, index) => (
                                            <tr key={index}>
                                                <td>{shower.Identificador}</td>
                                                <td>{shower.Nombre}</td>
                                                <td>{formatDate(shower.Fecha_Inicio)}</td>
                                                <td>{formatDate(shower.Fecha_Fin)}</td>
                                                <td>{truncateDecimal(shower.Distancia_mínima_entre_radianes_y_trayectoria)}</td>
                                                <td>{getDistanceLabel(shower.membership)}</td>
                                                <td>
                                                    {shower.src ? (
                                                        <Button
                                                            style={{ backgroundColor: '#980100', border: '#980100' }}
                                                            onClick={() => setSelectedShower(shower)}
                                                            size="sm"
                                                        >
                                                            {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted"></span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                {hasValidShowers ? t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN') : t('REPORT.ACTIVE_RAIN.NO_SHOWERS_AVAILABLE')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}

                        {reportType === '2' && (
                            <Table striped bordered hover>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Ra of date)' })}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(De of date)' })}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Closer Ra)' })}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '(Close De)' })}</th>
                                        <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.DISTANCE')}</th>
                                        
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeShowerData && activeShowerData.length > 0 ? ( // Add this check
                                        activeShowerData.map((shower, index) => (
                                            <tr key={index}>
                                                <td>{shower.Lluvia_Identificador}</td>
                                                <td>{shower.Nombre}</td>
                                                <td>{shower.Ar_de_la_fecha}</td>
                                                <td>{shower.De_de_la_fecha}</td>
                                                <td>{shower.Ar_más_cercano}</td>
                                                <td>{shower.De_más_cercano}</td>
                                                
                                                <td>
                                                    {shower.src ? (
                                                        <Button
                                                            style={{ backgroundColor: '#980100', border: '#980100' }}
                                                            onClick={() => setSelectedShower(shower)}
                                                            size="sm"
                                                        >
                                                            {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted"></span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                {hasValidShowers ? t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN') : t('REPORT.ACTIVE_RAIN.NO_SHOWERS_AVAILABLE')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Col>
            </Row>

            {selectedShower?.src && (
                <Row>
                    <Col>
                        <h2 className="mb-3">Lluvia de meteoros: {selectedShower.Lluvia_Identificador} - {selectedShower.Nombre}</h2>
                        <div className="position-relative" style={{ height: '800px' }}>
                            <iframe
                                src={`https://www.meteorshowers.org/view/${selectedShower.src}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title={`Información de la lluvia de meteoros ${selectedShower.Lluvia_Identificador}`}
                            ></iframe>
                        </div>
                        <div className="mt-3">
                            <Button variant="secondary" onClick={() => setSelectedShower(null)}>
                                Ocultar
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}

            <Row>
                <Col>
                    <h2 className="mb-3">{t('REPORT.ACTIVE_RAIN.AIU_TITLE')}</h2>
                    <div className="table-responsive mb-4">
                        <Table striped bordered hover>
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.ID')}</th>
                                    <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.STATUS')}</th>
                                    <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.DATE')}</th>
                                    <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MINIMUM_DISTANCE', { it: '' })}</th>
                                    <th scope="col">{t('REPORT.ACTIVE_RAIN.TABLE.MEMBERSHIP_VALUE')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {AIUShowerData.length > 0 ? (
                                    AIUShowerData.map((shower, index) => (
                                        <tr key={index}>
                                            <td>{shower.Code}</td>
                                            <td>{formatShowerState(shower.Status, t)}</td>
                                            <td>{formatDate(shower.SubDate)}</td>
                                            <td>{shower.Distancia_mínima_entre_radianes_y_trayectoria} </td>
                                            <td>{getDistanceLabel(shower.membership)}</td>
                                            <td>
                                                    {shower.src ? (
                                                        <Button
                                                            style={{ backgroundColor: '#980100', border: '#980100' }}
                                                            onClick={() => setSelectedShower(shower)}
                                                            size="sm"
                                                        >
                                                            {t('REPORT.ACTIVE_RAIN.TABLE.SHOW_BUTTON')}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted"></span>
                                                    )}
                                                </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            {t('REPORT.ACTIVE_RAIN.NO_ACTIVE_RAIN')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

           
        </Container>
    );
};

export default ActiveRain;