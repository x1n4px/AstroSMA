import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function HorizontalBarChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerHeight])
      .padding(0.1);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([0, innerWidth]);

    // Ajusta el número de ticks aquí
    const xAxis = d3.axisBottom(x).ticks(5); // Muestra 5 ticks en el eje X

    // Ejes
    g.append('g').call(d3.axisLeft(y));
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.label))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.value))
      .attr('fill', '#980100');
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default HorizontalBarChart;