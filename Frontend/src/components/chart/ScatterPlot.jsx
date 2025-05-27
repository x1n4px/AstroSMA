import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// Componente Skeleton simple
function SkeletonLoader({ width, height }) {
  const style = {
    width: typeof width === 'number' && width > 0 ? `${width}px` : '100%',
    height: typeof height === 'number' && height > 0 ? `${height}px` : '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };
  return (
    <div style={style}>
      <p style={{ color: '#aaa', fontSize: '16px', padding: '10px' }}>
        Cargando datos o espacio insuficiente...
      </p>
    </div>
  );
}

function ScatterPlot({ data, xVariable, yVariable }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [currentShowSkeleton, setCurrentShowSkeleton] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasWarnedNoData, setHasWarnedNoData] = useState(false);
  const [hasWarnedInvalidFields, setHasWarnedInvalidFields] = useState(false);
  const [hasWarnedNoValidDataFiltered, setHasWarnedNoValidDataFiltered] = useState(false);
  const [hasWarnedInsufficientDimensions, setHasWarnedInsufficientDimensions] = useState(false);


  // Efecto para manejar las dimensiones con ResizeObserver
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions(prevDims => {
          const newWidth = Math.max(0, width);
          const newHeight = Math.max(0, height);
          if (prevDims.width !== newWidth || prevDims.height !== newHeight) {
            // Resetear warnings de dimensiones si estas cambian significativamente
            if (newWidth > 0 && newHeight > 0) setHasWarnedInsufficientDimensions(false);
            return { width: newWidth, height: newHeight };
          }
          return prevDims;
        });
      }
    });

    observer.observe(wrapper);

    const initialRect = wrapper.getBoundingClientRect();
    setDimensions(prevDims => {
        const newWidth = Math.max(0, initialRect.width);
        const newHeight = Math.max(0, initialRect.height);
        if (prevDims.width !== newWidth || prevDims.height !== newHeight) {
            return { width: newWidth, height: newHeight };
        }
        return prevDims;
    });


    return () => {
      if (wrapper) {
        observer.unobserve(wrapper);
      }
      observer.disconnect();
    };
  }, []);

  // Efecto principal para la lógica de datos y dibujado del gráfico
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    let calculatedShouldShowSkeleton = true;
    let preparedData = null;

    const initialCheckPassed = dimensions.width > 0 && dimensions.height > 0;

    if (!data || !xVariable || !yVariable) { // Props esenciales
      if (initialCheckPassed && !hasWarnedNoData) {
        console.warn('ScatterPlot: Props `data`, `xVariable` o `yVariable` ausentes.');
        setHasWarnedNoData(true);
      }
    } else if (data.length === 0) {
      if (initialCheckPassed && !hasWarnedNoData) {
        // Solo advertir si ya tenemos dimensiones, indicando que el contenedor está listo
        // pero no hay datos. Si las dimensiones aún son 0, es muy temprano para advertir.
        console.warn('ScatterPlot: El array `data` está vacío.');
        setHasWarnedNoData(true); // Marcar que se ha advertido para no repetir
      }
    } else {
      setHasWarnedNoData(false); // Resetear si los datos llegan
      const hasRequiredFields = data.every(d =>
        d[xVariable] !== undefined &&
        d[yVariable] !== undefined &&
        d["Cantidad_Lluvias"] !== undefined &&
        d["Mes"] !== undefined
      );

      if (!hasRequiredFields) {
        if (initialCheckPassed && !hasWarnedInvalidFields) {
          console.warn('ScatterPlot: Faltan campos necesarios (definidos por xVariable, yVariable, "Cantidad_Lluvias", "Mes") en algunos elementos de datos.');
          setHasWarnedInvalidFields(true);
        }
      } else {
        setHasWarnedInvalidFields(false);
        preparedData = data.filter(d =>
          d[xVariable] !== null && !isNaN(Number(d[xVariable])) &&
          d[yVariable] !== null && d[yVariable] !== undefined && // yVariable puede no ser numérico
          d["Cantidad_Lluvias"] !== null && !isNaN(Number(d["Cantidad_Lluvias"])) &&
          d["Mes"] !== null && !isNaN(Number(d["Mes"])) &&
          Number(d["Mes"]) >= 1 && Number(d["Mes"]) <= 12
        ).map(d => ({
          ...d,
          fecha: new Date(Number(d[xVariable]), Number(d["Mes"]) - 1, 1),
          cantidad: Number(d["Cantidad_Lluvias"]),
          mesNumero: Number(d["Mes"])
        }));

        if (preparedData.length === 0) {
          if (initialCheckPassed && !hasWarnedNoValidDataFiltered) {
            console.warn('ScatterPlot: No hay datos válidos para mostrar después del filtrado.');
            setHasWarnedNoValidDataFiltered(true);
          }
          preparedData = null;
        } else {
          setHasWarnedNoValidDataFiltered(false);
          // Datos válidos y filtrados, ahora verificar dimensiones
          const margin = { top: 20, right: 120, bottom: 60, left: 70 };
          const innerWidth = dimensions.width - margin.left - margin.right;
          const innerHeight = dimensions.height - margin.top - margin.bottom;

          if (dimensions.width === 0 || dimensions.height === 0) {
            // No advertir aquí, es una fase de carga normal. El esqueleto se mostrará.
            preparedData = null;
          } else if (innerWidth <= 0 || innerHeight <= 0) {
            if(!hasWarnedInsufficientDimensions){
                 console.warn("ScatterPlot: Dimensiones del contenedor insuficientes para dibujar el gráfico.");
                 setHasWarnedInsufficientDimensions(true);
            }
            preparedData = null;
          } else {
            setHasWarnedInsufficientDimensions(false);
            calculatedShouldShowSkeleton = false; // Todo bien, no mostrar esqueleto
          }
        }
      }
    }

    if (currentShowSkeleton !== calculatedShouldShowSkeleton) {
      setCurrentShowSkeleton(calculatedShouldShowSkeleton);
    }

    if (calculatedShouldShowSkeleton) {
      svg.selectAll('*').remove();
      return;
    }

    if (!preparedData) {
      svg.selectAll('*').remove();
      if (!currentShowSkeleton) setCurrentShowSkeleton(true);
      return;
    }

    // --- Lógica de Dibujado con D3 ---
    svg.selectAll('*').remove();
    const margin = { top: 20, right: 120, bottom: 60, left: 70 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    svg.attr('width', dimensions.width).attr('height', dimensions.height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(preparedData, d => d.fecha))
      .range([0, innerWidth])
      .nice(d3.timeYear);

    const yCategories = [...new Set(preparedData.map(d => String(d[yVariable])) )].sort((a, b) => a.localeCompare(b)); // Asegurar strings para yVariable y ordenar
    const y = d3.scalePoint()
      .domain(yCategories)
      .range([0, innerHeight])
      .padding(0.5);

    const maxLluvias = d3.max(preparedData, d => d.cantidad);
    const sizeScale = d3.scaleSqrt()
      .domain([0, maxLluvias > 0 ? maxLluvias : 1])
      .range([3, 25]);

    const colorScale = d3.scaleOrdinal()
      .domain([...Array(12).keys()].map(m => m + 1))
      .range(d3.schemeTableau10);

    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y-%m")));
    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll(".tick line").clone().attr("y2", -innerHeight).attr("stroke-opacity", 0.1);
    xAxisGroup.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", margin.bottom - 10)
      .attr("fill", "currentColor").attr("text-anchor", "middle").text("Fecha (Año-Mes)");

    const yAxisGroup = g.append('g').call(d3.axisLeft(y));
    yAxisGroup.select(".domain").remove();
    yAxisGroup.selectAll(".tick line").clone().attr("x2", innerWidth).attr("stroke-opacity", 0.1);
    yAxisGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 20)
      .attr("fill", "currentColor").attr("text-anchor", "middle").text(String(yVariable));

    g.selectAll('circle.data-point')
      .data(preparedData)
      .enter().append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => x(d.fecha))
      .attr('cy', d => y(String(d[yVariable]))) // Asegurar string para el accesor de Y
      .attr('r', d => sizeScale(d.cantidad))
      .attr('fill', d => colorScale(d.mesNumero))
      .attr('opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .append('title')
      .text(d => `${d[yVariable]} - ${d[xVariable]}/${d.mesNumero}: ${d.cantidad} lluvias`);

    let sizeLegendBottomY = 20;
    if (maxLluvias > 0) {
      const legendSize = g.append('g').attr('transform', `translate(${innerWidth + 30}, 20)`);
      const sizeValues = [...new Set([0, Math.round(maxLluvias / 2), maxLluvias])].sort((a,b) => a-b);
      const itemHeight = 30;
      const titleHeight = 20; // Espacio para el título y un poco de padding superior
      const circleCenterX = sizeScale(maxLluvias) > 0 ? sizeScale(maxLluvias) : 10; // Centro X para los círculos de la leyenda
      const textOffsetX = (sizeScale(maxLluvias) > 0 ? sizeScale(maxLluvias) * 2 : 20) + 10; // X para el texto, a la derecha del círculo más grande

      legendSize.append('text')
        .attr('x', circleCenterX) // Centrar título con los círculos
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .text('Cantidad Lluvias')
        .style('font-size', '12px')
        .style('font-weight', 'bold');

      sizeValues.forEach((value, i) => {
        const circleY = titleHeight + (i * itemHeight) + sizeScale(value); // Y para el centro del círculo
        legendSize.append('circle')
          .attr('cx', circleCenterX)
          .attr('cy', circleY)
          .attr('r', sizeScale(value))
          .attr('fill', 'none')
          .attr('stroke', '#333');

        legendSize.append('text')
          .attr('x', textOffsetX)
          .attr('y', circleY)
          .attr('dy', '0.35em') // Alineación vertical del texto
          .text(value)
          .style('font-size', '11px');
      });
      // Calcular el final de la leyenda de tamaño
      const lastCircleY = titleHeight + ((sizeValues.length -1) * itemHeight) + sizeScale(sizeValues[sizeValues.length -1] || 0);
      sizeLegendBottomY = 20 + lastCircleY + sizeScale(sizeValues[sizeValues.length-1] || 0) + 10; // (group offset) + (last circle center Y) + (last circle radius) + padding
    }

    const colorLegendYOffset = sizeLegendBottomY + (maxLluvias > 0 ? 20 : 0); // Espacio entre leyendas
    const legendColor = g.append('g').attr('transform', `translate(${innerWidth + 30}, ${colorLegendYOffset})`);
    legendColor.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .text('Mes')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    mesesNombres.forEach((mes, i) => {
      legendColor.append('rect')
        .attr('x', 0)
        .attr('y', i * 20 + 10)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(i + 1));
      legendColor.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 10 + 12)
        .text(mes)
        .style('font-size', '11px');
    });

  }, [data, xVariable, yVariable, dimensions, currentShowSkeleton]);
  // No incluimos los hasWarned* en las dependencias para no causar ciclos por ellos.
  // Se resetean cuando la condición que los causó se resuelve.

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%',  position: 'relative' }}> {/* Usar 100% height para que tome la del padre */}
      {currentShowSkeleton ? (
        <SkeletonLoader width={dimensions.width} height={dimensions.height} />
      ) : (
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      )}
    </div>
  );
}

export default ScatterPlot;