import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface NetworkGraphProps {
  devices: any[];
  connections: any[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ devices, connections }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !devices || !connections) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // تبدیل داده‌ها به فرمت مناسب برای d3
    const nodes = devices.map(device => ({
      id: device.id,
      name: device.model || 'دستگاه',
      isSuspicious: device.suspiciousScore > 50,
      suspiciousScore: device.suspiciousScore
    }));
    
    // اضافه کردن نودهای مقصد که در دستگاه‌ها نیستند
    const uniqueTargets = [...new Set(connections.map(c => c.target))];
    uniqueTargets.forEach(target => {
      if (!nodes.find(n => n.id === target)) {
        nodes.push({
          id: target,
          name: target,
          isExternal: true,
          isSuspicious: connections.some(c => c.target === target && c.isSuspicious)
        });
      }
    });
    
    const links = connections.map(conn => ({
      source: conn.source,
      target: conn.target,
      isSuspicious: conn.isSuspicious,
      value: conn.bandwidth
    }));
    
    // ایجاد شبیه‌سازی نیرو
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));
    
    // رسم خطوط ارتباطی
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", (d: any) => d.isSuspicious ? "#cf6679" : "#64748b")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) / 10 + 1)
      .attr("stroke-dasharray", (d: any) => d.isSuspicious ? "5,5" : "");
    
    // رسم نودها
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g");
    
    // دایره‌های نود
    node.append("circle")
      .attr("r", (d: any) => d.isExternal ? 8 : 12)
      .attr("fill", (d: any) => {
        if (d.isExternal) return "#bb86fc";
        if (d.isSuspicious) {
          const intensity = Math.min(100, d.suspiciousScore) / 100;
          return d3.interpolateRgb("#03dac6", "#cf6679")(intensity);
        }
        return "#03dac6";
      })
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.5);
    
    // متن نودها
    node.append("text")
      .text((d: any) => d.name.substring(0, 10))
      .attr("font-size", 8)
      .attr("dx", 15)
      .attr("dy", 4)
      .attr("fill", "#e2e8f0");
    
    // به‌روزرسانی موقعیت‌ها در هر تیک شبیه‌سازی
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => Math.max(0, Math.min(width, d.source.x)))
        .attr("y1", (d: any) => Math.max(0, Math.min(height, d.source.y)))
        .attr("x2", (d: any) => Math.max(0, Math.min(width, d.target.x)))
        .attr("y2", (d: any) => Math.max(0, Math.min(height, d.target.y)));
      
      node
        .attr("transform", (d: any) => `translate(${Math.max(0, Math.min(width, d.x))},${Math.max(0, Math.min(height, d.y))})`);
    });
    
    // افزودن قابلیت درگ کردن نودها
    node.call(d3.drag()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));
    
  }, [devices, connections]);
  
  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
    />
  );
};