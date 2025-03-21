import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function BarChart({ data }) {
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
      const labelKey = Object.keys(data[0])[0]; // Obtener el primer nombre de propiedad
      const valueKey = Object.keys(data[0])[1]; // Obtener el segundo nombre de propiedad

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d[labelKey]))
        .range([0, innerWidth])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[valueKey])])
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
        .attr('y', (d) => y(d[valueKey]))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerHeight - y(d[valueKey]))
        .attr('fill', '#980100');
    }
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default BarChart;