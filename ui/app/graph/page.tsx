import { buildGraphData } from "@/lib/wiki";
import GraphView from "@/components/GraphView";

export const metadata = {
  title: "Graph View — Personal Wiki",
};

export default function GraphPage() {
  const graphData = buildGraphData();

  return (
    <div>
      <h1 className="mw-page-title">Graph View</h1>
      <p style={{ fontSize: 13, color: "#54595d", marginBottom: 12 }}>
        Force-directed graph of wiki page relationships. Drag nodes to rearrange. Click a node to navigate.
      </p>
      <div className="graph-container">
        <GraphView nodes={graphData.nodes} links={graphData.links} />
      </div>
    </div>
  );
}
