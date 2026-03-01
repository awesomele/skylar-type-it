import React from 'react';

interface DataPoint {
  time: number;
  wpm: number;
}

interface Props {
  wpmHistory: DataPoint[];
}

const PADDING = { top: 16, right: 20, bottom: 32, left: 44 };
const VIEW_W = 600;
const VIEW_H = 160;
const CHART_W = VIEW_W - PADDING.left - PADDING.right;
const CHART_H = VIEW_H - PADDING.top - PADDING.bottom;

export function WpmChart({ wpmHistory }: Props) {
  if (wpmHistory.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">WPM Trend</div>
        <div className="flex items-center justify-center h-24 text-gray-300 text-sm">
          Start typing to see your WPM trend
        </div>
      </div>
    );
  }

  const minTime = wpmHistory[0].time;
  const maxTime = wpmHistory[wpmHistory.length - 1].time;
  const wpmValues = wpmHistory.map((d) => d.wpm);
  const rawMin = Math.min(...wpmValues);
  const rawMax = Math.max(...wpmValues);

  // Add vertical padding so the line doesn't touch the edges
  const pad = Math.max(5, Math.ceil((rawMax - rawMin) * 0.15));
  const yMin = Math.max(0, rawMin - pad);
  const yMax = rawMax + pad;
  const yRange = yMax - yMin || 1;
  const xRange = maxTime - minTime || 1;

  function toX(t: number) {
    return PADDING.left + ((t - minTime) / xRange) * CHART_W;
  }
  function toY(w: number) {
    return PADDING.top + (1 - (w - yMin) / yRange) * CHART_H;
  }

  const points = wpmHistory.map((d) => `${toX(d.time)},${toY(d.wpm)}`).join(' ');

  // Y-axis ticks: 4 evenly spaced values
  const yTicks = Array.from({ length: 4 }, (_, i) =>
    Math.round(yMin + (yRange * i) / 3)
  );

  // X-axis ticks: up to 5, but no more than data range
  const xTickCount = Math.min(5, maxTime - minTime + 1);
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    Math.round(minTime + (xRange * i) / (xTickCount - 1))
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">WPM Trend</div>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        style={{ height: 140 }}
        aria-label="WPM over time"
      >
        {/* Grid lines */}
        {yTicks.map((val) => (
          <line
            key={val}
            x1={PADDING.left}
            y1={toY(val)}
            x2={VIEW_W - PADDING.right}
            y2={toY(val)}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((val) => (
          <text
            key={val}
            x={PADDING.left - 6}
            y={toY(val)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {val}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t) => (
          <text
            key={t}
            x={toX(t)}
            y={VIEW_H - PADDING.bottom + 14}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {t}s
          </text>
        ))}

        {/* Axis lines */}
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={VIEW_H - PADDING.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <line
          x1={PADDING.left}
          y1={VIEW_H - PADDING.bottom}
          x2={VIEW_W - PADDING.right}
          y2={VIEW_H - PADDING.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* WPM line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data point dots */}
        {wpmHistory.map((d, i) => (
          <circle
            key={i}
            cx={toX(d.time)}
            cy={toY(d.wpm)}
            r={3}
            fill="#3b82f6"
          />
        ))}
      </svg>
    </div>
  );
}
