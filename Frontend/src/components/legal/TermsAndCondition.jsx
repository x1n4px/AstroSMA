import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from "react-bootstrap";

function TermsAndConditions() {
  const { t } = useTranslation(['text']);

  return (
    <Container className="mt-4">
      <div>
        {t('TERMS_AND_CONDITIONS.SECTION', { returnObjects: true }).map((section, index) => (
          <div key={index} className="mb-3">
            <h5>{section.TITLE}</h5>
            <p>{section.CONTENT}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default TermsAndConditions;