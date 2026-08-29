import { Ellipse } from "react-konva";
import type { EllipseGeometry } from "../types";

type Props = {
  geometry: EllipseGeometry;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  isSelectTool: boolean;
  onSelect: () => void;
};

export default function EllipseAnnotation({
  geometry: g,
  pageWidth,
  pageHeight,
  isSelected,
  isSelectTool,
  onSelect,
}: Props) {
  return (
    <Ellipse
      x={g.cx * pageWidth}
      y={g.cy * pageHeight}
      radiusX={g.radiusX * pageWidth}
      radiusY={g.radiusY * pageHeight}
      stroke={isSelected ? "#2563eb" : "red"}
      strokeWidth={isSelected ? 3 : 2}
      draggable={isSelectTool}
      onClick={() => { if (isSelectTool) onSelect(); }}
      onTap={() => { if (isSelectTool) onSelect(); }}
    />
  );
}
