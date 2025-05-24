// src/components/modal/DownloadConfirmModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DownloadConfirmModal = ({ show, onHide, onConfirm }) => {
    const { t } = useTranslation(['text']);
    const [description, setDescription] = useState('');

    const handleConfirmClick = () => {
        onConfirm(description);
        setDescription(''); // Limpiar la descripción después de confirmar
    };

    const handleCloseClick = () => {
        onHide();
        setDescription(''); // Limpiar la descripción al cerrar
    };

    return (
        <Modal show={show} onHide={handleCloseClick} centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('DOWNLOAD_MODAL.TITLE')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{t('DOWNLOAD_MODAL.MESSAGE')}</p>
                <Form.Group controlId="downloadDescription">
                    <Form.Label>{t('DOWNLOAD_MODAL.DESCRIPTION_LABEL')}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('DOWNLOAD_MODAL.DESCRIPTION_PLACEHOLDER')}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseClick}>
                    {t('DOWNLOAD_MODAL.CLOSE_BUTTON')}
                </Button>
                <Button variant="primary" style={{ backgroundColor: '#980100', borderColor: '#980100' }} onClick={handleConfirmClick}>
                    {t('DOWNLOAD_MODAL.ACCEPT_BUTTON')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DownloadConfirmModal;