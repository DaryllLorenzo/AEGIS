import { Rect } from "react-konva";
import type { RectangleGeometry } from "../types";

type Props = {
  geometry: RectangleGeometry;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  isSelectTool: boolean;
  onSelect: () => void;
};

export default function RectangleAnnotation({
  geometry: g,
  pageWidth,
  pageHeight,
  isSelected,
  isSelectTool,
  onSelect,
}: Props) {
  return (
    <Rect
      x={g.x * pageWidth}
      y={g.y * pageHeight}
      width={g.width * pageWidth}
      height={g.height * pageHeight}
      stroke={isSelected ? "#2563eb" : "red"}
      strokeWidth={isSelected ? 3 : 2}
      draggable={isSelectTool}
      onClick={() => { if (isSelectTool) onSelect(); }}
      onTap={() => { if (isSelectTool) onSelect(); }}
    />
  );
}
