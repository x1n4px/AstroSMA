import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Spinner,
  Alert,
} from 'react-bootstrap';
import BackToAdminPanel from './BackToAdminPanel';

// Asumo que tienes esto configurado para i18n
import { useTranslation } from 'react-i18next';

import { createRain, deleteRain, duplicateRain, getRainByYear, updateRain } from '../../services/activeShower';
import { formatDate } from '../../pipe/formatDate';

const ActiveRainPanel = () => {
  const { t } = useTranslation(); // Inicializa el hook de traducción

  const [selectedYear, setSelectedYear] = useState('');
  const [rainfalls, setRainfalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRainfall, setCurrentRainfall] = useState(null); // Para editar/crear
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newRain, setNewRain] = useState(false);

  // --- New state for success/error messages modal ---
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [infoModalVariant, setInfoModalVariant] = useState('success'); // 'success' or 'danger'

  // --- New state for confirmation modal (e.g., delete, duplicate) ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => { }); // Stores the function to execute on confirmation
  const [confirmInputYear, setConfirmInputYear] = useState(''); // For the duplicate year input

  // Función para obtener los datos de las lluvias
  const fetchRainfalls = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRainByYear(year);
      setRainfalls(response);
    } catch (err) {
      setError(t('ADMIN.ACTIVE_RAIN.FETCH_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  // Manejador del botón de búsqueda
  const handleSearch = () => {
    if (selectedYear) {
      fetchRainfalls(selectedYear);
    } else {
      setError(t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_PLACEHOLDER')); // Usamos la misma clave para el mensaje de error
    }
  };

  // Manejador para abrir el modal de creación
  const handleCreate = () => {
    setCurrentRainfall({
      Identificador: '',
      Año: '',
      Nombre: '',
      Fecha_Inicio: '',
      Fecha_Fin: '',
      Velocidad: '',
    });
    setIsEditing(false);
    setNewRain(true);
    setFormErrors({});
    setShowModal(true);
  };

  // Manejador para abrir el modal de modificación
  const handleModify = (rainfall) => {
    const formattedRainfall = {
      ...rainfall,
      Fecha_Inicio: formatDate(rainfall.Fecha_Inicio, 'yyyy-mm-dd'),
      Fecha_Fin: formatDate(rainfall.Fecha_Fin, 'yyyy-mm-dd'),
    };
    setCurrentRainfall({ ...formattedRainfall }); // Copia para evitar mutación directa
    setIsEditing(true);
    setFormErrors({});
    setShowModal(true);
  };

  // Manejador para eliminar una lluvia
  const handleDelete = (id, year) => {
    setConfirmModalTitle(t('ADMIN.ACTIVE_RAIN.DELETE_CONFIRM_TITLE'));
    setConfirmModalMessage(t('ADMIN.ACTIVE_RAIN.DELETE_CONFIRM_MESSAGE'));
    setConfirmInputYear(''); // Clear input for delete
    setConfirmAction(() => async () => {
      setLoading(true);
      setError(null);
      try {
        await deleteRain(id, year);
        setRainfalls(rainfalls.filter((rain) => rain.Identificador !== id));
        setShowInfoModal(true);
        setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'));
        setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.DELETE_SUCCESS'));
        setInfoModalVariant('success');
      } catch (err) {
        setError(t('ADMIN.ACTIVE_RAIN.DELETE_ERROR'));
        console.error('Error deleting rainfall:', err);
        setShowInfoModal(true);
        setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'));
        setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.DELETE_ERROR'));
        setInfoModalVariant('danger');
      } finally {
        setLoading(false);
        setShowConfirmModal(false); // Close confirmation modal
      }
    });
    setShowConfirmModal(true); // Open confirmation modal
  };

  // Manejador para duplicar todas las lluvias
  const handleDuplicateAll = () => {
    setConfirmModalTitle(t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_TITLE'));
    setConfirmModalMessage(t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_MESSAGE'));
    setConfirmInputYear(''); // Initialize for input
    setConfirmAction(() => async () => {
      const targetYear = confirmInputYear; // Use the value from the input in the modal

      if (targetYear && !isNaN(parseInt(targetYear)) && parseInt(targetYear) > 0) {
        setLoading(true);
        setError(null);
        try {
          const response = await duplicateRain(targetYear);
          if (selectedYear === targetYear) {
            fetchRainfalls(selectedYear);
          }
          setShowInfoModal(true);
          setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'));
          setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.DUPLICATE_SUCCESS', { year: targetYear }));
          setInfoModalVariant('success');
        } catch (err) {
          setError(t('ADMIN.ACTIVE_RAIN.DUPLICATE_ERROR'));
          console.error('Error duplicating rainfalls:', err);
          setShowInfoModal(true);
          setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'));
          setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.DUPLICATE_ERROR'));
          setInfoModalVariant('danger');
        } finally {
          setLoading(false);
          setShowConfirmModal(false); // Close confirmation modal
        }
      } else {
        setShowInfoModal(true);
        setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.WARNING_TITLE'));
        setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.INVALID_YEAR_ALERT'));
        setInfoModalVariant('warning');
        setShowConfirmModal(false); // Close confirmation modal if year is invalid
      }
    });
    setShowConfirmModal(true); // Open confirmation modal
  };

  // Manejador para enviar el formulario del modal (crear/modificar)
  const handleSubmitModal = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!currentRainfall.Año || isNaN(parseInt(currentRainfall.Año))) {
      errors.Año = t('ADMIN.ACTIVE_RAIN.VALIDATION_YEAR_REQUIRED');
    }
    if (!currentRainfall.Nombre.trim()) {
      errors.Nombre = t('ADMIN.ACTIVE_RAIN.VALIDATION_NAME_REQUIRED');
    }
    if (!currentRainfall.Fecha_Inicio) {
      errors.Fecha_Inicio = t('ADMIN.ACTIVE_RAIN.VALIDATION_START_DATE_REQUIRED');
    }
    if (!currentRainfall.Fecha_Fin) {
      errors.Fecha_Fin = t('ADMIN.ACTIVE_RAIN.VALIDATION_END_DATE_REQUIRED');
    }
    if (!currentRainfall.Velocidad || isNaN(parseFloat(currentRainfall.Velocidad))) {
      errors.Velocidad = t('ADMIN.ACTIVE_RAIN.VALIDATION_SPEED_REQUIRED');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        try {
          const response = await updateRain(currentRainfall.Identificador, currentRainfall, currentRainfall.Año);
          setRainfalls(
            rainfalls.map((rain) =>
              rain.Identificador === currentRainfall.Identificador ? response : rain
            )
          );
          setShowInfoModal(true);
          setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'));
          setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.UPDATE_SUCCESS'));
          setInfoModalVariant('success');
        } catch (error) {
          console.error('Error updating rainfall:', error);
          setShowInfoModal(true);
          setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'));
          setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.UPDATE_ERROR'));
          setInfoModalVariant('danger');
        }
      } else {
        setNewRain(false);
        const response = await createRain(currentRainfall);
        setRainfalls([...rainfalls, response]);
        setShowInfoModal(true);
        setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'));
        setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.CREATE_SUCCESS'));
        setInfoModalVariant('success');
      }
      setShowModal(false);
    } catch (err) {
      setError(t('ADMIN.ACTIVE_RAIN.CREATE_ERROR')); // Para el caso de error general en creación/modificación
      console.error('Error submitting rainfall:', err);
      setShowInfoModal(true);
      setInfoModalTitle(t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'));
      setInfoModalMessage(t('ADMIN.ACTIVE_RAIN.CREATE_ERROR')); // Usamos la misma clave
      setInfoModalVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackToAdminPanel />

      <Container className="my-5">
        <h1 className="mb-4">{t('ADMIN.ACTIVE_RAIN.TITLE')}</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4 align-items-end">
          <Col md={3}>
            <Form.Group controlId="yearSelect">
              <Form.Label>{t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_LABEL')}</Form.Label>
              <Form.Control
                as="select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">{t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_PLACEHOLDER')}</option>
                {Array.from(
  { length: new Date().getFullYear() + 1 - 2014 + 1 },
  (_, i) => 2014 + i
).map((year) => (
  <option key={year} value={year}>
    {year}
  </option>
))}

              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Button style={{ backgroundColor: '#980100', border: '#980100' }} onClick={handleSearch} className="me-2" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : t('ADMIN.ACTIVE_RAIN.SEARCH_BUTTON')}
            </Button>
          </Col>
          <Col md={6} className="text-end">
            <Button type="button" style={{ color: '#980100', background: 'transparent', border: '#980100 1px solid', marginRight: '5px' }} onClick={handleCreate}>
              {t('ADMIN.ACTIVE_RAIN.CREATE_BUTTON')}
            </Button>
            <Button type="button" style={{ color: '#980100', background: 'transparent', border: '#980100 1px solid', marginRight: '' }} onClick={handleDuplicateAll} disabled={loading || rainfalls.length === 0}>
              {t('ADMIN.ACTIVE_RAIN.DUPLICATE_ALL_BUTTON')}
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">{t('ADMIN.ACTIVE_RAIN.LOADING_MESSAGE')}</span>
            </Spinner>
          </div>
        )}

        {!loading && rainfalls.length === 0 && selectedYear && (
          <Alert variant="info">{t('ADMIN.ACTIVE_RAIN.NO_RAIN_FOUND', { year: selectedYear })}</Alert>
        )}

        {!loading && rainfalls.length > 0 && (
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_IDENTIFIER')}</th>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_NAME')}</th>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_START_DATE')}</th>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_END_DATE')}</th>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_SPEED')}</th>
                <th>{t('ADMIN.ACTIVE_RAIN.TABLE_ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {rainfalls.map((rain) => (
                <tr key={rain.Identificador}>
                  <td>{rain.Identificador}</td>
                  <td>{rain.Nombre}</td>
                  <td>{formatDate(rain.Fecha_Inicio)}</td>
                  <td>{formatDate(rain.Fecha_Fin)}</td>
                  <td>{rain.Velocidad}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleModify(rain)}
                    >
                      {t('ADMIN.ACTIVE_RAIN.MODIFY_BUTTON')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(rain.Identificador, rain.Año)}
                    >
                      {t('ADMIN.ACTIVE_RAIN.DELETE_BUTTON')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal para Crear/Modificar Lluvia */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? t('ADMIN.ACTIVE_RAIN.MODIFY_MODAL_TITLE') : t('ADMIN.ACTIVE_RAIN.CREATE_MODAL_TITLE')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitModal}>
              <Form.Group className="mb-3" controlId="formIdentificador">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_IDENTIFIER_LABEL')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('ADMIN.ACTIVE_RAIN.FORM_IDENTIFIER_PLACEHOLDER')}
                  value={currentRainfall?.Identificador || ''}
                  onChange={(e) =>
                    setCurrentRainfall({ ...currentRainfall, Identificador: e.target.value })
                  }
                  disabled={!newRain}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formAño">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_YEAR_LABEL')}</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={t('ADMIN.ACTIVE_RAIN.FORM_YEAR_PLACEHOLDER')}
                  value={currentRainfall?.Año || ''}
                  onChange={(e) =>
                    setCurrentRainfall({ ...currentRainfall, Año: parseInt(e.target.value) || '' })
                  }
                  disabled={!newRain}
                  isInvalid={!!formErrors.Año}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Año}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_NAME_LABEL')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('ADMIN.ACTIVE_RAIN.FORM_NAME_PLACEHOLDER')}
                  value={currentRainfall?.Nombre || ''}
                  onChange={(e) =>
                    setCurrentRainfall({ ...currentRainfall, Nombre: e.target.value })
                  }
                  isInvalid={!!formErrors.Nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formFechaInicio">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_START_DATE_LABEL')}</Form.Label>
                <Form.Control
                  type="date"
                  value={currentRainfall?.Fecha_Inicio || ''}
                  onChange={(e) =>
                    setCurrentRainfall({ ...currentRainfall, Fecha_Inicio: e.target.value })
                  }
                  isInvalid={!!formErrors.Fecha_Inicio}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Fecha_Inicio}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formFechaFin">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_END_DATE_LABEL')}</Form.Label>
                <Form.Control
                  type="date"
                  value={currentRainfall?.Fecha_Fin || ''}
                  onChange={(e) =>
                    setCurrentRainfall({ ...currentRainfall, Fecha_Fin: e.target.value })
                  }
                  isInvalid={!!formErrors.Fecha_Fin}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Fecha_Fin}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formVelocidad">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_SPEED_LABEL')}</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  placeholder={t('ADMIN.ACTIVE_RAIN.FORM_SPEED_PLACEHOLDER')}
                  value={currentRainfall?.Velocidad || ''}
                  onChange={(e) =>
                    setCurrentRainfall({
                      ...currentRainfall,
                      Velocidad: parseFloat(e.target.value) || '',
                    })
                  }
                  isInvalid={!!formErrors.Velocidad}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Velocidad}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  {t('ADMIN.ACTIVE_RAIN.FORM_CANCEL_BUTTON')}
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : isEditing ? (
                    t('ADMIN.ACTIVE_RAIN.FORM_SAVE_BUTTON')
                  ) : (
                    t('ADMIN.ACTIVE_RAIN.FORM_CREATE_BUTTON')
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal para Mensajes de Información/Éxito/Error */}
        <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className={`text-${infoModalVariant}`}>{infoModalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{infoModalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
              {t('ADMIN.ACTIVE_RAIN.INFO_MODAL_CLOSE')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para Confirmación (Borrar o Duplicar) */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{confirmModalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{confirmModalMessage}</p>
            {confirmModalTitle === t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_TITLE') && (
              <Form.Group className="mb-3">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.DUPLICATE_YEAR_LABEL')}</Form.Label> {/* Added new key */}
                <Form.Control
                  type="number"
                  placeholder={t('ADMIN.ACTIVE_RAIN.DUPLICATE_YEAR_PLACEHOLDER')}
                  value={confirmInputYear}
                  onChange={(e) => setConfirmInputYear(e.target.value)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              {t('ADMIN.ACTIVE_RAIN.FORM_CANCEL_BUTTON')}
            </Button>
            <Button variant="primary" onClick={confirmAction}>
              {t('ADMIN.ACTIVE_RAIN.CONFIRM_BUTTON')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ActiveRainPanel;