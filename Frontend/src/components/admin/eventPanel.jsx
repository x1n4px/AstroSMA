import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
} from "../../services/eventService";
import { formatDate } from "../../pipe/formatDate";
import { useTranslation } from 'react-i18next';
import BackToAdminPanel from './BackToAdminPanel';
import QRCodeComponent from "../QRCodeComponent";

const EventComponent = () => {
    const { t } = useTranslation(['text']); // Removed i18n as it's not directly used here

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false); // For Add/Edit Event Modal
    const [showQrCodeModal, setShowQrCodeModal] = useState(false); // For QR Code Modal
    const [currentEvent, setCurrentEvent] = useState(null);
    const [qrCodeText, setQrCodeText] = useState(''); // State to hold the text for the QR code

    useEffect(() => {
        // Fetch all events on component mount
        const fetchEvents = async () => {
            const fetchedEvents = await getAllEvents();
            setEvents(fetchedEvents);
        };
        fetchEvents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentEvent({
            ...currentEvent,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSaveEvent = async () => {
        if (currentEvent.id) {
            // Update existing event
            console.log(currentEvent);
            // Ensure event_date is in YYYY-MM-DD format before sending
            currentEvent.event_date = new Date(currentEvent.event_date).toISOString().split('T')[0];
            const updatedEvent = await updateEvent(currentEvent.id, currentEvent);
            setEvents(events.map((event) => (event.id === currentEvent.id ? updatedEvent : event)));
        } else {
            // Add new event
            const newEvent = await createEvent(currentEvent);
            setEvents([...events, newEvent]);
        }
        setShowModal(false);
        setCurrentEvent(null);
    };

    const handleEditEvent = (event) => {
        // Format date for the input type="date"
        event.event_date = formatDate(event.event_date, 'yyyy-mm-dd');
        setCurrentEvent(event);
        setShowModal(true);
    };

    const handleAddEvent = () => {
        setCurrentEvent({
            event_date: "",
            description: "",
            startTime: "",
            endTime: "",
            isWebOpen: false,
            active: false,
            code: ""
        });
        setShowModal(true);
    };

    const handleDeleteEvent = async (id) => {
        await deleteEvent(id);
        setEvents(events.filter((event) => event.id !== id));
    };

    // New handler for showing the QR code modal
    const handleShowQRCode = (eventCode) => {
        // Construct the full URL for the QR code.
        // Assuming the base URL for QR login is /qr-login/
        // You might need to adjust `window.location.origin` or add a specific base path
        const currentPath = window.location.origin; // e.g., "http://localhost:3000"
        const qrPath = "/qr-login/"; // The path where your QR login component is located
        const fullQrCodeText = `${currentPath}${qrPath}${eventCode}`;
        setQrCodeText(fullQrCodeText);
        setShowQrCodeModal(true);
    };

    return (
        <>
            <BackToAdminPanel />

            <div className="container my-4">
                <h2>{t('ADMIN.EVENT_PAGE.TITLE')}</h2> {/* Added translation */}
                <ul className="list-group">
                    {events.map((event) => (
                        <li
                            key={event.id}
                            className={`list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 mb-2 rounded ${event.active ? "list-group-item-success border-success" : "border-secondary"}`}
                            style={{ borderLeft: event.active ? '5px solid #28a745' : '5px solid #6c757d', transition: 'all 0.3s ease-in-out' }}
                        >
                            {/* Event Details Section */}
                            <div className="flex-grow-1 mb-2 mb-md-0">
                                <div className="d-flex align-items-center mb-1">
                                    {/* Active/Inactive Badge */}
                                    <span className={`badge me-2 ${event.active ? 'bg-success' : 'bg-secondary'}`}>
                                        {event.active ? t('ADMIN.EVENT_PAGE.STATUS_ACTIVE') : t('ADMIN.EVENT_PAGE.STATUS_INACTIVE')}
                                    </span>
                                    <strong className="text-primary fs-5">
                                        {formatDate(event.event_date)}
                                    </strong>
                                </div>
                                <div className="text-muted mb-1">
                                    <i className="far fa-clock me-1"></i> {event.startTime} - {event.endTime}
                                </div>
                                <div className="fw-normal">
                                    {event.description}
                                </div>
                                {/* Web Access Code and QR Code */}
                                {event.isWebOpen === 1 && (
                                    <div className="mt-2 d-flex align-items-center">
                                        <span>{t('ADMIN.EVENT_PAGE.CODE_LABEL')}: <strong className="text-dark">{event.code}</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Section */}
                            <div className="d-flex align-items-center mt-2 mt-md-0">
                                {/* QR Code Button - Only show if isWebOpen and code exists */}
                                {(event.isWebOpen && event.code) ? (
                                    <Button
                                        variant="outline-dark" // Use outline variant for a softer look
                                        className="me-2 d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: 'transparent', border: 'none' }} // Circular button
                                        onClick={() => handleShowQRCode(event.code)}
                                        title={t('ADMIN.EVENT_PAGE.SHOW_QR')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                            fill="currentColor" viewBox="0 0 24 24" >
                                            <path d="m4,4h4v-2h-4c-1.1,0-2,.9-2,2v4h2v-4Z"></path><path d="m4,16h-2v4c0,1.1.9,2,2,2h4v-2h-4v-4Z"></path><path d="m20,20h-4v2h4c1.1,0,2-.9,2-2v-4h-2v4Z"></path><path d="m20,2h-4v2h4v4h2v-4c0-1.1-.9-2-2-2Z"></path><path d="m9.5,5h-3c-.83,0-1.5.67-1.5,1.5v3c0,.83.67,1.5,1.5,1.5h3c.83,0,1.5-.67,1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5Zm-.5,4h-2v-2h2v2Z"></path><path d="m9.5,13h-3c-.83,0-1.5.67-1.5,1.5v3c0,.83.67,1.5,1.5,1.5h3c.83,0,1.5-.67,1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5Zm-.5,4h-2v-2h2v2Z"></path><path d="m14.5,11h3c.83,0,1.5-.67,1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5h-3c-.83,0-1.5.67-1.5,1.5v3c0,.83.67,1.5,1.5,1.5Zm.5-4h2v2h-2v-2Z"></path><path d="M13 13H15V15H13z"></path><path d="M15 15H17V17H15z"></path><path d="M17 17H19V19H17z"></path><path d="M17 13H19V15H17z"></path>
                                        </svg>
                                    </Button>
                                ) : (<></>)}

                                <Button
                                    variant="outline-primary" // Use outline variant for edit
                                    className="me-2 d-flex align-items-center justify-content-center"
                                    style={{ backgroundColor: 'transparent', border: 'none' }} // Circular button
                                    onClick={() => handleEditEvent(event)}
                                    title={t('ADMIN.EVENT_PAGE.EDIT_EVENT')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                        fill="black" viewBox="0 0 24 24" >
                                        <path d="m19.41,3c-.78-.78-2.05-.78-2.83,0L4.29,15.29c-.13.13-.22.29-.26.46l-1,4c-.08.34.01.7.26.95.19.19.45.29.71.29.08,0,.16,0,.24-.03l4-1c.18-.04.34-.13.46-.26l12.29-12.29c.78-.78.78-2.05,0-2.83l-1.59-1.59Zm-11.93,15.1l-2.11.53.53-2.11L15,7.41l1.59,1.59-9.1,9.1Zm10.51-10.51l-1.59-1.59,1.59-1.59,1.59,1.58-1.59,1.59Z"></path>
                                    </svg>
                                </Button>

                                <Button
                                    variant="outline-danger" // Use outline variant for delete
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ backgroundColor: 'transparent', border: 'none' }}
                                    onClick={() => handleDeleteEvent(event.id)}
                                    title={t('ADMIN.EVENT_PAGE.DELETE_EVENT')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                        fill="black" viewBox="0 0 24 24" >
                                        <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path><path d="M9 10h2v8H9zM13 10h2v8h-2z"></path>
                                    </svg>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                <Button className="mt-3" style={{ backgroundColor: '#980100', border: '#980100' }} onClick={handleAddEvent}>
                    {t('ADMIN.EVENT_PAGE.ADD_BUTTON')}
                </Button>

                {/* Modal for Add/Edit Event */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('ADMIN.EVENT_PAGE.MODAL.TITLE')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.DATE')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="event_date"
                                    value={currentEvent?.event_date || ""}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.DESCRIPTION')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    value={currentEvent?.description || ""}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.START_TIME')}</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="startTime"
                                    value={currentEvent?.startTime || ""}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.END_TIME')}</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="endTime"
                                    value={currentEvent?.endTime || ""}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label={t('ADMIN.EVENT_PAGE.MODAL.ACTIVE')}
                                    name="active"
                                    checked={currentEvent?.active || false}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label={t('ADMIN.EVENT_PAGE.MODAL.ACTIVE_WEB')}
                                    name="isWebOpen"
                                    checked={currentEvent?.isWebOpen || false}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            {currentEvent?.isWebOpen && (
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.CODE')}</Form.Label> {/* Corrected label */}
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={currentEvent?.code || ""}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            {t('ADMIN.EVENT_PAGE.MODAL.CLOSE_BUTTON')}
                        </Button>
                        <Button style={{ backgroundColor: '#980100', border: '#980100' }} onClick={handleSaveEvent}>
                            {t('ADMIN.EVENT_PAGE.MODAL.SAVE_BUTTON')}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* New Modal for QR Code Display */}
                <Modal show={showQrCodeModal} onHide={() => setShowQrCodeModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('ADMIN.EVENT_PAGE.QR_MODAL.TITLE')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        {qrCodeText ? (
                            <>
                                <QRCodeComponent text={qrCodeText} size={256} level="H" />
                                <p className="mt-3 text-muted">
                                    {t('ADMIN.EVENT_PAGE.QR_MODAL.SCAN_INSTRUCTION')}
                                    <br />
                                    <code>{qrCodeText}</code>
                                </p>
                            </>
                        ) : (
                            <p>{t('ADMIN.EVENT_PAGE.QR_MODAL.NO_CODE')}</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowQrCodeModal(false)}>
                            {t('ADMIN.EVENT_PAGE.QR_MODAL.CLOSE_BUTTON')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default EventComponent;