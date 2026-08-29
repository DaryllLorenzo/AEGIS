import { Group, Rect } from "react-konva";
import type { HighlightGeometry } from "../types";

type Props = {
  geometry: HighlightGeometry;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  onSelect: () => void;
};

export default function HighlightAnnotation({
  geometry,
  pageWidth,
  pageHeight,
  isSelected,
  onSelect,
}: Props) {
  return (
    <Group
      onClick={onSelect}
      onTap={onSelect}
    >
      {geometry.lines.map((line, i) => (
        <Rect
          key={i}
          x={line.x * pageWidth}
          y={line.y * pageHeight}
          width={line.width * pageWidth}
          height={line.height * pageHeight}
          fill="rgba(255, 235, 59, 0.4)"
          stroke={isSelected ? "#2563eb" : undefined}
          strokeWidth={isSelected ? 1 : 0}
          listening={false}
        />
      ))}
    </Group>
  );
}
