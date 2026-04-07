"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { GraphNode, GraphLink } from "@/lib/wiki";
import { slugToHref } from "@/lib/utils";

interface GraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function GraphView({ nodes, links }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Clone data for d3 mutation
    const nodeData: (GraphNode & d3.SimulationNodeDatum)[] = nodes.map((n) => ({ ...n }));
    const linkData: (d3.SimulationLinkDatum<typeof nodeData[0]> & { source: string; target: string })[] =
      links.map((l) => ({ ...l }));

    const simulation = d3
      .forceSimulation(nodeData)
      .force(
        "link",
        d3
          .forceLink(linkData)
          .id((d: d3.SimulationNodeDatum) => (d as GraphNode).id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Zoom container
    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        }) as never
    );

    // Links
    const link = g
      .append("g")
      .selectAll("line")
      .data(linkData)
      .enter()
      .append("line")
      .attr("stroke", "#c8ccd1")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // Arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#a2a9b1");

    // Nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodeData)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        router.push(slugToHref(d.slug));
      })
      .call(
        d3
          .drag<SVGGElement, typeof nodeData[0]>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as never
      );

    node
      .append("circle")
      .attr("r", 8)
      .attr("fill", "#3366cc")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .on("mouseover", function () {
        d3.select(this).attr("r", 11).attr("fill", "#0645ad");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 8).attr("fill", "#3366cc");
      });

    node
      .append("text")
      .text((d) => d.title)
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "12px")
      .attr("font-family", "-apple-system, Arial, sans-serif")
      .attr("fill", "#202122")
      .attr("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as typeof nodeData[0]).x ?? 0)
        .attr("y1", (d) => (d.source as typeof nodeData[0]).y ?? 0)
        .attr("x2", (d) => (d.target as typeof nodeData[0]).x ?? 0)
        .attr("y2", (d) => (d.target as typeof nodeData[0]).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, router]);

  if (nodes.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#54595d" }}>
        No pages with links found. Add some [[wikilinks]] to your articles to see them here.
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{ display: "block" }}
    />
  );
}
