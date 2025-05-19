import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Necesitarás añadir este CSS en tu aplicación o usar un enfoque similar
// para que el resaltado sea visible. Por ejemplo, en tu archivo CSS general:
/*
.bar.highlighted {
  stroke: black; // Puedes ajustar esto
  stroke-width: 2; // Puedes ajustar esto
  opacity: 0.8; // O cambiar el fill, etc.
}
*/

function RainfallBarChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const dimensions = wrapper.node().getBoundingClientRect();
    const width = dimensions.width;
    const height = dimensions.height;
    // Ajustamos el margen superior si el label fijo ocupa espacio
    const margin = { top: 30, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const colors = d3.schemeCategory10;

    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    // Obtener años únicos e identificadores únicos
    const years = [...new Set(data.map(d => d.Lluvia_Año.toString()))];
    const identifiers = [...new Set(data.map(d => d.Lluvia_Identificador))];

    // Crear escalas
    const x0 = d3.scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(identifiers)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Cantidad_Lluvias)])
      .nice()
      .range([innerHeight, 0]);

    // Crear el grupo principal (trasladado para tener en cuenta los márgenes)
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); // Aplica los márgenes aquí

    // Agregar las barras agrupadas
    years.forEach(year => {
      g.selectAll(`.bar-${year}`)
        .data(data.filter(d => d.Lluvia_Año.toString() === year))
        .enter().append('rect')
        .attr('class', d => `bar bar-${d.Lluvia_Identificador}`) // Clase 'bar' general + clase específica
        .attr('x', d => x0(year) + x1(d.Lluvia_Identificador))
        .attr('y', d => y(d.Cantidad_Lluvias))
        .attr('width', x1.bandwidth())
        .attr('height', d => innerHeight - y(d.Cantidad_Lluvias))
        .attr('fill', (d, i) => colors[identifiers.indexOf(d.Lluvia_Identificador) % colors.length]);
    });

    // Agregar el eje X
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));

    // Agregar el eje Y
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('Cantidad de Lluvias');

    // --- Código de leyenda eliminado ---

    // Crear un elemento de texto para mostrar el identificador fijo en la esquina superior derecha
    const hoverLabel = g.append('text')
        .attr('class', 'hover-label') // Clase para identificar el label flotante
        // Posición fija en la esquina superior derecha del área de dibujo (dentro de 'g')
        .attr('x', innerWidth - 10) // 10px de padding desde el borde derecho
        .attr('y', 10) // 10px de padding desde el borde superior
        .attr('text-anchor', 'end') // Alinear el final del texto a la posición 'x' (derecha)
        .attr('alignment-baseline', 'hanging') // Alinear el borde superior del texto a la posición 'y'
        .style('font-weight', 'bold') // Opcional: hacer el texto más visible
        .style('opacity', 0) // Inicialmente oculto
        .style('pointer-events', 'none'); // Asegurarse de que el texto no bloquee eventos del ratón

    // Agregar eventos de mouse a todas las barras
    g.selectAll('.bar') // Seleccionamos todas las barras usando la clase general 'bar'
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    // Función manejadora para mouseover
    function handleMouseOver(event, d) {
        const hoveredIdentifier = d.Lluvia_Identificador;

        // Resaltar todas las barras con este identificador
        svg.selectAll(`.bar-${hoveredIdentifier}`) // Usamos la clase específica para seleccionar
           .classed('highlighted', true); // Añade una clase CSS para estilizar

        // Actualizar y mostrar el label fijo en la esquina superior derecha
        hoverLabel
            .text(`Identificador: ${hoveredIdentifier}`) // Mostrar el identificador con un prefijo
            .style('opacity', 1); // Hacer visible el texto
    }

    // Función manejadora para mouseout
    function handleMouseOut(event, d) {
        // Remover el resaltado de todas las barras
        svg.selectAll('.bar').classed('highlighted', false);

        // Ocultar el label fijo
        hoverLabel.style('opacity', 0);
    }


  }, [data]); // Redibujar si los datos cambian

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
}

export default RainfallBarChart;