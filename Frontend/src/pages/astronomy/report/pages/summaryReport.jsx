import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import { GeminiEndpoint } from '@/services/geminiService.jsx';
import '@/assets/loader.css'



const SummaryReport = ({ data, observatory, orbitalElement, reportGemini, setReportGemini, onGeneratingStart, onGeneratingEnd,   }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para sanitizar y extraer el contenido
  const getSanitizedContent = () => {
    try {
      if (reportGemini === 'azd112') return null;

      if (!reportGemini?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return '';
      }

      let rawHtml = reportGemini.candidates[0].content.parts[0].text;
      rawHtml = rawHtml.replace(/^```html\s*/i, '');
      rawHtml = rawHtml.replace(/\s*```$/i, '');
      return DOMPurify.sanitize(rawHtml);

    } catch (error) {
      console.error('Error processing Gemini response:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (onGeneratingStart) onGeneratingStart();
      try {
        if (!reportGemini) {
          const response = await GeminiEndpoint(data, observatory, orbitalElement);
          console.log('Gemini response:', response);
          setReportGemini(response);
        }
      } catch (e) {
        setError(e.message);
        setReportGemini('azd112');
      } finally {
        setLoading(false);
        if (onGeneratingEnd) onGeneratingEnd();
      }
    };

    if (data) {
      fetchData();
    }
  }, [data, observatory, orbitalElement]);


  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">
          Error: {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </Container>
    );
  }

  const cleanHtml = getSanitizedContent();

  if (!cleanHtml) {
    return (
      <Container className="py-4">
        <div className="alert alert-warning">
          No se pudo generar el contenido del reporte o la respuesta está vacía.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
        style={{
          lineHeight: 1.6,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
        className="gemini-content"
      />
    </Container>
  );
};

export default SummaryReport;