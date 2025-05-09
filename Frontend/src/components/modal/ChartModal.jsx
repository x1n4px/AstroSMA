import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ChartModal = ({ show, onHide, children }) => {
  return (
    <Modal show={show} onHide={onHide} fullscreen={true}>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChartModal;