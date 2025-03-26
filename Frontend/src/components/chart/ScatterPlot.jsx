import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ScatterPlot({ data, xVariable, yVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const drawChart = () => {
      // Validación más robusta
      if (!data || data.length === 0 || !xVariable || !yVariable || 
          !data.some(d => d[xVariable] !== undefined) || 
          !data.some(d => d[yVariable] !== undefined)) {
        return;
      }

      // Filtrar datos no válidos
      const filteredData = data.filter(d => 
        !isNaN(+d[xVariable]) && !isNaN(+d[yVariable])
      );

      if (filteredData.length === 0) return;

      const svg = d3.select(svgRef.current);
      const wrapper = d3.select(wrapperRef.current);
      const dimensions = wrapper.node().getBoundingClientRect();
      
      if (dimensions.width === 0 || dimensions.height === 0) return;

      const width = dimensions.width;
      const height = dimensions.height;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height);
      
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Escalas con valores forzados a número
      const x = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d[xVariable]))
        .range([0, innerWidth])
        .nice();

      const y = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d[yVariable]))
        .range([innerHeight, 0])
        .nice();

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      g.append('g')
        .call(d3.axisLeft(y));

      g.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(+d[xVariable]))
        .attr('cy', d => y(+d[yVariable]))
        .attr('r', 5)
        .attr('fill', '#980100');
    };

    drawChart();

    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, xVariable, yVariable]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%'}}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default ScatterPlot;