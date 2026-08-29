import { Rect } from "react-konva";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function RectanglePreview({ x, y, width, height }: Props) {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      stroke="red"
      strokeWidth={2}
      dash={[6, 3]}
      listening={false}
    />
  );
}
