import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function RoseChart({ data, angleVariable, valueVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !angleVariable || !valueVariable) {
      return;
    }

    const filteredData = data.filter((d) => d[angleVariable] !== null);

    if (filteredData.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    // Configurar escalas
    const angle = d3
      .scaleLinear()
      .domain([0, 360])
      .range([0, 2 * Math.PI]);

    const length = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d[valueVariable])])
      .range([0, radius]);

    // Calcular el ancho de cada barra
    const barWidth = (2 * Math.PI) / filteredData.length;

    // Dibujar las barras radiales
    g.selectAll('path')
      .data(filteredData)
      .enter()
      .append('path')
      .attr('fill', '#980100')
      .attr('d', d => {
        const startAngle = angle(d[angleVariable]) - barWidth / 2;
        const endAngle = angle(d[angleVariable]) + barWidth / 2;
        const outerRadius = length(d[valueVariable]);
        
        return d3.arc()({
          innerRadius: 0,
          outerRadius: outerRadius,
          startAngle: startAngle,
          endAngle: endAngle
        });
      });

    // Ejes radiales (círculos concéntricos)
    const yAxis = g
      .selectAll('.y-axis')
      .data(length.ticks(5))
      .join('g')
      .attr('class', 'y-axis');

    yAxis
      .append('circle')
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('r', length);

    yAxis
      .append('text')
      .attr('y', (d) => -length(d))
      .attr('dy', '0.35em')
      .attr('fill', 'gray')
      .text((d) => d);

    // Ejes angulares (líneas radiales)
    g.selectAll('.angle-axis')
      .data([0, 90, 180, 270]) // Mostrar ejes principales
      .join('line')
      .attr('class', 'angle-axis')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => radius * Math.cos(angle(d) - Math.PI / 2))
      .attr('y2', (d) => radius * Math.sin(angle(d) - Math.PI / 2))
      .attr('stroke', 'gray')
      .attr('stroke-dasharray', '2,2');
  }, [data, angleVariable, valueVariable]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default RoseChart;