import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PieChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef(); // Referencia al contenedor del SVG

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const radius = Math.min(width, height) / 2;

    // Limpia el SVG anterior
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal().domain(data.map((d) => d.composition)).range(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.count);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg
      .select('g')
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.composition));
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default PieChart;