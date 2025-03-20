import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ScatterPlot({ data, xVariable, yVariable }) {
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

    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d[xVariable])).range([0, innerWidth]);
    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d[yVariable])).range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f'));
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'));

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    g.append('g').call(yAxis);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d[xVariable]))
      .attr('cy', (d) => y(d[yVariable]))
      .attr('r', 5)
      .attr('fill', '#980100');
  }, [data, xVariable, yVariable]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default ScatterPlot;