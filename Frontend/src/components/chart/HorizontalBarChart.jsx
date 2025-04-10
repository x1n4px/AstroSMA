import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function RainfallBarChart({ data, showModal }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const colors = d3.schemeCategory10;

    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    // Obtener años únicos e identificadores únicos
    const years = [...new Set(data.map(d => d.Lluvia_Año.toString()))];
    const identifiers = [...new Set(data.map(d => d.Lluvia_Identificador))];

    // Crear escalas
    const x0 = d3.scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(identifiers)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Cantidad_Lluvias)])
      .nice()
      .range([innerHeight, 0]);

    // Crear el grupo principal
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Agregar las barras agrupadas
    years.forEach(year => {
      g.selectAll(`.bar-${year}`)
        .data(data.filter(d => d.Lluvia_Año.toString() === year))
        .enter().append('rect')
        .attr('class', d => `bar bar-${d.Lluvia_Identificador}`)
        .attr('x', d => x0(year) + x1(d.Lluvia_Identificador))
        .attr('y', d => y(d.Cantidad_Lluvias))
        .attr('width', x1.bandwidth())
        .attr('height', d => innerHeight - y(d.Cantidad_Lluvias))
        .attr('fill', (d, i) => colors[identifiers.indexOf(d.Lluvia_Identificador) % colors.length])
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
          // Resaltar la barra
          d3.select(this).attr('opacity', 1).attr('stroke', 'black').attr('stroke-width', 2);
          
          // Resaltar el identificador correspondiente en la leyenda
          legendItems.filter(item => item === d.Lluvia_Identificador)
            .select('text')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold');
            
          legendItems.filter(item => item === d.Lluvia_Identificador)
            .select('rect')
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
        })
        .on('mouseout', function(event, d) {
          // Restaurar la barra
          d3.select(this).attr('opacity', 0.8).attr('stroke', null);
          
          // Restaurar el identificador en la leyenda
          legendItems.select('text')
            .attr('font-size', '10px')
            .attr('font-weight', null);
            
          legendItems.select('rect')
            .attr('stroke', null);
        });
    });

    // Agregar el eje X
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));

    // Agregar el eje Y
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('Cantidad de Lluvias');

    // Agregar leyenda para los identificadores
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .attr('transform', `translate(${innerWidth - 100}, 20)`); // Mover la leyenda a la derecha

    const legendItems = legend.selectAll('g')
      .data(identifiers)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legendItems.append('rect')
      .attr('x', 0)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', (d, i) => colors[i % colors.length])
      .attr('opacity', 0.8);

    legendItems.append('text')
      .attr('x', -5)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event, identifier) {
        // Resaltar todas las barras con este identificador
        d3.selectAll(`.bar-${identifier}`)
          .attr('opacity', 1)
          .attr('stroke', 'black')
          .attr('stroke-width', 2);
          
        // Resaltar el identificador en la leyenda
        d3.select(this)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold');
          
        legendItems.filter(item => item === identifier)
          .select('rect')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);
      })
      .on('mouseout', function(event, identifier) {
        // Restaurar todas las barras
        d3.selectAll(`.bar-${identifier}`)
          .attr('opacity', 0.8)
          .attr('stroke', null);
          
        // Restaurar el identificador en la leyenda
        d3.select(this)
          .attr('font-size', '10px')
          .attr('font-weight', null);
          
        legendItems.select('rect')
          .attr('stroke', null);
      });

  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default RainfallBarChart;