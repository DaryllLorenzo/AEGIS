import { Circle } from "react-konva";
import type { CircleGeometry } from "../types";

type Props = {
  geometry: CircleGeometry;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  isSelectTool: boolean;
  onSelect: () => void;
};

export default function CircleAnnotation({
  geometry: g,
  pageWidth,
  pageHeight,
  isSelected,
  isSelectTool,
  onSelect,
}: Props) {
  return (
    <Circle
      x={g.cx * pageWidth}
      y={g.cy * pageHeight}
      radius={g.radius * pageWidth}
      stroke={isSelected ? "#2563eb" : "red"}
      strokeWidth={isSelected ? 3 : 2}
      draggable={isSelectTool}
      onClick={() => { if (isSelectTool) onSelect(); }}
      onTap={() => { if (isSelectTool) onSelect(); }}
    />
  );
}
