import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function ScatterPlot({ data, xVariable, yVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const drawChart = () => {
      // Validación de datos
      if (!data || data.length === 0 || !xVariable || !yVariable ||
          !data.some(d => d[xVariable] !== undefined) ||
          !data.some(d => d[yVariable] !== undefined) ||
          !data.some(d => d["Cantidad_Lluvias"] !== undefined) ||
          !data.some(d => d["Mes"] !== undefined)) {
        console.warn('Datos incompletos');
        return;
      }

      // Filtrar y preparar datos
      const filteredData = data.filter(d =>
        !isNaN(+d[xVariable]) &&
        d[yVariable] !== undefined &&
        !isNaN(+d["Cantidad_Lluvias"]) &&
        !isNaN(+d["Mes"]) &&
        +d["Mes"] >= 1 && +d["Mes"] <= 12
      ).map(d => ({
        ...d,
        fecha: new Date(+d[xVariable], +d["Mes"] - 1, 1), // Crear fecha para posición precisa
        cantidad: +d["Cantidad_Lluvias"]
      }));

      if (filteredData.length === 0) {
        console.warn('No hay datos válidos');
        return;
      }

      const svg = d3.select(svgRef.current);
      const wrapper = d3.select(wrapperRef.current);
      const dimensions = wrapper.node().getBoundingClientRect();

      if (dimensions.width === 0 || dimensions.height === 0) return;

      const width = dimensions.width;
      const height = dimensions.height;
      const margin = { top: 20, right: 100, bottom: 50, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Escala de tiempo para el eje X (año + mes)
      const x = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.fecha))
        .range([0, innerWidth])
        .nice(d3.timeYear);

      // Escala para el eje Y (identificadores)
      const yCategories = [...new Set(filteredData.map(d => d[yVariable]))].sort();
      const y = d3.scalePoint()
        .domain(yCategories)
        .range([0, innerHeight])
        .padding(0.5);

      // Escala para tamaño de puntos (ajustada para valores mayores)
      const maxLluvias = d3.max(filteredData, d => d.cantidad);
      const sizeScale = d3.scaleSqrt() // Usamos escala sqrt para mejor percepción visual
        .domain([0, maxLluvias])
        .range([3, 25]);

      // Escala de colores con 12 tonos (uno por mes)
      const colorScale = d3.scaleOrdinal()
        .domain([...Array(12).keys()].map(d => d + 1)) // Meses 1-12
        .range(d3.schemeTableau10); // Paleta de colores

      // Eje X
      const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      xAxis.select(".domain").remove();
      xAxis.selectAll(".tick line").clone()
        .attr("y2", -innerHeight)
        .attr("stroke-opacity", 0.1);
      xAxis.append("text")
        .attr("x", innerWidth)
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Fecha (Año-Mes)");

      // Eje Y
      g.append('g')
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", innerWidth)
          .attr("stroke-opacity", 0.1));

      // Puntos con posición precisa por mes
      g.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.fecha))
        .attr('cy', d => y(d[yVariable]))
        .attr('r', d => sizeScale(d.cantidad))
        .attr('fill', d => colorScale(d.Mes))
        .attr('opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .append('title') // Tooltip
        .text(d => `${d[yVariable]} - ${d[xVariable]}/${d.Mes}: ${d.cantidad} lluvias`);

      // Leyenda de tamaño
      const legendSize = g.append('g')
        .attr('transform', `translate(${innerWidth + 20}, 20)`);

      const sizeValues = [0, Math.round(maxLluvias / 2), maxLluvias];

      sizeValues.forEach((value, i) => {
        legendSize.append('circle')
          .attr('cx', 0)
          .attr('cy', i * 30)
          .attr('r', sizeScale(value))
          .attr('fill', 'none')
          .attr('stroke', '#333');

        legendSize.append('text')
          .attr('x', sizeScale(maxLluvias) + 10)
          .attr('y', i * 30)
          .attr('dy', '0.35em')
          .text(value)
          .style('font-size', '12px');
      });

      legendSize.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .text('Cantidad')
        .style('font-size', '12px')
        .style('font-weight', 'bold');

      // Leyenda de colores (meses)
      const legendColor = g.append('g')
        .attr('transform', `translate(${innerWidth + 20}, 120)`);

      legendColor.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .text('Mes')
        .style('font-size', '12px')
        .style('font-weight', 'bold');

      const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

      meses.forEach((mes, i) => {
        legendColor.append('rect')
          .attr('x', 0)
          .attr('y', i * 20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(i + 1));

        legendColor.append('text')
          .attr('x', 20)
          .attr('y', i * 20 + 12)
          .text(mes)
          .style('font-size', '11px');
      });
    };

    drawChart();

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(wrapperRef.current);

    return () => resizeObserver.disconnect();
  }, [data, xVariable, yVariable]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', border: '1px solid #ddd' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default ScatterPlot;