import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface GraphLine {
  dataKey: string;
  stroke: string;
  name: string;
  fn?: (x: number) => number;
}

export interface GraphDataConfig {
  data: any[];
  lines: GraphLine[];
  points?: GraphPoint[];
  xAxisDomain?: [number, number];
  yAxisDomain?: [number, number];
}

interface InteractiveGraphProps {
  graph: GraphDataConfig;
}

interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({ graph }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({
    xMin: graph.xAxisDomain?.[0] ?? -5,
    xMax: graph.xAxisDomain?.[1] ?? 5,
    yMin: graph.yAxisDomain?.[0] ?? -5,
    yMax: graph.yAxisDomain?.[1] ?? 20,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewportAtPanStart, setViewportAtPanStart] = useState<Viewport>(viewport);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; screenX: number; screenY: number; label?: string; color?: string } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ wx: number; wy: number } | null>(null);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

  const worldToScreen = useCallback((wx: number, wy: number, width: number, height: number) => {
    const plotW = width - PADDING.left - PADDING.right;
    const plotH = height - PADDING.top - PADDING.bottom;
    const sx = PADDING.left + ((wx - viewport.xMin) / (viewport.xMax - viewport.xMin)) * plotW;
    const sy = PADDING.top + ((viewport.yMax - wy) / (viewport.yMax - viewport.yMin)) * plotH;
    return { sx, sy };
  }, [viewport]);

  const screenToWorld = useCallback((sx: number, sy: number, width: number, height: number) => {
    const plotW = width - PADDING.left - PADDING.right;
    const plotH = height - PADDING.top - PADDING.bottom;
    const wx = viewport.xMin + ((sx - PADDING.left) / plotW) * (viewport.xMax - viewport.xMin);
    const wy = viewport.yMax - ((sy - PADDING.top) / plotH) * (viewport.yMax - viewport.yMin);
    return { wx, wy };
  }, [viewport]);

  const evaluateLine = useCallback((line: GraphLine, xMin: number, xMax: number, numPoints: number): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const step = (xMax - xMin) / numPoints;
    if (line.fn) {
      for (let i = 0; i <= numPoints; i++) {
        const x = xMin + i * step;
        try {
          const y = line.fn(x);
          if (isFinite(y)) points.push({ x, y });
        } catch { /* skip */ }
      }
    } else {
      // Interpolate/extrapolate from data
      const dataPoints = graph.data
        .map(d => ({ x: d.x as number, y: d[line.dataKey] as number }))
        .filter(d => d.y !== undefined && d.y !== null)
        .sort((a, b) => a.x - b.x);
      
      if (dataPoints.length < 2) return dataPoints;

      for (let i = 0; i <= numPoints; i++) {
        const x = xMin + i * step;
        // Find surrounding data points for interpolation
        let idx = dataPoints.findIndex(p => p.x >= x);
        if (idx === -1) {
          // Extrapolate from last two
          const p1 = dataPoints[dataPoints.length - 2];
          const p2 = dataPoints[dataPoints.length - 1];
          const slope = (p2.y - p1.y) / (p2.x - p1.x);
          points.push({ x, y: p2.y + slope * (x - p2.x) });
        } else if (idx === 0) {
          // Extrapolate from first two
          const p1 = dataPoints[0];
          const p2 = dataPoints[1];
          const slope = (p2.y - p1.y) / (p2.x - p1.x);
          points.push({ x, y: p1.y + slope * (x - p1.x) });
        } else {
          // Interpolate
          const p1 = dataPoints[idx - 1];
          const p2 = dataPoints[idx];
          const t = (x - p1.x) / (p2.x - p1.x);
          points.push({ x, y: p1.y + t * (p2.y - p1.y) });
        }
      }
    }
    return points;
  }, [graph.data]);

  const niceStep = (range: number, targetTicks: number): number => {
    const rough = range / targetTicks;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let nice: number;
    if (norm <= 1.5) nice = 1;
    else if (norm <= 3) nice = 2;
    else if (norm <= 7) nice = 5;
    else nice = 10;
    return nice * pow;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const plotW = w - PADDING.left - PADDING.right;
    const plotH = h - PADDING.top - PADDING.bottom;

    // Clip to plot area for grid and curves
    ctx.save();
    ctx.beginPath();
    ctx.rect(PADDING.left, PADDING.top, plotW, plotH);
    ctx.clip();

    // Grid lines
    const xStep = niceStep(viewport.xMax - viewport.xMin, 8);
    const yStep = niceStep(viewport.yMax - viewport.yMin, 6);

    const xStart = Math.floor(viewport.xMin / xStep) * xStep;
    const yStart = Math.floor(viewport.yMin / yStep) * yStep;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Vertical grid
    for (let x = xStart; x <= viewport.xMax + xStep; x += xStep) {
      const { sx } = worldToScreen(x, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(sx, PADDING.top);
      ctx.lineTo(sx, PADDING.top + plotH);
      ctx.stroke();
    }

    // Horizontal grid
    for (let y = yStart; y <= viewport.yMax + yStep; y += yStep) {
      const { sy } = worldToScreen(0, y, w, h);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, sy);
      ctx.lineTo(PADDING.left + plotW, sy);
      ctx.stroke();
    }

    // Axes (if visible)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    // X-axis (y=0)
    if (viewport.yMin <= 0 && viewport.yMax >= 0) {
      const { sy } = worldToScreen(0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, sy);
      ctx.lineTo(PADDING.left + plotW, sy);
      ctx.stroke();
    }
    // Y-axis (x=0)
    if (viewport.xMin <= 0 && viewport.xMax >= 0) {
      const { sx } = worldToScreen(0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(sx, PADDING.top);
      ctx.lineTo(sx, PADDING.top + plotH);
      ctx.stroke();
    }

    // Draw shaded area between curves if there are exactly 2 lines
    if (graph.lines.length === 2) {
      const numSamples = Math.max(400, Math.round(plotW * 2));
      const pts1 = evaluateLine(graph.lines[0], viewport.xMin, viewport.xMax, numSamples);
      const pts2 = evaluateLine(graph.lines[1], viewport.xMin, viewport.xMax, numSamples);

      if (pts1.length > 0 && pts2.length > 0) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.07)';
        ctx.beginPath();
        // Forward along line 1
        for (let i = 0; i < pts1.length; i++) {
          const { sx, sy } = worldToScreen(pts1[i].x, pts1[i].y, w, h);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        // Backward along line 2
        for (let i = pts2.length - 1; i >= 0; i--) {
          const { sx, sy } = worldToScreen(pts2[i].x, pts2[i].y, w, h);
          ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw curves
    const numSamples = Math.max(400, Math.round(plotW * 2));
    graph.lines.forEach((line) => {
      const pts = evaluateLine(line, viewport.xMin, viewport.xMax, numSamples);
      if (pts.length < 2) return;

      ctx.strokeStyle = line.stroke;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (const pt of pts) {
        const { sx, sy } = worldToScreen(pt.x, pt.y, w, h);
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    });

    // Draw intersection points
    if (graph.points) {
      graph.points.forEach((pt) => {
        const { sx, sy } = worldToScreen(pt.x, pt.y, w, h);
        // Outer glow
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = (pt.color || '#22d3ee') + '33';
        ctx.fill();
        // Point
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = pt.color || '#22d3ee';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    ctx.restore(); // un-clip

    // Axis tick labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';

    for (let x = xStart; x <= viewport.xMax + xStep; x += xStep) {
      const { sx } = worldToScreen(x, 0, w, h);
      if (sx >= PADDING.left - 5 && sx <= w - PADDING.right + 5) {
        ctx.fillText(formatTick(x), sx, h - PADDING.bottom + 18);
      }
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = yStart; y <= viewport.yMax + yStep; y += yStep) {
      const { sy } = worldToScreen(0, y, w, h);
      if (sy >= PADDING.top - 5 && sy <= h - PADDING.bottom + 5) {
        ctx.fillText(formatTick(y), PADDING.left - 8, sy);
      }
    }

    // Crosshair cursor position
    if (cursorPos) {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`(${cursorPos.wx.toFixed(2)}, ${cursorPos.wy.toFixed(2)})`, PADDING.left + 6, PADDING.top + 4);
    }

    // Hovered point tooltip
    if (hoveredPoint) {
      const px = hoveredPoint.screenX;
      const py = hoveredPoint.screenY;
      const text = `${hoveredPoint.label ? hoveredPoint.label + ': ' : ''}(${hoveredPoint.x.toFixed(2)}, ${hoveredPoint.y.toFixed(2)})`;
      ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
      const metrics = ctx.measureText(text);
      const tw = metrics.width + 16;
      const th = 28;
      const tx = Math.min(px + 12, w - tw - 5);
      const ty = Math.max(py - th - 8, 5);
      
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRect(ctx, tx, ty, tw, th, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, tx + 8, ty + th / 2);
    }
  }, [viewport, worldToScreen, evaluateLine, graph, cursorPos, hoveredPoint, dpr]);

  const formatTick = (val: number): string => {
    if (Math.abs(val) < 1e-10) return '0';
    if (Math.abs(val) >= 1000 || (Math.abs(val) < 0.01 && val !== 0)) return val.toExponential(1);
    const s = val.toFixed(2);
    return parseFloat(s).toString();
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { wx, wy } = screenToWorld(mouseX, mouseY, rect.width, rect.height);

    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;

    setViewport(v => ({
      xMin: wx - (wx - v.xMin) * zoomFactor,
      xMax: wx + (v.xMax - wx) * zoomFactor,
      yMin: wy - (wy - v.yMin) * zoomFactor,
      yMax: wy + (v.yMax - wy) * zoomFactor,
    }));
  }, [screenToWorld]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setViewportAtPanStart(viewport);
  }, [viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update cursor world position
    const world = screenToWorld(mouseX, mouseY, rect.width, rect.height);
    setCursorPos(world);

    // Check hovered points
    if (graph.points) {
      let found = false;
      for (const pt of graph.points) {
        const { sx, sy } = worldToScreen(pt.x, pt.y, rect.width, rect.height);
        const dist = Math.sqrt((mouseX - sx) ** 2 + (mouseY - sy) ** 2);
        if (dist < 12) {
          setHoveredPoint({ x: pt.x, y: pt.y, screenX: mouseX, screenY: mouseY, label: pt.label, color: pt.color });
          found = true;
          break;
        }
      }
      if (!found) setHoveredPoint(null);
    }

    if (!isPanning) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const plotW = rect.width - PADDING.left - PADDING.right;
    const plotH = rect.height - PADDING.top - PADDING.bottom;

    const worldDx = (dx / plotW) * (viewportAtPanStart.xMax - viewportAtPanStart.xMin);
    const worldDy = (dy / plotH) * (viewportAtPanStart.yMax - viewportAtPanStart.yMin);

    setViewport({
      xMin: viewportAtPanStart.xMin - worldDx,
      xMax: viewportAtPanStart.xMax - worldDx,
      yMin: viewportAtPanStart.yMin + worldDy,
      yMax: viewportAtPanStart.yMax + worldDy,
    });
  }, [isPanning, panStart, viewportAtPanStart, screenToWorld, worldToScreen, graph.points]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setCursorPos(null);
    setHoveredPoint(null);
  }, []);

  const handleReset = useCallback(() => {
    setViewport({
      xMin: graph.xAxisDomain?.[0] ?? -5,
      xMax: graph.xAxisDomain?.[1] ?? 5,
      yMin: graph.yAxisDomain?.[0] ?? -5,
      yMax: graph.yAxisDomain?.[1] ?? 20,
    });
  }, [graph]);

  const handleZoom = useCallback((factor: number) => {
    setViewport(v => {
      const cx = (v.xMin + v.xMax) / 2;
      const cy = (v.yMin + v.yMax) / 2;
      const hw = ((v.xMax - v.xMin) / 2) * factor;
      const hh = ((v.yMax - v.yMin) / 2) * factor;
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
  }, []);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {graph.lines.map((line, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded text-xs">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: line.stroke }} />
              <span className="text-slate-300">{line.name}</span>
            </div>
          ))}
          {graph.points && graph.points.map((pt, i) => (
            <div key={`pt-legend-${i}`} className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pt.color || '#22d3ee' }} />
              <span className="text-slate-300">{pt.label || `(${pt.x}, ${pt.y})`}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => handleZoom(0.7)} className="p-1.5 rounded hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors" title="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button onClick={() => handleZoom(1.4)} className="p-1.5 rounded hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors" title="Zoom out">
            <ZoomOut size={15} />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors" title="Reset view">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-1.5 mb-2 text-slate-500 text-[10px]">
        <Move size={10} />
        <span>Drag to pan · Scroll to zoom</span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-700/50 bg-[#0f172a]"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};