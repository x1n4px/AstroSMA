import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PieChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    const radius = Math.min(width, height) / 2;

    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pieData = Object.entries(data).map(([composition, count]) => ({
      composition,
      count,
    }));

    const color = d3.scaleOrdinal().domain(pieData.map((d) => d.composition)).range(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.count);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const g = svg.select('g');

    g.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.composition))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.7);
        g.append('text')
          .attr('class', 'tooltip')
          .attr('x', 0)
          .attr('y', 0)
          .text(`${d.data.composition}: ${d.data.count}`);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('opacity', 1);
        g.select('.tooltip').remove();
      });

    // Porcentajes y nombres en cada trozo
    g.selectAll('text.percent')
      .data(pie(pieData))
      .enter()
      .append('text')
      .attr('class', 'percent')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .text((d) => `${((d.data.count / d3.sum(pieData, (d) => d.count)) * 100).toFixed(1)}% ${d.data.composition}`)
      .style('font-size', '12px'); // Ajusta el tamaño de la fuente si es necesario

  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default PieChart;