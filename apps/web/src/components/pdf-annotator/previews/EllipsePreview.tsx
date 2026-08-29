import { Ellipse } from "react-konva";

type Props = {
  cx: number;
  cy: number;
  radiusX: number;
  radiusY: number;
};

export default function EllipsePreview({ cx, cy, radiusX, radiusY }: Props) {
  return (
    <Ellipse
      x={cx}
      y={cy}
      radiusX={radiusX}
      radiusY={radiusY}
      stroke="red"
      strokeWidth={2}
      dash={[6, 3]}
      listening={false}
    />
  );
}
