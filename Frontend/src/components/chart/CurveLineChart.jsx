import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from 'react-bootstrap';
import useResizeObserver from '@react-hook/resize-observer';

const useSize = (target) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (target.current) {
      setSize({
        width: target.current.offsetWidth,
        height: target.current.offsetHeight
      });
    }
  }, [target]);

  useResizeObserver(target, (entry) => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height
    });
  });

  return size;
};

const CurveLineChart = ({ data }) => {
  const containerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();
  const { width: containerWidth, height: containerHeight } = useSize(containerRef);

  useEffect(() => {
    if (!data || data.length === 0 || containerWidth === 0 || containerHeight === 0) return;

    // Limpiar el SVG antes de dibujar
    d3.select(svgRef.current).selectAll('*').remove();
    d3.select(tooltipRef.current).selectAll('*').remove();

    // Procesar los datos
    const processedData = processData(data);
    const years = Array.from(new Set(data.map(d => d.year))).sort();

    // Configuración del SVG
    const svg = d3.select(svgRef.current);
    const margin = { top: 30, right: 60, bottom: 50, left: 60 };
    const width = containerWidth - 20; // Ajuste para padding
    const height = Math.min(containerHeight, 500); // Altura máxima de 500px
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Nombres de los meses
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Escalas
    const xScale = d3
      .scalePoint()
      .domain(monthNames)
      .range([0, innerWidth])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => d3.max(d.values, v => v.num_detections)) * 1.1])
      .range([innerHeight, 0])
      .nice();

    // Ajustar tamaño del SVG
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    // Crear grupo principal
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Eje X
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Mes');

    // Eje Y
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text('Número de Detecciones');

    // Escala de colores para los años
    const colorScale = d3
      .scaleOrdinal()
      .domain(years)
      .range(d3.schemeTableau10);

    // Generador de línea curva
    const lineGenerator = d3
      .line()
      .x(d => xScale(monthNames[d.month - 1]))
      .y(d => yScale(d.num_detections))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Dibujar las líneas para cada año
    processedData.forEach(yearData => {
      const path = g
        .append('path')
        .datum(yearData.values)
        .attr('fill', 'none')
        .attr('stroke', colorScale(yearData.year))
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);

      // Animación de las líneas
      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);
    });

    // Agregar puntos de datos
    processedData.forEach(yearData => {
      g.selectAll(`.dot-${yearData.year}`)
        .data(yearData.values)
        .enter()
        .append('circle')
        .attr('class', `dot-${yearData.year}`)
        .attr('cx', d => xScale(monthNames[d.month - 1]))
        .attr('cy', d => yScale(d.num_detections))
        .attr('r', 4)
        .attr('fill', colorScale(yearData.year))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .on('mouseover', (event, d) => {
          d3.select(tooltipRef.current)
            .style('opacity', 1)
            .html(`
              <div class="p-2">
                <strong>Año:</strong> ${yearData.year}<br/>
                <strong>Mes:</strong> ${monthNames[d.month - 1]} (${d.month})<br/>
                <strong>Detecciones:</strong> ${d.num_detections}<br/>
                <strong>Detecciones mes anterior:</strong> ${d.previous_month_detections}<br/>
                <strong>Cambio porcentual:</strong> ${d.percentage_change}%
              </div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', () => {
          d3.select(tooltipRef.current).style('opacity', 0);
        });
    });

    // Leyenda (solo si hay espacio suficiente)
    if (innerWidth > 300) {
      const legend = g
        .append('g')
        .attr('transform', `translate(${innerWidth - 150}, 0)`);

      years.forEach((year, i) => {
        const legendItem = legend
          .append('g')
          .attr('transform', `translate(0, ${i * 20})`);

        legendItem
          .append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(year));

        legendItem
          .append('text')
          .attr('x', 20)
          .attr('y', 12)
          .text(year)
          .style('font-size', '12px')
          .attr('alignment-baseline', 'middle');
      });
    }

  }, [data, containerWidth, containerHeight]);

  // Función para procesar los datos y agrupar por año
  const processData = (rawData) => {
    const years = Array.from(new Set(rawData.map(d => d.year)));
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return years.map(year => {
      const yearData = rawData.filter(d => d.year === year);
      
      // Asegurarnos de que tenemos todos los meses, incluso si no hay datos
      const completeData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const found = yearData.find(d => d.month === month);
        return found || {
          year: year,
          month: month,
          num_detections: 0,
          previous_month_detections: 0,
          percentage_change: "0.00"
        };
      });

      return {
        year: year,
        values: completeData
      };
    });
  };

  return (
    <Card style={{backgroundColor: 'transparent', border: 'none', width: '100%', height: '100%'}}>
      <Card.Body style={{padding: '10px', width: '100%', height: '100%'}}>
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '400px', // Altura mínima para asegurar visibilidad
            position: 'relative'
          }}
        >
          <svg 
            ref={svgRef} 
            style={{
              width: '100%',
              height: '100%',
              overflow: 'visible'
            }}
          />
          <div
            ref={tooltipRef}
            style={{
              position: 'absolute',
              opacity: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '6px',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'opacity 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontSize: '14px'
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default CurveLineChart;