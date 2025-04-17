import React from 'react';
import { Button, Container } from 'react-bootstrap';
import {audit} from '../../../../services/auditing'
import { useTranslation } from 'react-i18next';
import { getOrbitFile } from '../../../../services/fileService';

const AssociatedDownloadReport = ({report}) => {
    const { t } = useTranslation(['text']);

    const handleDownload = async (software) => {
        try {
            const fileData = await getOrbitFile(report.Fecha, report.Hora, software);
            
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

            // Call the audit function
            const data = {
                fileName: `${software}`,
                reportId: report.IdInforme
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
                    onClick={() => handleDownload('UFOORBIT.tgz')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'UFOORBIT', cty: 'Japanese'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('wmpl.txt')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'WMPL', cty: 'Australian'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('Gritsevich')}
                    disabled
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'Gritsevich', cty: 'Finland'})}
                </Button>
            </div>
        </Container>
    );
};

export default AssociatedDownloadReport;