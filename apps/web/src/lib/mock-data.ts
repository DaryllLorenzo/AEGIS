export type ReviewStatus = "Open" | "In progress" | "Completed";

export type Review = {
  id: number;
  group: string;
  title: string;
  kind: string;
  version: string;
  status: ReviewStatus;
  due: string;
  dueTone: "default" | "urgent";
  assignee: string;
  annotations: number;
  reviewers: string[];
};

export const pendingReviews: Review[] = [
  {
    id: 4,
    group: "AI in Education",
    title: "Adaptive Learning Systems",
    kind: "Thesis",
    version: "v1.4",
    status: "Open",
    due: "Sep 3",
    dueTone: "default",
    assignee: "Ana Martínez",
    annotations: 8,
    reviewers: ["MC", "CR", "JL"],
  },
  {
    id: 1,
    group: "Computer Vision",
    title: "Image Segmentation",
    kind: "Research Paper",
    version: "v2.1",
    status: "In progress",
    due: "Today",
    dueTone: "urgent",
    assignee: "Dr. Chen",
    annotations: 12,
    reviewers: ["MG", "LC"],
  },
];

export const members = [
  { initials: "AM", name: "Ana Martínez", role: "Submitter", tone: "sage" },
  { initials: "MG", name: "María García", role: "Reviewer", tone: "blue" },
  { initials: "JS", name: "Dr. Smith", role: "Observer", tone: "gray" },
];

export const reviewerProgress = [
  { initials: "MG", name: "María", status: "In progress", tone: "warning" },
  { initials: "CR", name: "Carlos", status: "Completed", tone: "success" },
  { initials: "JL", name: "José", status: "In progress", tone: "warning" },
];

export const comments = [
  {
    id: 1,
    author: "María C.",
    initials: "MC",
    page: 2,
    quote: "However, if cognitive offloading becomes seamlessly integrated...",
    body: "This claim needs stronger empirical evidence. Are there recent studies we can cite regarding the integration workflow?",
    resolved: false,
  },
  {
    id: 2,
    author: "Dr. Smith",
    initials: "DS",
    page: 1,
    quote: "Check the terminology in the abstract.",
    body: "The introduction now uses the agreed definition.",
    resolved: true,
  },
  {
    id: 3,
    author: "Carlos R.",
    initials: "CR",
    page: 3,
    quote: "The proposed taxonomy requires validation.",
    body: "Could we add a short note explaining how the categories were tested?",
    resolved: false,
  },
];

export const discussionMessages = [
  {
    initials: "CR",
    author: "Carlos R.",
    time: "10:42",
    body: "I finished the statistical review. The methodology is sound, but the sample-size limitation should be explicit.",
  },
  {
    initials: "AM",
    author: "Ana Martínez",
    time: "11:08",
    body: "I’ll add that limitation to the next version and link it to the discussion section.",
  },
];
