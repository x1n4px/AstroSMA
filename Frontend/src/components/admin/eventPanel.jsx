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
    const { t } = useTranslation(['text']);

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [qrCodeText, setQrCodeText] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const fetchedEvents = await getAllEvents();
            // Crucial: Ensure active and isWebOpen are booleans here
            const processedEvents = fetchedEvents.map(event => ({
                ...event,
                active: !!event.active, // Convert 0/1 or any truthy/falsy to true/false boolean
                isWebOpen: !!event.isWebOpen, // Convert 0/1 or any truthy/falsy to true/false boolean
            }));
            setEvents(processedEvents);
        };
        fetchEvents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentEvent(prevEvent => ({ // Use functional update for safety
            ...prevEvent,
            [name]: type === "checkbox" ? checked : value, // Checkboxes set directly as booleans
        }));
    };

    const handleSaveEvent = async () => {
        if (!currentEvent) return; // Guard clause in case currentEvent is null

        const eventToSave = { ...currentEvent };

        // Ensure event_date is in YYYY-MM-DD format
        if (eventToSave.event_date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(eventToSave.event_date)) {
                 eventToSave.event_date = new Date(eventToSave.event_date).toISOString().split('T')[0];
            }
        }

        // Convert booleans to 1 or 0 for the backend (MySQL TINYINT(1))
        eventToSave.active = eventToSave.active ? 1 : 0;
        eventToSave.isWebOpen = eventToSave.isWebOpen ? 1 : 0;

        try {
            let savedEventData;
            if (eventToSave.id) {
                // Update existing event
                savedEventData = await updateEvent(eventToSave.id, eventToSave);
            } else {
                // Add new event
                savedEventData = await createEvent(eventToSave);
            }

            // Crucial: Convert 0/1 from backend response back to booleans for frontend state
            const processedSavedEvent = {
                ...savedEventData,
                active: !!savedEventData.active, // Convert 0/1 to boolean
                isWebOpen: !!savedEventData.isWebOpen, // Convert 0/1 to boolean
            };

            if (eventToSave.id) {
                setEvents(events.map((event) => (event.id === processedSavedEvent.id ? processedSavedEvent : event)));
            } else {
                setEvents([...events, processedSavedEvent]);
            }
            setShowModal(false);
            setCurrentEvent(null);
        } catch (error) {
            console.error("Error saving event:", error);
            // Optionally, provide user feedback about the error
        }
    };

    const handleEditEvent = (event) => {
        // Crucial: Convert 0/1 to booleans when setting currentEvent for editing
        setCurrentEvent({
            ...event,
            event_date: new Date(event.event_date).toISOString().split('T')[0],
            active: !!event.active, // Ensure it's a boolean for the checkbox
            isWebOpen: !!event.isWebOpen, // Ensure it's a boolean for the checkbox
        });
        setShowModal(true);
    };

    const handleAddEvent = () => {
        // Initialize currentEvent with proper boolean defaults
        setCurrentEvent({
            event_date: "",
            description: "",
            startTime: "",
            endTime: "",
            isWebOpen: false, // Default to boolean false
            active: false, // Default to boolean false
            code: ""
        });
        setShowModal(true);
    };

    const handleDeleteEvent = async (id) => {
        try {
            await deleteEvent(id);
            setEvents(events.filter((event) => event.id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleShowQRCode = (eventCode) => {
        const currentPath = window.location.origin;
        const qrPath = "/qr-login/";
        const fullQrCodeText = `${currentPath}${qrPath}${eventCode}`;
        setQrCodeText(fullQrCodeText);
        setShowQrCodeModal(true);
    };

    return (
        <>
            <BackToAdminPanel />

            <div className="container my-4">
                <h2>{t('ADMIN.EVENT_PAGE.TITLE')}</h2>
                <ul className="list-group">
                    {events.map((event) => (
                        <li
                            key={event.id}
                            className={`list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 mb-2 rounded ${event.active ? "list-group-item-success border-success" : "border-secondary"}`}
                            style={{ borderLeft: event.active ? '5px solid #28a745' : '5px solid #6c757d', transition: 'all 0.3s ease-in-out' }}
                        >
                            <div className="flex-grow-1 mb-2 mb-md-0">
                                <div className="d-flex align-items-center mb-1">
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
                                {event.isWebOpen && (
                                    <div className="mt-2 d-flex align-items-center">
                                        <span>{t('ADMIN.EVENT_PAGE.CODE_LABEL')}: <strong className="text-dark">{event.code}</strong></span>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex align-items-center mt-2 mt-md-0">
                                {(event.isWebOpen && event.code) ? (
                                    <Button
                                        variant="outline-dark"
                                        className="me-2 d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: 'transparent', border: 'none' }}
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
                                    variant="outline-primary"
                                    className="me-2 d-flex align-items-center justify-content-center"
                                    style={{ backgroundColor: 'transparent', border: 'none' }}
                                    onClick={() => handleEditEvent(event)}
                                    title={t('ADMIN.EVENT_PAGE.EDIT_EVENT')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                        fill="black" viewBox="0 0 24 24" >
                                        <path d="m19.41,3c-.78-.78-2.05-.78-2.83,0L4.29,15.29c-.13.13-.22.29-.26.46l-1,4c-.08.34.01.7.26.95.19.19.45.29.71.29.08,0,.16,0,.24-.03l4-1c.18-.04.34-.13.46-.26l12.29-12.29c.78-.78.78-2.05,0-2.83l-1.59-1.59Zm-11.93,15.1l-2.11.53.53-2.11L15,7.41l1.59,1.59-9.1,9.1Zm10.51-10.51l-1.59-1.59,1.59-1.59,1.59,1.58-1.59,1.59Z"></path>
                                    </svg>
                                </Button>

                                <Button
                                    variant="outline-danger"
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
                                    checked={currentEvent?.active || false} // This should be a boolean
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label={t('ADMIN.EVENT_PAGE.MODAL.ACTIVE_WEB')}
                                    name="isWebOpen"
                                    checked={currentEvent?.isWebOpen || false} // This should be a boolean
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            {currentEvent?.isWebOpen && ( // This also expects a boolean
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('ADMIN.EVENT_PAGE.MODAL.CODE')}</Form.Label>
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