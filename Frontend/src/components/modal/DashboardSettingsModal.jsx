import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Card } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import '@/assets/customCheckbox.css'
// Internationalization
import { useTranslation } from 'react-i18next';
import { isNotQRUser, isAdminUser } from '../../utils/roleMaskUtils';

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

function DashboardSettingsModal({ show, onHide, onSave, initialSettings, initialOrder, searchRange, setsearchRange }) {
  const { t } = useTranslation(['text']);
  const [settings, setSettings] = useState(initialSettings);
  const [order, setOrder] = useState(initialOrder);
  const [selectedSearchRange, setSelectedSearchRange] = useState(searchRange); // Cambiado a searchRange
  const roleMask = (localStorage.getItem('rol'));


  useEffect(() => {
    setSettings(initialSettings);
    setOrder(initialOrder);
    setSelectedSearchRange(searchRange);
  }, [initialSettings, initialOrder, searchRange]);

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
    onSave(settings, order, selectedSearchRange); // Pasa selectedSearchRange
    setsearchRange(selectedSearchRange); // Cambiado a selectedSearchRange
    onHide();
  };

  const dictionary = {
    1: `${t('DASHBOARD.GRAPH.FIRST.TITLE')}`,
    2: `${t('DASHBOARD.GRAPH.SECOND.TITLE')}`,
    3: `${t('DASHBOARD.GRAPH.THIRD.TITLE')}`,
    4: `${t('DASHBOARD.GRAPH.FOURTH.TITLE')}`,
    5: `${t('DASHBOARD.GRAPH.FIFTH.TITLE')}`,
    6: `${t('DASHBOARD.GRAPH.SIXTH.TITLE')}`,
    7: `${t('DASHBOARD.GRAPH.SEVENTH.TITLE')}`,
    8: `${t('DASHBOARD.GRAPH.EIGHTH.TITLE')}`,
    9: `${t('DASHBOARD.GRAPH.NINTH.TITLE')}`,
    10: `${t('DASHBOARD.GRAPH.TENTH.TITLE')}`,
    11: `${t('DASHBOARD.GRAPH.ELEVENTH.TITLE')}`,
    12: `${t('DASHBOARD.GRAPH.TWELFT.TITLE')}`,
    13: `${t('DASHBOARD.GRAPH.THIRTEENTH.TITLE')}`
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{t('DASHBOARD_MODAL.TITLE')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>{t('DASHBOARD_MODAL.SEARCH_RANGE')}</Form.Label>
          <Form.Select value={selectedSearchRange} onChange={(e) => setSelectedSearchRange(e.target.value)}>
            <option value="1">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_10')}</option>
            <option value="2">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_25')}</option>
            <option value="3">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_50')}</option>
            <option value="4">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_6_MONTHS')}</option>
            <option value="5">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_YEAR')}</option>
            <option value="6">{t('DASHBOARD_MODAL.SEARCH_RANGE_OPTION.LAST_5_YEAR')}</option>
          </Form.Select>
        </Form.Group>
     
        {order.map((chartId, index) => (
          <DraggableChartSetting key={chartId} id={index} moveChartSetting={moveChartSetting}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Check
                style={{ accentColor: '#980100' }}
                type="checkbox"
                label={t('DASHBOARD_MODAL.SHOW_GRAPH', { name: dictionary[chartId] })}
                checked={settings[chartId]}
                onChange={() => handleCheckboxChange(chartId)}
              />
              <div style={{ marginLeft: 'auto' }}>
                <Button style={{ backgroundColor: 'transparent', borderColor: '#980100', color: 'black' }} size="sm" onClick={() => handleMoveUp(index)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "#980100" }}><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></svg> Subir
                </Button>
                <Button style={{ backgroundColor: 'transparent', borderColor: '#980100', color: 'black', marginLeft: '5px' }} size="sm" onClick={() => handleMoveDown(index)} >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "#980100" }}><path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"></path></svg> Bajar
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
        <Button style={{ backgroundColor: '#980100', borderColor: '#980100', }} onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DashboardSettingsModal;