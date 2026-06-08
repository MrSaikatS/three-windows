import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  gradientId?: string;
}

const Sparkline = ({
  data,
  width = 300,
  height = 32,
  strokeColor = "currentColor",
  gradientId = "spark-fill",
}: SparklineProps) => {
  const paths = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return { x, y };
    });

    const line = points
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join("");

    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line}L${last!.x.toFixed(1)},${height - 1}L${first!.x.toFixed(1)},${height - 1}Z`;

    return { line, area };
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible">
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1">
          <stop
            offset="0%"
            stopColor={strokeColor}
            stopOpacity={0.3}
          />
          <stop
            offset="100%"
            stopColor={strokeColor}
            stopOpacity={0.02}
          />
        </linearGradient>
      </defs>
      <path
        d={paths.area}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <path
        d={paths.line}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export { Sparkline };
