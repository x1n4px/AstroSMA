import React from 'react';
import { Button, Container } from 'react-bootstrap';
import {audit} from '../../../../services/auditService'
import { useTranslation } from 'react-i18next';
import { getOrbitFile } from '../../../../services/fileService';

const AssociatedDownloadReport = ({report}) => {
    const { t } = useTranslation(['text']);

    const handleDownload = async (button, software) => {
        try {
            let id1 = (software !== 'Gritsevich') ? 'x' : report.Observatorio_Número ;
            let id2 = (software !== 'Gritsevich') ? 'x' : report.Observatorio_Número2 ;

            const fileData = await getOrbitFile(report.Fecha, report.Hora, software, id1, id2);
            
            // Create a Blob from the file data
            const blob = new Blob([fileData], { type: 'application/octet-stream' });
            
            // Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a link element and trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${software}`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

            // Call the audit function
            const data = {
                isGuest: false,
                isMobile: isMobile,
                button_name: button,
                event_type: 'DOWNLOAD',
                event_target: `Descarga datos asociados a ${software} en /report/${report.IdInforme} en la pestaña de descargar informe asociado`,
                report_id: report.IdInforme
            };
            await audit(data);
            console.log('Audit successful');
        } catch (error) {
            console.error('Error during download or audit:', error);
        }
    };

    return (
        <Container className="mt-4">
            <h2>{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}</h2>
            <p>{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.DESCRIPTION')}</p>
            <div className="d-flex flex-column gap-3">
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('UFOORBIT','UFOORBIT.tgz')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'UFOORBIT', cty: 'Japanese'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('WMPL', 'wmpl.txt')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'WMPL', cty: 'Australian'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('GRITSEVICH', 'Gritsevich')}
                    
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'Gritsevich', cty: 'Finland'})}
                </Button>
            </div>
        </Container>
    );
};

export default AssociatedDownloadReport;