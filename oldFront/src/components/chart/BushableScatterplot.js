import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const BrushableScatterplot = ({ data, width = 600, height = 400 }) => {
  const svgRef = useRef(null);
  const [selectedPoints, setSelectedPoints] = useState(data);

  

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    svg.selectAll('*').remove(); // Limpiar el SVG

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y));

    const dots = g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 5)
      .attr('fill', 'steelblue');

    const brush = d3.brush()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('end', brushed);

    g.append('g')
      .attr('class', 'brush')
      .call(brush);

    function brushed({ selection }) {
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        const selected = data.filter(
          d => x0 <= x(d.x) && x(d.x) <= x1 && y0 <= y(d.y) && y(d.y) <= y1
        );
        setSelectedPoints(selected);
        dots.attr('fill', d => selected.includes(d) ? 'red' : 'steelblue');
      } else {
        setSelectedPoints(data);
        dots.attr('fill', 'steelblue');
      }
    }
  }, [data, width, height]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {/* <div>
        <h3>Puntos seleccionados:</h3>
        <pre>{JSON.stringify(selectedPoints, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default BrushableScatterplot;