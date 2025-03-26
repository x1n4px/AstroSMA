import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BarChartWithError = ({ data }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;

    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (data && data.length > 0) {
      const labelKey = Object.keys(data[0])[0]; // Obtener el primer nombre de propiedad (ID del observatorio)
      const valueKey = Object.keys(data[0])[1]; // Obtener el segundo nombre de propiedad (distancia)
      const errorKey = Object.keys(data[0])[2]; // Obtener el tercer nombre de propiedad (error)

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d[labelKey]))
        .range([0, innerWidth])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => parseFloat(d[valueKey]) + parseFloat(d[errorKey]))])
        .nice()
        .range([innerHeight, 0]);

      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d[labelKey]))
        .attr('y', (d) => y(parseFloat(d[valueKey])))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(parseFloat(d[valueKey])))
        .attr('fill', '#980100');

      // Líneas de error
      g.selectAll('.error-line')
        .data(data)
        .enter().append('line')
        .attr('class', 'error-line')
        .attr('x1', d => x(d[labelKey]) + x.bandwidth() / 2)
        .attr('x2', d => x(d[labelKey]) + x.bandwidth() / 2)
        .attr('y1', d => y(parseFloat(d[valueKey]) - parseFloat(d[errorKey])))
        .attr('y2', d => y(parseFloat(d[valueKey]) + parseFloat(d[errorKey])))
        .attr('stroke', 'blue');

      // Top error caps
      g.selectAll('.error-cap-top')
        .data(data)
        .enter().append('line')
        .attr('class', 'error-cap-top')
        .attr('x1', d => x(d[labelKey]) + x.bandwidth() / 2 - 5)
        .attr('x2', d => x(d[labelKey]) + x.bandwidth() / 2 + 5)
        .attr('y1', d => y(parseFloat(d[valueKey]) - parseFloat(d[errorKey])))
        .attr('y2', d => y(parseFloat(d[valueKey]) - parseFloat(d[errorKey])))
        .attr('stroke', 'blue');

      // Bottom error caps
      g.selectAll('.error-cap-bottom')
        .data(data)
        .enter().append('line')
        .attr('class', 'error-cap-bottom')
        .attr('x1', d => x(d[labelKey]) + x.bandwidth() / 2 - 5)
        .attr('x2', d => x(d[labelKey]) + x.bandwidth() / 2 + 5)
        .attr('y1', d => y(parseFloat(d[valueKey]) + parseFloat(d[errorKey])))
        .attr('y2', d => y(parseFloat(d[valueKey]) + parseFloat(d[errorKey])))
        .attr('stroke', 'blue');
    }
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default BarChartWithError;