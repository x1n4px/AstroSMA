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

const EventComponent = () => {
    const { t, i18n } = useTranslation(['text']);

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

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
            console.log((currentEvent));
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
        });
        setShowModal(true);
    };

    const handleDeleteEvent = async (id) => {
        await deleteEvent(id);
        setEvents(events.filter((event) => event.id !== id));
    };

    return (
        <div className="container mt-4">
            <h2>Event List</h2>
            <ul className="list-group">
                {events.map((event) => (
                    <li
                        key={event.id}
                        className={`list-group-item d-flex justify-content-between align-items-center ${event.active ? "list-group-item-success" : ""}`}
                    >
                        <div>
                            <strong>{formatDate(event.event_date)} </strong> {": "}  {event.startTime} {"-"} {event.endTime} -{" "}  {event.description} -{" "}
                            {event.active ? "Active" : "Inactive"}
                            {event.isWebOpen ? " - Web Open" : ""}
                        </div>
                        <div>
                            <Button
                                variant="link"
                                className="ms-3"
                                onClick={() => handleEditEvent(event)}
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "black"}}><path d="M8.707 19.707 18 10.414 13.586 6l-9.293 9.293a1.003 1.003 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263zM21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586 19.414 9 21 7.414z"></path></svg>
                            </Button>
                            <Button
                                variant="link"
                                className="ms-3 text-danger"
                                onClick={() => handleDeleteEvent(event.id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "#980100"}}><path d="M6 7H5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7H6zm4 12H8v-9h2v9zm6 0h-2v-9h2v9zm.618-15L15 2H9L7.382 4H3v2h18V4z"></path></svg>
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
            <Button className="mt-3" style={{backgroundColor: '#980100', border: '#980100' }} onClick={handleAddEvent}>
                {t('ADMIN.EVENT_PAGE.ADD_BUTTON')}
            </Button>

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
                                value={(currentEvent?.event_date)}
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button  style={{backgroundColor: '#980100', border: '#980100' }}  onClick={handleSaveEvent}>
                        Save Event
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EventComponent;