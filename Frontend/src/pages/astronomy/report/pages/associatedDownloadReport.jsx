import React from 'react';
import { Button, Container } from 'react-bootstrap';
import {audit} from '../../../../services/auditing'
import { useTranslation } from 'react-i18next';


const AssociatedDownloadReport = ({report}) => {
    const { t } = useTranslation(['text']);
    console.log(report)
    const handleDownload = (fileName) => {
        // Simulate file download
        const link = document.createElement('a');
        //link.href = `/downloads/${fileName}`;
        //link.download = fileName;
        //link.click();
        // Call the audit function
        const data = {
            fileName: fileName,
            reportId: report.IdInforme
        };
        audit(data)
            .then((response) => {
                console.log('Audit successful:', response);
            })
            .catch((error) => {
                console.error('Error during audit:', error);
            });
    };

    return (
        <Container className="mt-4">
            <h2>{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}</h2>
            <p>{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.DESCRIPTION')}</p>
            <div className="d-flex flex-column gap-3">
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('UFOORBIT_Japanese_Software.zip')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'UFOORBIT', cty: 'Japanese'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('WMPL_Australian_Software.zip')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'WMPL', cty: 'Australian'})}
                </Button>
                <Button
                    style={{backgroundColor: '#980100', border: '#980100', color: 'white'}}
                    onClick={() => handleDownload('Gritsevich_Finland_Software.zip')}
                >
                    {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', {name: 'Gritsevich', cty: 'Finland'})}
                </Button>
            </div>
        </Container>
    );
};

export default AssociatedDownloadReport;