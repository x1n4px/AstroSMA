import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function InferredDataReport({ data }) {
  const { t } = useTranslation(['text']);


  console.log(data)

  const dataPairs = [];
  const entries = Object.entries(data);

  for (let i = 0; i < entries.length; i += 2) {
    dataPairs.push(entries.slice(i, i + 2));
  }

  return (
    <div>
      <Col>
        {dataPairs.map((pair, rowIndex) => (
          <Row key={rowIndex} className="mb-3 align-items-center">
            {pair.map(([key, value], index) => (
              <Col key={key} xs={12} md={6}>
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    <Form.Label>{t(`INFERRED_DATA.${key}.label`)}</Form.Label>
                  </Col>
                  <Col xs={12} md={6}>


                    <Form.Group className="d-flex align-items-center ">
                      <Form.Control
                        type="text"
                        value={`${value}`}
                        readOnly
                        className="form-control flex-grow-1"
                      />
                      {t(`INFERRED_DATA.${key}.measure`) &&
                        <div class="input-group-append">
                          <span class="input-group-text" id="basic-addon2">{t(`INFERRED_DATA.${key}.measure`)}</span>
                        </div>
                      }

                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            ))}
            {pair.length === 1 && <Col xs={12} md={6}></Col>}
          </Row>
        ))
        }
      </Col >
    </div >
  );
}

export default InferredDataReport;