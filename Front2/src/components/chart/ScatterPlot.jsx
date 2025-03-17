import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ScatterPlot({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
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

    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.longitude)).range([0, innerWidth]);
    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d.latitude)).range([innerHeight, 0]);

    // Ajusta el número de ticks aquí
    const xAxis = d3.axisBottom(x)
    .ticks(5)
    .tickFormat(d3.format('.1f')); // Muestra 5 ticks en el eje X

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    g.append('g').call(d3.axisLeft(y));

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.longitude))
      .attr('cy', (d) => y(d.latitude))
      .attr('r', 5)
      .attr('fill', '#980100');
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default ScatterPlot;