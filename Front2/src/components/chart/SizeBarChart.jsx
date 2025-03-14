import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function SizeBarChart({ data }) {
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

    const x = d3.scaleBand().domain(data.map((d) => d.sizeRange)).range([0, innerWidth]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count)]).range([innerHeight, 0]);

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.sizeRange))
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.count))
      .attr('fill', 'steelblue');
  }, [data]);

  return <svg ref={svgRef}></svg>;
}

export default SizeBarChart;