export type Tool = "select" | "rectangle" | "circle" | "ellipse" | "highlight";

export type RectangleGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleGeometry = {
  cx: number;
  cy: number;
  radius: number;
};

export type EllipseGeometry = {
  cx: number;
  cy: number;
  radiusX: number;
  radiusY: number;
};

export type HighlightGeometry = {
  lines: RectangleGeometry[];
};

export type Annotation = {
  id: string;
  page: number;
  type: Tool;
  geometry: RectangleGeometry | CircleGeometry | EllipseGeometry | HighlightGeometry;
  content: string | null;
  /** Author display name (resolved by the API / current user for new ones). */
  authorName: string | null;
  createdByUserId: string | null;
};
