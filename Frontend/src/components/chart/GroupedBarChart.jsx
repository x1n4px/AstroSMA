import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function RainfallBarChart({ data }) {
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
        .attr('fill', (d, i) => colors[identifiers.indexOf(d.Lluvia_Identificador) % colors.length]);
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
      .selectAll('g')
      .data(identifiers)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', innerWidth - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', (d, i) => colors[i % colors.length]);

    legend.append('text')
      .attr('x', innerWidth - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d);

  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default RainfallBarChart;