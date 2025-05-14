import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function PieChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef(); // Ref for the main container div
  const legendRef = useRef(); // Ref for the legend div

  // Use useLayoutEffect if precise timing after DOM updates is critical,
  // but useEffect is often sufficient for this kind of chart.
  useEffect(() => {
    // Ensure data is available
    if (!data || data.length === 0) {
      // Clear SVG and legend if no data
      d3.select(svgRef.current).selectAll('*').remove();
      d3.select(legendRef.current).selectAll('*').remove();
      return;
    }

    const wrapper = d3.select(wrapperRef.current);
    const svg = d3.select(svgRef.current);
    const legend = d3.select(legendRef.current);

    // Clear previous elements
    svg.selectAll('*').remove();
    legend.selectAll('*').remove(); // Clear previous legend elements

    // Get the actual dimensions of the SVG element after CSS has sized it
    const svgDimensions = svgRef.current.getBoundingClientRect();
    const svgWidth = svgDimensions.width;
    const svgHeight = svgDimensions.height;

    // Calculate radius based on the *actual* SVG dimensions,
    // leaving some space for potential labels or padding around the circle.
    // Using a factor like 0.85 ensures the circle doesn't touch the edges.
    const radius = Math.min(svgWidth, svgHeight) / 2 * 0.85;

    // Define the coordinate system and scaling via viewBox
    // The viewBox covers the area from (0,0) to (svgWidth, svgHeight)
    // preserveAspectRatio ensures it scales nicely.
    svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Append group for the pie chart, centered within the SVG's viewBox
    const g = svg
      .append('g')
      .attr('transform', `translate(${svgWidth / 2},${svgHeight / 2})`); // Center based on SVG dimensions

    // Transform data to the format required by d3.pie
    const pieData = data.map((item) => ({
      label: `Num. Estaciones: ${item.ocurrencias}`, // Label for legend
      value: item.cantidad_meteoros, // The value of the slice
      originalOcurrencias: item.ocurrencias // Keep original for scale domain if needed
    }));

    // Define color scale based on the labels
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label)) // Domain is the labels
        .range(d3.schemeCategory10);

    // Define the pie generator
    const pie = d3.pie().value((d) => d.value).sort(null); // sort(null) keeps data order

    // Define the arc generator for the slices, using the calculated radius
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Draw the pie slices
    g.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label)) // Use label for color mapping
      .attr('stroke', 'white') // Optional: add stroke between slices
      .style('stroke-width', '2px')
      .style('opacity', 0.7)
       // Add a title element for a native tooltip on hover
      .append('title')
        .text(d => `${d.data.label}: ${d3.format(".1%")(d.data.value / d3.sum(pieData, item => item.value))}`); // Show percentage and value

    // --- Draw the Legend Below the Chart ---

    // Data for the legend items (same as pieData)
    const legendData = pieData;

    // Create legend items within the legend div
    const legendItem = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('div') // Each legend item is a div
      .attr('class', 'legend-item')
      .style('display', 'flex') // Use flexbox for layout of color box and text
      .style('align-items', 'center')
      .style('margin', '5px 10px'); // Space out legend items

    // Add colored box/square to each legend item
    legendItem.append('div')
      .style('width', '14px') // Size of the color box
      .style('height', '14px')
      .style('background-color', d => color(d.label)) // Use the same color scale
      .style('margin-right', '6px'); // Space between color box and text

    // Add text label to each legend item
    legendItem.append('span')
      .text(d => d.label)
      .style('font-size', '12px'); // Adjust font size as needed


  }, [data]); // Redraw chart if data changes

  // Use flex column on the wrapper to stack the SVG and the legend div.
  // Let the SVG take flexible space (flexGrow: 1) and the legend take its natural space.
  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', boxSizing: 'border-box' }}>
      {/* SVG takes full width and grows vertically in the flex container */}
      {/* minHeight helps ensure it renders with some initial size even if parent height is tricky */}
      <svg ref={svgRef} style={{ width: '100%', flexGrow: 1, minHeight: '200px' }}></svg>
      {/* Legend div takes its natural height and is centered horizontally */}
      <div ref={legendRef} className="legend" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', overflow: 'auto' }}>
        {/* D3 will populate this div with legend items */}
      </div>
    </div>
  );
}

export default PieChart;