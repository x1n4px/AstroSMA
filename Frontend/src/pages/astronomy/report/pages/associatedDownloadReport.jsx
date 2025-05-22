import React, { useState } from 'react';
import { Button, Container, Alert, Spinner, Row, Col, Card } from 'react-bootstrap'; // Added Row, Col, Card
import { audit } from '@/services/auditService';
import { useTranslation } from 'react-i18next';
import { getOrbitFile } from '@/services/fileService';

// Make sure you have Bootstrap Icons CSS included in your project.
// For example, in your public/index.html:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

const downloadItems = [
    {
        id: 'ufoorbit',
        icon: 'bi-archive-fill', // Example icon for tgz/archives
        apiButtonName: 'UFOORBIT', // Used as Card Title
        fileName: 'UFOORBIT.tgz',
        translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK', // For button text
        translationValues: { name: 'UFOORBIT', cty: 'Japanese' }, // cty for Card Subtitle
    },
    {
        id: 'wmpl',
        icon: 'bi-file-text-fill', // Example icon for text files
        apiButtonName: 'WMPL',
        fileName: 'wmpl.txt',
        translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK',
        translationValues: { name: 'WMPL', cty: 'Australian' },
    },
    {
        id: 'gritsevich',
        icon: 'bi-file-earmark-zip-fill', // Example icon for zip files
        apiButtonName: 'GRITSEVICH',
        fileName: 'Gritsevich.zip', // Assuming it's a zip
        translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.LINK',
        translationValues: { name: 'Gritsevich', cty: 'Finland' },
    },
    {
        id: 'meteorglow',
        icon: 'bi-graph-up-arrow', // Example icon for data/analysis
        apiButtonName: 'METEORGLOW',
        fileName: 'MeteorGlow_data.zip', // Example filename
        translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.METEOR_GLOW',
        translationValues: {}, // No specific 'name' or 'cty' for this structure here
    },
    {
        id: 'rawdata',
        icon: 'bi-database-fill-down', // Example icon for raw data
        apiButtonName: 'RAWDATA',
        fileName: 'RawData.zip', // Example filename
        translationKey: 'REPORT.ASSOCIATED_DOWNLOAD_LINK.RAW_DATA',
        translationValues: {},
    },
];

const AssociatedDownloadReport = ({ report }) => {
    const { t } = useTranslation(['text']);
    const [loadingSoftware, setLoadingSoftware] = useState(null);
    const [error, setError] = useState(null);

    const handleDownload = async (apiButtonName, fileNameToDownload) => {
        setLoadingSoftware(fileNameToDownload);
        setError(null);
        try {
            const fileData = await getOrbitFile(
                apiButtonName,
                report.Fecha,
                report.Hora,
                fileNameToDownload,
                report.Observatorio_Número,
                report.Observatorio_Número2
            );

            const blob = new Blob([fileData], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileNameToDownload;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

            const auditData = {
                isGuest: false,
                isMobile: isMobile,
                button_name: apiButtonName,
                event_type: 'DOWNLOAD',
                event_target: `Descarga datos asociados a ${apiButtonName} en /report/${report.IdInforme} en la pestaña de descargar informe asociado`,
                report_id: report.IdInforme,
            };
            await audit(auditData);

        } catch (err) {
            setError(t('REPORT.ASSOCIATED_DOWNLOAD_LINK.ERROR_GENERAL', { software: apiButtonName}));
        } finally {
            setLoadingSoftware(null);
        }
    };

    return (
        <Container className="mt-4 mb-5"> {/* Added mb-5 for more spacing at the bottom */}
            <h2 className="mb-3">{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.TITLE')}</h2>
            <p className="mb-4">{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.DESCRIPTION')}</p>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
                    {error}
                </Alert>
            )}

            <Row className="g-4"> {/* g-4 provides gap between columns and rows */}
                {downloadItems.map((item) => {
                    const isLoading = loadingSoftware === item.fileName;
                    // Determine Card Title and Subtitle
                    let cardTitle = item.apiButtonName;
                    if (item.translationKey === 'REPORT.ASSOCIATED_DOWNLOAD_LINK.METEOR_GLOW' || item.translationKey === 'REPORT.ASSOCIATED_DOWNLOAD_LINK.RAW_DATA') {
                        // For items like MeteorGlow or RawData, the key itself provides a good title
                        cardTitle = t(item.translationKey);
                    } else if (item.translationValues && item.translationValues.name) {
                        cardTitle = item.translationValues.name;
                    }
                    
                    const cardSubtitle = item.translationValues?.cty || null;

                    return (
                        <Col xs={12} md={6} key={item.id} className="d-flex"> {/* d-flex to help with equal height cards in a row */}
                            <Card className="w-100 shadow-sm"> {/* shadow-sm adds a subtle lift */}
                                <Card.Body className="d-flex flex-column"> {/* flex-column to push button to bottom */}
                                    <div className="d-flex align-items-start mb-3">
                                        {item.icon && <i className={`bi ${item.icon} fs-1 me-3 text-danger`}></i>} {/* Icon: fs-1 for larger size */}
                                        <div>
                                            <Card.Title as="h5" className="mb-1">{cardTitle}</Card.Title>
                                            {cardSubtitle && (
                                                <Card.Subtitle className="text-muted">{cardSubtitle}</Card.Subtitle>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* You could add a Card.Text here for more detailed description if needed */}
                                    {/* <Card.Text className="text-muted small">
                                        {t('REPORT.ASSOCIATED_DOWNLOAD_LINK.FILE_TYPE_INFO', {type: item.fileName.split('.').pop()})}
                                    </Card.Text> */}

                                    <Button
                                        style={{ backgroundColor: '#980100', borderColor: '#980100' }} // Custom button color
                                        onClick={() => handleDownload(item.apiButtonName, item.fileName)}
                                        disabled={isLoading || (loadingSoftware !== null && loadingSoftware !== item.fileName)}
                                        className="mt-auto" // Pushes button to the bottom of the card
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                <span className="ms-2">{t('REPORT.ASSOCIATED_DOWNLOAD_LINK.LOADING_TEXT')}</span>
                                            </>
                                        ) : (
                                            // Use the original translation key for button text for consistency
                                            t(item.translationKey, item.translationValues)
                                        )}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default AssociatedDownloadReport;