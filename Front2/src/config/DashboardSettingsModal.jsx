import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card } from 'react-bootstrap';

function DashboardSettingsModal({ show, onHide, onSave, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleCheckboxChange = (chartId) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [chartId]: !prevSettings[chartId],
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onHide();
  };

  const dictionary = {
    1: 'Bar chart',
    2: 'Line chart',
    3: 'Pie chart',
    4: 'Size bar chart',
    5: 'Scatter plot',
    6: 'List',
    7: 'List'
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Configuración del Dashboard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.keys(settings).map((chartId) => (
          <Card key={chartId} className="mb-2">
            <Card.Body>
              <Form.Check
                type="checkbox"
                label={`Mostrar Gráfica ${dictionary[chartId]}`}
                checked={settings[chartId]}
                onChange={() => handleCheckboxChange(chartId)}
              />
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DashboardSettingsModal;