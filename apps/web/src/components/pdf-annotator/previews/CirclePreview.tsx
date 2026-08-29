import { Circle } from "react-konva";

type Props = {
  cx: number;
  cy: number;
  radius: number;
};

export default function CirclePreview({ cx, cy, radius }: Props) {
  return (
    <Circle
      x={cx}
      y={cy}
      radius={radius}
      stroke="red"
      strokeWidth={2}
      dash={[6, 3]}
      listening={false}
    />
  );
}
