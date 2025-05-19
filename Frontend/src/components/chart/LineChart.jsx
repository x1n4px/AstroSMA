import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

function LineChart({ data, xVariable, yVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!wrapperRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !xVariable || !yVariable || dimensions.width === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 50, left: 40 }; // Aumentamos el margen inferior
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const isTimeVariable = data.some(d => d[xVariable] instanceof Date);

    const x = isTimeVariable
      ? d3.scaleTime().domain(d3.extent(data, (d) => d[xVariable])).range([0, innerWidth])
      : d3.scaleLinear().domain(d3.extent(data, (d) => d[xVariable])).range([0, innerWidth]);

    const y = d3.scaleLinear().domain(d3.extent(data, (d) => d[yVariable])).range([innerHeight, 0]);

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        isTimeVariable
          ? d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%Y-%m'))
          : d3.axisBottom(x).ticks(Math.max(2, Math.floor(innerWidth / 80))).tickFormat(d3.format('.1f')) // Ajuste dinámico de ticks
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f')));

    const line = d3
      .line()
      .x((d) => x(d[xVariable]))
      .y((d) => y(d[yVariable]));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#980100')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .attr("stroke-opacity", 0.2);

  }, [data, xVariable, yVariable, dimensions]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      ></svg>
    </div>
  );
}

export default LineChart;