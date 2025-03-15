import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Card } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  CHART_SETTING: 'chartSetting',
};

const DraggableChartSetting = ({ id, children, moveChartSetting }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHART_SETTING,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CHART_SETTING,
    hover: (item, monitor) => {
      if (item.id === id) {
        return;
      }
      moveChartSetting(item.id, id);
    },
  });

  return (
    <Card ref={(node) => drag(drop(node))} className="mb-2" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
};

function DashboardSettingsModal({ show, onHide, onSave, initialSettings, initialOrder }) {
  const [settings, setSettings] = useState(initialSettings);
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    setSettings(initialSettings);
    setOrder(initialOrder);
  }, [initialSettings, initialOrder]);

  const handleCheckboxChange = (chartId) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [chartId]: !prevSettings[chartId],
    }));
  };

  const moveChartSetting = useCallback((dragIndex, hoverIndex) => {
    setOrder((prevOrder) => {
      const draggedChartId = prevOrder[dragIndex];
      const newOrder = [...prevOrder];
      newOrder.splice(dragIndex, 1);
      newOrder.splice(hoverIndex, 0, draggedChartId);
      return newOrder;
    });
  }, []);

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newOrder = [...order];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setOrder(newOrder);
    }
  };

  const handleMoveDown = (index) => {
    if (index < order.length - 1) {
      const newOrder = [...order];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setOrder(newOrder);
    }
  };

  const handleSave = () => {
    onSave(settings, order);
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
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Configuración del Dashboard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {order.map((chartId, index) => (
          <DraggableChartSetting key={chartId} id={index} moveChartSetting={moveChartSetting}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Check
                type="checkbox"
                label={`Mostrar Gráfica ${dictionary[chartId]}`}
                checked={settings[chartId]}
                onChange={() => handleCheckboxChange(chartId)}
              />
              <div style={{ marginLeft: 'auto' }}>
                <Button variant="outline-primary" size="sm" onClick={() => handleMoveUp(index)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "#0d6ffc"}}><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></svg> Subir
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => handleMoveDown(index)} style={{ marginLeft: '5px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "#0d6ffc"}}><path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"></path></svg> Bajar
                </Button>
              </div>
            </div>
          </DraggableChartSetting>
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