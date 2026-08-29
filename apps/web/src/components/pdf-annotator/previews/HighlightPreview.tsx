import { Group, Rect, Line } from "react-konva";
import type { HighlightGeometry } from "../types";

type Props = {
  liveHighlight: HighlightGeometry | null;
  drawStart: { x: number; y: number };
  drawEnd: { x: number; y: number };
  pageWidth: number;
  pageHeight: number;
};

export default function HighlightPreview({
  liveHighlight,
  drawStart,
  drawEnd,
  pageWidth,
  pageHeight,
}: Props) {
  return (
    <>
      {liveHighlight && (
        <Group listening={false}>
          {liveHighlight.lines.map((line, i) => (
            <Rect
              key={i}
              x={line.x * pageWidth}
              y={line.y * pageHeight}
              width={line.width * pageWidth}
              height={line.height * pageHeight}
              fill="rgba(255, 235, 59, 0.4)"
              stroke="#2563eb"
              strokeWidth={1}
              dash={[4, 2]}
            />
          ))}
        </Group>
      )}
      <Line
        points={[drawStart.x, drawStart.y, drawEnd.x, drawEnd.y]}
        stroke="red"
        strokeWidth={2}
        listening={false}
      />
    </>
  );
}
