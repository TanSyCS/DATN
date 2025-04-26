import React, { useMemo, useState, useRef } from 'react';
import topoDataRaw from '../../data.txt?raw';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;
const SVG_WIDTH = window.innerWidth;
const SVG_HEIGHT = window.innerHeight - 80; // trừ header
const NODE_Y = 200;
const COLORS = ['#2563eb', '#059669', '#f59e42'];
const SWITCH_IMG = '/network-switch.svg';
const ARROW_IMG = '/right-arrow.svg';

const getSwitchLabel = (nodeId: string) => {
  const match = nodeId.match(/openflow:(\d+)/);
  return match ? `Switch ${match[1]}` : nodeId;
};

const parseSwitchPort = (tp: string) => {
  const match = tp.match(/openflow:(\d+):(\d+)/);
  return match ? { sw: match[1], port: match[2] } : { sw: '?', port: '?' };
};

const parseTopology = () => {
  let data;
  try {
    data = JSON.parse(topoDataRaw);
  } catch {
    return { nodes: [], links: [], portTable: [], portMap: {}, portDetailMap: {} };
  }
  const topo = data['network-topology:network-topology'].topology[0];
  const nodes = topo.node.map((n: any, idx: number) => ({
    id: n['node-id'],
    label: getSwitchLabel(n['node-id']),
    x: 150 + idx * 400,
    y: NODE_Y,
    color: COLORS[idx % COLORS.length],
  }));
  // Tạo map cặp switch (có hướng)
  const linkMap: Record<string, { src: string; dst: string }> = {};
  topo.link.forEach((l: any) => {
    const src = l.source['source-node'];
    const dst = l.destination['dest-node'];
    const key = `${src}__${dst}`;
    linkMap[key] = { src, dst };
  });
  const links = Object.values(linkMap);

  // Chuẩn bị dữ liệu cho bảng port (chi tiết từng port)
  const portDetailMap: Record<string, { port: string; fromSwitch: string; fromPort: string; allow?: boolean; deny?: boolean }[]> = {};
  nodes.forEach((n: any) => {
    portDetailMap[n.id] = topo.link
      .filter((l: any) => l.destination['dest-node'] === n.id)
      .map((l: any) => {
        const src = parseSwitchPort(l.source['source-tp']);
        const dst = parseSwitchPort(l.destination['dest-tp']);
        return {
          port: dst.port,
          fromSwitch: src.sw,
          fromPort: src.port,
          allow: true, // mặc định allow
          deny: false, // mặc định deny
        };
      });
  });

  return { nodes, links, portDetailMap };
};

interface NodeType {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

const Topology: React.FC = () => {
  const { links, portDetailMap } = useMemo(parseTopology, []);
  const [nodes, setNodes] = useState<NodeType[]>(() => parseTopology().nodes);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [selectedSwitch, setSelectedSwitch] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Tạo map nodeId -> node để lấy vị trí
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setDragging({ id, offsetX: mouseX - node.x, offsetY: mouseY - node.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragging.id
          ? {
              ...n,
              x: Math.max(0, Math.min(mouseX - dragging.offsetX, SVG_WIDTH - NODE_WIDTH)),
              y: Math.max(0, Math.min(mouseY - dragging.offsetY, SVG_HEIGHT - NODE_HEIGHT)),
            }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Click node để hiện bảng, click SVG để ẩn
  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedSwitch(id);
  };
  const handleSvgClick = () => setSelectedSwitch(null);

  // Helper: Tính góc xoay mũi tên SVG
  const getArrowAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  };

  return (
    <div className="w-full min-h-[100vh] bg-gray-100 rounded-lg shadow p-0 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Network Topology (SVG)</h2>
      <svg
        ref={svgRef}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        className="bg-gray-50 rounded shadow cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
      >
        <defs>
          {/* Đổi màu edge thành đen */}
        </defs>
        {/* Vẽ links (mỗi cặp switch 1 đường) */}
        {links.map((link, i) => {
          const src = nodeMap[link.src];
          const dst = nodeMap[link.dst];
          if (!src || !dst) return null;
          const x1 = src.x + NODE_WIDTH / 2;
          const y1 = src.y + NODE_HEIGHT / 2;
          const x2 = dst.x + NODE_WIDTH / 2;
          const y2 = dst.y + NODE_HEIGHT / 2;
          // Vị trí mũi tên SVG, dịch ra xa node đích
          const arrowLen = 32;
          const arrowOffset = 120; // dịch ra xa hơn nữa
          const angle = getArrowAngle(x1, y1, x2, y2);
          const ax = x2 - (arrowOffset / 2) * Math.cos((angle * Math.PI) / 180);
          const ay = y2 - (arrowOffset / 2) * Math.sin((angle * Math.PI) / 180);
          return (
            <g key={link.src + '_' + link.dst}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#222"
                strokeWidth={4}
                style={{ filter: 'drop-shadow(0px 2px 2px #2228)' }}
              />
              <image
                href={ARROW_IMG}
                x={ax - 16}
                y={ay - 16}
                width={32}
                height={32}
                transform={`rotate(${angle} ${ax} ${ay})`}
                style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 2px 2px #2228)' }}
              />
            </g>
          );
        })}
        {/* Vẽ nodes là ảnh switch */}
        {nodes.map((n) => (
          <g key={n.id} style={{ cursor: 'move' }} onMouseDown={(e) => handleMouseDown(e, n.id)} onClick={(e) => handleNodeClick(e, n.id)}>
            <image
              href={SWITCH_IMG}
              x={n.x}
              y={n.y}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              style={{ filter: 'drop-shadow(0px 2px 2px #60a5fa88)' }}
            />
            <text
              x={n.x + NODE_WIDTH / 2}
              y={n.y + NODE_HEIGHT + 22}
              textAnchor="middle"
              fontWeight={900}
              fontSize={22}
              fill={n.color}
              pointerEvents="none"
            >
              {n.label}
            </text>
            {/* Hiện bảng nhỏ nếu được chọn */}
            {selectedSwitch === n.id && (
              <foreignObject
                x={n.x + NODE_WIDTH + 10}
                y={n.y}
                width={260}
                height={120}
                style={{ zIndex: 10 }}
              >
                <div className="bg-white rounded shadow-lg border border-blue-400 p-3 text-sm min-w-[220px]">
                  <div className="font-semibold text-blue-700 mb-1">{n.label} - Ports Connected</div>
                  <table className="min-w-full text-left">
                    <thead>
                      <tr>
                        <th className="pr-2">Port</th>
                        <th className="pr-2">From</th>
                        <th className="pr-2 text-green-600">Allow</th>
                        <th className="pr-2 text-red-600">Deny</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portDetailMap[n.id]?.length > 0 ? (
                        portDetailMap[n.id].map((p: any, idx: number) => (
                          <tr key={idx}>
                            <td className="font-semibold text-blue-700">{p.port}</td>
                            <td>Switch <span className="font-semibold text-blue-700">{p.fromSwitch}</span> port <span className="font-semibold text-blue-700">{p.fromPort}</span></td>
                            <td className="text-center">
                              {p.allow ? <span className="inline-block w-4 h-4 rounded-full bg-green-500" title="Allow"></span> : ''}
                            </td>
                            <td className="text-center">
                              {p.deny ? <span className="inline-block w-4 h-4 rounded-full bg-red-500" title="Deny"></span> : ''}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="text-gray-400">No ports connected</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </foreignObject>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Topology; 