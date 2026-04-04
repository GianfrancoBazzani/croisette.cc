"use client";

interface AllocationItem {
  asset: string;
  pct: number;
}

interface AllocationChartProps {
  allocation: AllocationItem[];
}

const SLICE_COLORS = [
  "#af1c57",                  // Data Pink — largest
  "#d4956a",                  // Warm tan — second
  "rgba(254,248,246,0.35)",   // Muted surface — third
  "#6b4c3b",                  // Dark warm — fourth (if needed)
  "#c47a8a",                  // Soft rose — fifth (if needed)
];

export function AllocationChart({ allocation }: AllocationChartProps) {
  const RADIUS = 14;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Sort descending by pct so largest slice gets the primary color
  const sorted = [...allocation].sort((a, b) => b.pct - a.pct);

  // Calculate dash offsets
  let cumulativeOffset = 0;
  const slices = sorted.map((item, i) => {
    const dashLength = CIRCUMFERENCE * (item.pct / 100);
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...item,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dashLength,
      offset,
    };
  });

  return (
    <div className="animate-fade-in-up">
      {/* Donut chart */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[180px] h-[180px]">
          <svg
            viewBox="0 0 36 36"
            className="w-[180px] h-[180px]"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Background track */}
            <circle
              cx="18" cy="18" r={RADIUS}
              fill="none"
              stroke="rgba(254,248,246,0.05)"
              strokeWidth="4"
            />
            {/* Slices */}
            {slices.map((slice) => (
              <circle
                key={slice.asset}
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth="4"
                strokeDasharray={`${slice.dashLength} ${CIRCUMFERENCE}`}
                strokeDashoffset={slice.offset}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-xl font-bold tracking-tight text-surface">
              100%
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(254,248,246,0.4)" }}>
              Allocated
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        {slices.map((slice) => (
          <div key={slice.asset} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: slice.color }}
              />
              <span className="text-sm" style={{ color: "rgba(254,248,246,0.75)" }}>
                {slice.asset}
              </span>
            </div>
            <span className="text-sm font-semibold text-surface">
              {slice.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
