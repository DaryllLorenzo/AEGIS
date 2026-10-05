import type { Review, ReviewStatus } from "./api/types";

/**
 * Review state machine — mirrors the backend rules in
 * apps/api/Endpoints/Reviews/Features/UpdateReview/UpdateReviewHandler.cs
 *
 * The backend only accepts two transitions:
 *   Pending -> InProgress ("start")
 *   InProgress -> Completed ("complete")
 * Completed is terminal: any update to a completed review is rejected.
 * The UI must never send a transition that is not listed here.
 */

/** The only legal next status, or null when the review is terminal. */
export function nextReviewStatus(status: ReviewStatus): ReviewStatus | null {
  switch (status) {
    case "Pending":
      return "InProgress";
    case "InProgress":
      return "Completed";
    case "Completed":
      return null;
  }
}

export type ReviewAction = {
  label: string;
  hint: string;
  verb: "start" | "complete";
};

/** The single action that advances a review, or null when no action is allowed. */
export function reviewNextAction(status: ReviewStatus): ReviewAction | null {
  switch (status) {
    case "Pending":
      return {
        label: "Start review",
        hint: "Opens the review round for annotation",
        verb: "start",
      };
    case "InProgress":
      return {
        label: "Complete review",
        hint: "Closes the review round",
        verb: "complete",
      };
    case "Completed":
      return null;
  }
}

export function isReviewOverdue(review: Review): boolean {
  if (review.status === "Completed" || !review.dueDate) return false;
  return new Date(review.dueDate).getTime() < Date.now();
}

/**
 * Submission-flavored status labels derived from the review status.
 * The backend has a single status machine for reviews; "submission" statuses
 * are a presentation mapping for the My Submissions view:
 *   Pending    -> Submitted   (waiting for the reviewer to start)
 *   InProgress -> Under review
 *   Completed  -> Approved    (review round closed; document locked)
 */
export function submissionStatusLabel(status: ReviewStatus): string {
  switch (status) {
    case "Pending":
      return "Submitted";
    case "InProgress":
      return "Under review";
    case "Completed":
      return "Approved";
  }
}

export function submissionStatusClass(status: ReviewStatus): string {
  switch (status) {
    case "Pending":
      return "submitted";
    case "InProgress":
      return "under-review";
    case "Completed":
      return "approved";
  }
}

export const REVIEW_STATUS_ORDER: Record<ReviewStatus, number> = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
};
