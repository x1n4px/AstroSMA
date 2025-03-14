import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ScatterPlot({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.longitude)).range([0, innerWidth]);
    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d.latitude)).range([innerHeight, 0]);

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.longitude))
      .attr('cy', (d) => y(d.latitude))
      .attr('r', 5)
      .attr('fill', 'steelblue');
  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default ScatterPlot;