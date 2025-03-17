import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function LineChart({ data }) {
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

    const x = d3.scaleTime().domain(d3.extent(data, (d) => d.date)).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count)]).range([innerHeight, 0]);

    // Ajusta el número de ticks aquí
    const xAxis = d3.axisBottom(x).ticks(d3.timeMonth.every(3)); // Muestra ticks cada 2 meses

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    g.append('g').call(d3.axisLeft(y));

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.count));

    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#980100').attr('stroke-width', 2).attr('d', line);
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default LineChart;