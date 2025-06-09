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
  Card,
  Badge
} from 'react-bootstrap';
import BackToAdminPanel from './BackToAdminPanel';
import { useTranslation } from 'react-i18next';
import { createRain, deleteRain, duplicateRain, getRainByYear, updateRain, generateMeteorShowerTxt } from '../../services/activeShower';
import { formatDate } from '../../pipe/formatDate';

const ActiveRainPanel = () => {
  const { t } = useTranslation();

  // State management
  const [selectedYear, setSelectedYear] = useState('');
  const [rainfalls, setRainfalls] = useState([]);
  const [loading, setLoading] = useState({
    main: false,
    modal: false,
    action: false
  });
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({
    show: false,
    type: 'create', // 'create' or 'edit'
    data: null,
    errors: {},
    radiantModal: {
      show: false,
      type: 'create', // 'create' or 'edit'
      data: null,
      errors: {},
      index: null // For editing existing radiants
    }
  });
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    inputYear: ''
  });

  // Fetch rainfall data
  const fetchRainfalls = async (year) => {
    setLoading(prev => ({ ...prev, main: true }));
    setError(null);
    try {
      const response = await getRainByYear(year);
      console.log(response)
      setRainfalls(response);
    } catch (err) {
      setError(t('ADMIN.ACTIVE_RAIN.FETCH_ERROR'));
    } finally {
      setLoading(prev => ({ ...prev, main: false }));
    }
  };

  // Handle year search
  const handleSearch = () => {
    if (selectedYear) {
      fetchRainfalls(selectedYear);
    } else {
      setError(t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_PLACEHOLDER'));
    }
  };

  // Open create modal
  const handleCreate = () => {
    setModal({
      show: true,
      type: 'create',
      data: {
        Identificador: '',
        Año: selectedYear || '',
        Nombre: '',
        Fecha_Inicio: '',
        Fecha_Fin: '',
        Velocidad: '',
        radiants: [] // Initialize empty radiants array
      },
      errors: {},
      radiantModal: {
        show: false,
        type: 'create',
        data: null,
        errors: {},
        index: null
      }
    });
  };

  // Open edit modal
  const handleEdit = (rainfall) => {
    setModal({
      show: true,
      type: 'edit',
      data: {
        ...rainfall,
        Fecha_Inicio: formatDate(rainfall.Fecha_Inicio, 'yyyy-mm-dd'),
        Fecha_Fin: formatDate(rainfall.Fecha_Fin, 'yyyy-mm-dd'),
        radiants: rainfall.radiants || [] // Ensure Radiantes array exists
      },
      errors: {},
      radiantModal: {
        show: false,
        type: 'create',
        data: null,
        errors: {},
        index: null
      }
    });
  };

  // Handle delete with confirmation
  const handleDelete = (id, year) => {
    setConfirmation({
      show: true,
      title: t('ADMIN.ACTIVE_RAIN.DELETE_CONFIRM_TITLE'),
      message: t('ADMIN.ACTIVE_RAIN.DELETE_CONFIRM_MESSAGE'),
      action: async () => {
        try {
          setLoading(prev => ({ ...prev, action: true }));
          await deleteRain(id, year);
          setRainfalls(rainfalls.filter(rain => rain.Identificador !== id));
          showNotification(
            t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'),
            t('ADMIN.ACTIVE_RAIN.DELETE_SUCCESS'),
            'success'
          );
        } catch (err) {
          showNotification(
            t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'),
            t('ADMIN.ACTIVE_RAIN.DELETE_ERROR'),
            'danger'
          );
        } finally {
          setLoading(prev => ({ ...prev, action: false }));
        }
      },
      inputYear: ''
    });
  };

  // Handle duplicate all
  const handleDuplicateAll = () => {
    setConfirmation({
      show: true,
      title: t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_TITLE'),
      message: t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_MESSAGE'),
      action: async () => {
        const targetYear = confirmation.inputYear;
        if (!targetYear || isNaN(parseInt(targetYear)) || parseInt(targetYear) <= 0) {
          showNotification(
            t('ADMIN.ACTIVE_RAIN.WARNING_TITLE'),
            t('ADMIN.ACTIVE_RAIN.INVALID_YEAR_ALERT'),
            'warning'
          );
          return;
        }

        try {
          setLoading(prev => ({ ...prev, action: true }));
          await duplicateRain(targetYear);
          if (selectedYear === targetYear) {
            fetchRainfalls(selectedYear);
          }
          showNotification(
            t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'),
            t('ADMIN.ACTIVE_RAIN.DUPLICATE_SUCCESS', { year: targetYear }),
            'success'
          );
        } catch (err) {
          showNotification(
            t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'),
            t('ADMIN.ACTIVE_RAIN.DUPLICATE_ERROR'),
            'danger'
          );
        } finally {
          setLoading(prev => ({ ...prev, action: false }));
        }
      },
      inputYear: ''
    });
  };


  const handleGenerateMeteorShowerTxt = async () => {
    if (!selectedYear) {
      showNotification(
        t('ADMIN.ACTIVE_RAIN.WARNING_TITLE'),
        t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_PLACEHOLDER'),
        'warning'
      );
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const response = await generateMeteorShowerTxt(selectedYear);
      console.log(response)
      const blob = new Blob([response], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cal${selectedYear}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showNotification(
        t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'),
        t('ADMIN.ACTIVE_RAIN.GENERATE_SUCCESS', { year: selectedYear }),
        'success'
      );
    } catch (err) {
      showNotification(
        t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'),
        t('ADMIN.ACTIVE_RAIN.GENERATE_ERROR'),
        'danger'
      );
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }

  // Show notification helper
  const showNotification = (title, message, type = 'success') => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  // Validate rain form
  const validateRainForm = (data) => {
    const errors = {};
    if (!data.Año || isNaN(parseInt(data.Año))) {
      errors.Año = t('ADMIN.ACTIVE_RAIN.VALIDATION_YEAR_REQUIRED');
    }
    if (!data.Nombre.trim()) {
      errors.Nombre = t('ADMIN.ACTIVE_RAIN.VALIDATION_NAME_REQUIRED');
    }
    if (!data.Fecha_Inicio) {
      errors.Fecha_Inicio = t('ADMIN.ACTIVE_RAIN.VALIDATION_START_DATE_REQUIRED');
    }
    if (!data.Fecha_Fin) {
      errors.Fecha_Fin = t('ADMIN.ACTIVE_RAIN.VALIDATION_END_DATE_REQUIRED');
    }
    if (!data.Velocidad || isNaN(parseFloat(data.Velocidad))) {
      errors.Velocidad = t('ADMIN.ACTIVE_RAIN.VALIDATION_SPEED_REQUIRED');
    }
    return errors;
  };

  // Validate radiant form
  const validateRadiantForm = (data) => {
    const errors = {};
    if (!data.alpha || isNaN(parseFloat(data.alpha))) {
      errors.alpha = 'Alpha is required and must be a number';
    }
    if (!data.delta || isNaN(parseFloat(data.delta))) {
      errors.delta = 'Delta is required and must be a number';
    }
    if (!data.date) {
      errors.date = 'Date is required';
    }
    return errors;
  };

  // Handle rain form submission
  const handleRainSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRainForm(modal.data);

    if (Object.keys(errors).length > 0) {
      setModal(prev => ({ ...prev, errors }));
      return;
    }

    setLoading(prev => ({ ...prev, modal: true }));
    try {
      if (modal.type === 'edit') {
        const response = await updateRain(modal.data.Identificador, modal.data, modal.data.Año);

        //setRainfalls(rainfalls.map(rain =>
        //  rain.Identificador === modal.data.Identificador ? response : rain
        //));
        showNotification(
          t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'),
          t('ADMIN.ACTIVE_RAIN.UPDATE_SUCCESS'),
          'success'
        );
        console.log(selectedYear)
        fetchRainfalls(selectedYear)
      } else {
        const response = await createRain(modal.data);
        //setRainfalls([...rainfalls, response]);
        showNotification(
          t('ADMIN.ACTIVE_RAIN.SUCCESS_TITLE'),
          t('ADMIN.ACTIVE_RAIN.CREATE_SUCCESS'),
          'success'
        );
        fetchRainfalls(selectedYear)
      }
      setModal(prev => ({ ...prev, show: false }));
    } catch (err) {
      showNotification(
        t('ADMIN.ACTIVE_RAIN.ERROR_TITLE'),
        t(modal.type === 'edit' ? 'ADMIN.ACTIVE_RAIN.UPDATE_ERROR' : 'ADMIN.ACTIVE_RAIN.CREATE_ERROR'),
        'danger'
      );
    } finally {
      setLoading(prev => ({ ...prev, modal: false }));
    }
  };

  // Handle rain field change
  const handleRainFieldChange = (field, value) => {
    setModal(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: null }
    }));
  };

  // Open radiant create modal
  const handleCreateRadiant = () => {
    setModal(prev => ({
      ...prev,
      radiantModal: {
        show: true,
        type: 'create',
        data: {
          alpha: '',
          delta: '',
          date: formatDate(new Date().toISOString(), 'yyyy-mm-dd')
        },
        errors: {},
        index: null
      }
    }));
  };

  // Open radiant edit modal
  const handleEditRadiant = (radiant, index) => {
    setModal(prev => ({
      ...prev,
      radiantModal: {
        show: true,
        type: 'edit',
        data: { ...radiant },
        errors: {},
        index
      }
    }));
  };

  // Handle radiant field change
  const handleRadiantFieldChange = (field, value) => {
    setModal(prev => ({
      ...prev,
      radiantModal: {
        ...prev.radiantModal,
        data: { ...prev.radiantModal.data, [field]: value },
        errors: { ...prev.radiantModal.errors, [field]: null }
      }
    }));
  };

  // Handle radiant form submission
  const handleRadiantSubmit = (e) => {
    e.preventDefault();
    const errors = validateRadiantForm(modal.radiantModal.data);

    if (Object.keys(errors).length > 0) {
      setModal(prev => ({
        ...prev,
        radiantModal: { ...prev.radiantModal, errors }
      }));
      return;
    }

    const newRadiants = [...(modal.data.radiants || [])];

    if (modal.radiantModal.type === 'edit' && modal.radiantModal.index !== null) {
      // Update existing radiant
      newRadiants[modal.radiantModal.index] = modal.radiantModal.data;
    } else {
      // Add new radiant
      newRadiants.push(modal.radiantModal.data);
    }

    setModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        radiants: newRadiants
      },
      radiantModal: {
        ...prev.radiantModal,
        show: false
      }
    }));
  };

  // Handle radiant delete
  const handleDeleteRadiant = (index) => {
    const newRadiants = [...(modal.data.radiants || [])];
    const radiant = newRadiants[index];

    if (radiant) {
      if (radiant.id != null) {
        // Si tiene id, marcar con deleted = true
        newRadiants[index] = { ...radiant, deleted: true };
      } else {
        // Si no tiene id, eliminar del array
        newRadiants.splice(index, 1);
      }
    }

    setModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        radiants: newRadiants
      }
    }));
  };


  // Year options for dropdown
  const yearOptions = Array.from(
    { length: new Date().getFullYear() + 1 - 2014 + 1 },
    (_, i) => 2014 + i
  );

  return (
    <>
      <BackToAdminPanel />

      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">{t('ADMIN.ACTIVE_RAIN.TITLE')}</h1>
          <div>
            <Button
              variant="outline-primary"
              onClick={handleCreate}
              className="me-2"
            >
              {t('ADMIN.ACTIVE_RAIN.CREATE_BUTTON')}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleDuplicateAll}
              disabled={loading.main || rainfalls?.length === 0}
              className="me-2"
            >
              {t('ADMIN.ACTIVE_RAIN.DUPLICATE_ALL_BUTTON')}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={handleGenerateMeteorShowerTxt}
              disabled={loading.main || rainfalls?.length === 0}
            >
              Generar Cal
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>{t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_LABEL')}</Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    disabled={loading.main}
                  >
                    <option value="">{t('ADMIN.ACTIVE_RAIN.SELECT_YEAR_PLACEHOLDER')}</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading.main || !selectedYear}
                  className="w-100"
                >
                  {loading.main ? (
                    <Spinner as="span" size="sm" animation="border" />
                  ) : (
                    t('ADMIN.ACTIVE_RAIN.SEARCH_BUTTON')
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading.main ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">{t('ADMIN.ACTIVE_RAIN.LOADING_MESSAGE')}</p>
          </div>
        ) : rainfalls?.length === 0 && selectedYear ? (
          <Alert variant="info">
            {t('ADMIN.ACTIVE_RAIN.NO_RAIN_FOUND', { year: selectedYear })}
          </Alert>
        ) : rainfalls?.length > 0 && (
          <Card>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>{t('ADMIN.ACTIVE_RAIN.TABLE_IDENTIFIER')}</th>
                      <th>{t('ADMIN.ACTIVE_RAIN.TABLE_NAME')}</th>
                      <th>{t('ADMIN.ACTIVE_RAIN.TABLE_START_DATE')}</th>
                      <th>{t('ADMIN.ACTIVE_RAIN.TABLE_END_DATE')}</th>
                      <th>{t('ADMIN.ACTIVE_RAIN.TABLE_SPEED')}</th>
                      <th className="text-end">{t('ADMIN.ACTIVE_RAIN.TABLE_ACTIONS')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rainfalls.map(rain => (
                      <tr key={rain.Identificador}>
                        <td>
                          <Badge bg="light" text="dark">
                            {rain.Identificador}
                          </Badge>
                        </td>
                        <td>{rain.Nombre}</td>
                        <td>{formatDate(rain.Fecha_Inicio)}</td>
                        <td>{formatDate(rain.Fecha_Fin)}</td>
                        <td>{rain.Velocidad}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(rain)}
                          >
                            {t('ADMIN.ACTIVE_RAIN.MODIFY_BUTTON')}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(rain.Identificador, rain.Año)}
                            disabled={loading.action}
                          >
                            {loading.action ? (
                              <Spinner as="span" size="sm" animation="border" />
                            ) : (
                              t('ADMIN.ACTIVE_RAIN.DELETE_BUTTON')
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Create/Edit Rain Modal */}
        <Modal
          show={modal.show}
          onHide={() => setModal(prev => ({ ...prev, show: false }))}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {modal.type === 'edit'
                ? t('ADMIN.ACTIVE_RAIN.MODIFY_MODAL_TITLE')
                : t('ADMIN.ACTIVE_RAIN.CREATE_MODAL_TITLE')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Form onSubmit={handleRainSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_IDENTIFIER_LABEL')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('ADMIN.ACTIVE_RAIN.FORM_IDENTIFIER_PLACEHOLDER')}
                          value={modal.data?.Identificador || ''}
                          onChange={(e) => handleRainFieldChange('Identificador', e.target.value)}
                          disabled={modal.type === 'edit'}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_YEAR_LABEL')}</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder={t('ADMIN.ACTIVE_RAIN.FORM_YEAR_PLACEHOLDER')}
                          value={modal.data?.Año || ''}
                          onChange={(e) => handleRainFieldChange('Año', parseInt(e.target.value) || '')}
                          disabled={modal.type === 'edit'}
                          isInvalid={!!modal.errors?.Año}
                        />
                        <Form.Control.Feedback type="invalid">
                          {modal.errors?.Año}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_NAME_LABEL')}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t('ADMIN.ACTIVE_RAIN.FORM_NAME_PLACEHOLDER')}
                          value={modal.data?.Nombre || ''}
                          onChange={(e) => handleRainFieldChange('Nombre', e.target.value)}
                          isInvalid={!!modal.errors?.Nombre}
                        />
                        <Form.Control.Feedback type="invalid">
                          {modal.errors?.Nombre}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_START_DATE_LABEL')}</Form.Label>
                            <Form.Control
                              type="date"
                              value={modal.data?.Fecha_Inicio || ''}
                              onChange={(e) => handleRainFieldChange('Fecha_Inicio', e.target.value)}
                              isInvalid={!!modal.errors?.Fecha_Inicio}
                            />
                            <Form.Control.Feedback type="invalid">
                              {modal.errors?.Fecha_Inicio}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_END_DATE_LABEL')}</Form.Label>
                            <Form.Control
                              type="date"
                              value={modal.data?.Fecha_Fin || ''}
                              onChange={(e) => handleRainFieldChange('Fecha_Fin', e.target.value)}
                              isInvalid={!!modal.errors?.Fecha_Fin}
                            />
                            <Form.Control.Feedback type="invalid">
                              {modal.errors?.Fecha_Fin}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('ADMIN.ACTIVE_RAIN.FORM_SPEED_LABEL')}</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.1"
                          placeholder={t('ADMIN.ACTIVE_RAIN.FORM_SPEED_PLACEHOLDER')}
                          value={modal.data?.Velocidad || ''}
                          onChange={(e) => handleRainFieldChange('Velocidad', parseFloat(e.target.value) || '')}
                          isInvalid={!!modal.errors?.Velocidad}
                        />
                        <Form.Control.Feedback type="invalid">
                          {modal.errors?.Velocidad}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Radiantes</h5>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleCreateRadiant}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                          fill="currentColor" viewBox="0 0 24 24" >
                          <path d="M3 13h8v8h2v-8h8v-2h-8V3h-2v8H3z"></path>
                        </svg> {t('ADMIN.ACTIVE_RAIN.CREATE_RADIANT_BUTTON')}
                      </Button>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {modal.data?.radiants?.length > 0 ? (
                        modal.data.radiants.filter(radiant => !radiant.deleted).map((radiant, index) => (
                          <Card key={index} className="mb-3 shadow-sm">
                            <Card.Body>
                              <Row className="g-2">
                                <Col md={4}>
                                  <Form.Label>α</Form.Label>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={radiant.alpha}
                                    readOnly
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Label>δ</Form.Label>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={radiant.delta}
                                    readOnly
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Label>📅 Fecha</Form.Label>
                                  <Form.Control
                                    type="date"
                                    value={formatDate(radiant.date, 'yyyy-mm-dd')}
                                    readOnly
                                  />
                                </Col>
                              </Row>
                              <div className="d-flex justify-content-end mt-3">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditRadiant(radiant, index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor" viewBox="0 0 24 24" >
                                    <path d="m19.41,3c-.78-.78-2.05-.78-2.83,0L4.29,15.29c-.13.13-.22.29-.26.46l-1,4c-.08.34.01.7.26.95.19.19.45.29.71.29.08,0,.16,0,.24-.03l4-1c.18-.04.34-.13.46-.26l12.29-12.29c.78-.78.78-2.05,0-2.83l-1.59-1.59Zm-11.93,15.1l-2.11.53.53-2.11L15,7.41l1.59,1.59-9.1,9.1Zm10.51-10.51l-1.59-1.59,1.59-1.59,1.59,1.58-1.59,1.59Z"></path>
                                  </svg> {t('ADMIN.ACTIVE_RAIN.EDIT_BTN')}
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteRadiant(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor" viewBox="0 0 24 24" >
                                    <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path>
                                  </svg> {t('ADMIN.ACTIVE_RAIN.DELETE_BUTTON')}
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        ))
                      ) : (
                        <Alert variant="info" className="mb-0">
                          {t('ADMIN.ACTIVE_RAIN.NO_RADIANT_FOUND')}
                        </Alert>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setModal(prev => ({ ...prev, show: false }))}
            >
              {t('ADMIN.ACTIVE_RAIN.FORM_CANCEL_BUTTON')}
            </Button>
            <Button
              variant="primary"
              onClick={handleRainSubmit}
              disabled={loading.modal}
            >
              {loading.modal ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : modal.type === 'edit' ? (
                t('ADMIN.ACTIVE_RAIN.FORM_SAVE_BUTTON')
              ) : (
                t('ADMIN.ACTIVE_RAIN.FORM_CREATE_BUTTON')
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Radiant Create/Edit Modal */}
        <Modal
          show={modal.radiantModal.show}
          onHide={() => setModal(prev => ({
            ...prev,
            radiantModal: { ...prev.radiantModal, show: false }
          }))}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {modal.radiantModal.type === 'edit'
                ? t('ADMIN.ACTIVE_RAIN.EDIT_RADIANT_TITLE')
                : t('ADMIN.ACTIVE_RAIN.CREATE_RADIANT_TITLE')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleRadiantSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>α (Right Ascension)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={modal.radiantModal.data?.alpha || ''}
                      onChange={(e) => handleRadiantFieldChange('alpha', e.target.value)}
                      isInvalid={!!modal.radiantModal.errors?.alpha}
                    />
                    <Form.Control.Feedback type="invalid">
                      {modal.radiantModal.errors?.alpha}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>δ (Declinación)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={modal.radiantModal.data?.delta || ''}
                      onChange={(e) => handleRadiantFieldChange('delta', e.target.value)}
                      isInvalid={!!modal.radiantModal.errors?.delta}
                    />
                    <Form.Control.Feedback type="invalid">
                      {modal.radiantModal.errors?.delta}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>📅 Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={formatDate(modal.radiantModal.data?.date, 'yyyy-mm-dd') || ''}
                  onChange={(e) => handleRadiantFieldChange('date', e.target.value)}
                  isInvalid={!!modal.radiantModal.errors?.date}
                />
                <Form.Control.Feedback type="invalid">
                  {modal.radiantModal.errors?.date}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setModal(prev => ({
                ...prev,
                radiantModal: { ...prev.radiantModal, show: false }
              }))}
            >
              {t('ADMIN.ACTIVE_RAIN.FORM_CANCEL_BUTTON')}
            </Button>
            <Button
              variant="primary"
              onClick={handleRadiantSubmit}
            >
              {modal.radiantModal.type === 'edit'
                ? t('ADMIN.ACTIVE_RAIN.FORM_SAVE_BUTTON')
                : t('ADMIN.ACTIVE_RAIN.FORM_CREATE_BUTTON')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Notification Modal */}
        <Modal
          show={notification.show}
          onHide={() => setNotification(prev => ({ ...prev, show: false }))}
          centered
        >
          <Modal.Header closeButton className={`bg-${notification.type === 'danger' ? 'danger' : 'success'} text-white`}>
            <Modal.Title>{notification.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{notification.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant={notification.type === 'danger' ? 'danger' : 'success'}
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            >
              {t('ADMIN.ACTIVE_RAIN.INFO_MODAL_CLOSE')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          show={confirmation.show}
          onHide={() => setConfirmation(prev => ({ ...prev, show: false }))}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{confirmation.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{confirmation.message}</p>
            {confirmation.title === t('ADMIN.ACTIVE_RAIN.DUPLICATE_CONFIRM_TITLE') && (
              <Form.Group className="mt-3">
                <Form.Label>{t('ADMIN.ACTIVE_RAIN.DUPLICATE_YEAR_LABEL')}</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={t('ADMIN.ACTIVE_RAIN.DUPLICATE_YEAR_PLACEHOLDER')}
                  value={confirmation.inputYear}
                  onChange={(e) => setConfirmation(prev => ({ ...prev, inputYear: e.target.value }))}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setConfirmation(prev => ({ ...prev, show: false }))}
            >
              {t('ADMIN.ACTIVE_RAIN.FORM_CANCEL_BUTTON')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                confirmation.action();
                setConfirmation(prev => ({ ...prev, show: false }));
              }}
              disabled={loading.action}
            >
              {loading.action ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : (
                t('ADMIN.ACTIVE_RAIN.CONFIRM_BUTTON')
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ActiveRainPanel;