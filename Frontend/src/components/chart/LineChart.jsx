import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function LineChart({ data, xVariable, yVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();


  

  useEffect(() => {
    if (!data || data.length === 0 || !xVariable || !yVariable) {
      return; // No renderizar si faltan datos o variables
    }

    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Comprobamos si los datos del eje X son fechas
    const isTimeVariable = data.some(d => d[xVariable] instanceof Date);

    // Si los datos del eje X son fechas, usamos scaleTime, sino scaleLinear
    const x = isTimeVariable
      ? d3.scaleTime().domain(d3.extent(data, (d) => d[xVariable])).range([0, innerWidth])
      : d3.scaleLinear().domain(d3.extent(data, (d) => d[xVariable])).range([0, innerWidth]);

    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d[yVariable])).range([innerHeight, 0]);

    // Usamos d3.timeMonth.every(3) para ticks del eje X si son fechas
    const xAxis = isTimeVariable
      ? d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%Y-%m'))
      : d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f'));

    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'));

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    g.append('g').call(yAxis);

    const line = d3
      .line()
      .x((d) => x(d[xVariable]))
      .y((d) => y(d[yVariable]));

    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#980100').attr('stroke-width', 2).attr('d', line);
  }, [data, xVariable, yVariable]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default LineChart;