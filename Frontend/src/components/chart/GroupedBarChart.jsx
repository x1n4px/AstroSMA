import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const formatDataForChart = (data) => {
  // Transforma los datos en formato adecuado para las barras agrupadas
  const formattedData = [
    {
      group: "Distancia",
      Distancia_1: parseFloat(data[0].Distancia_1),
      Distancia_2: parseFloat(data[0].Distancia_2),
    },
    {
      group: "Tiempo",
      Distancia_1: parseFloat(data[1].Distancia_1),
      Distancia_2: parseFloat(data[1].Distancia_2),
    },
    {
      group: "Error",
      Distancia_1: parseFloat(data[2].Distancia_1),
      Distancia_2: parseFloat(data[2].Distancia_2),
    },
  ];

  return formattedData;
};


function GroupedBarChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;

    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]).filter(key => key !== 'group');
    const groups = data.map(d => d.group);
    const colors = d3.schemeCategory10; // Use d3's color scheme
    const margin = { top: 20, right: 80, bottom: 30, left: 40 }; // Adjusted right margin for legend
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x0 = d3.scaleBand()
      .domain(groups)
      .range([0, innerWidth])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .selectAll('g')
      .data(data)
      .enter().append('g')
      .attr('transform', d => `translate(${x0(d.group)},0)`)
      .selectAll('rect')
      .data(d => keys.map(key => ({ key, value: d[key] })))
      .enter().append('rect')
      .attr('x', d => x1(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', d => colors[keys.indexOf(d.key)]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));

    g.append('g')
      .call(d3.axisLeft(y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('Value');

    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys.slice().reverse())
      .enter().append('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', innerWidth + margin.left + 20 - margin.left) // Adjust legend position
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', d => colors[keys.indexOf(d)]);

    legend.append('text')
      .attr('x', innerWidth + margin.left - 5 - margin.left) // Adjust legend position
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d);

  }, [data]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default GroupedBarChart;