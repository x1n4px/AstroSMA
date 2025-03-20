import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function BubbleMapChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;

    svg.selectAll('*').remove();

    d3.json("europe.json").then((geoData) => {
      const projection = d3.geoMercator().fitSize([width, height], geoData);
      const path = d3.geoPath().projection(projection);

      svg
        .append('g')
        .selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#ccc');

      svg
        .append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => projection([d.longitude, d.latitude])[0])
        .attr('cy', (d) => projection([d.longitude, d.latitude])[1])
        .attr('r', (d) => Math.sqrt(d.value) * 5)
        .attr('fill', '#980100')
        .attr('opacity', 0.7);
    });
  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default BubbleMapChart;