**Title:** Open a review for a document

**Quick context:** A Reviewer with a valid Group-Role opens a review on a `Document` that is currently in the `Uploaded` state. A `Reviews` row is created, the document moves to `On review`, and the submitter is notified.

**Scenarios (Given/When/Then):**

- Happy: Given a reviewer with a valid role on the document's group, when they open a review on an `Uploaded` document, then a `Reviews` row is created, the document transitions to `On review`, the submitter is notified, and the review is returned (201 Created).
- Error 1: Given a reviewer, when the document does not exist, the user lacks permission, or the document is not in `Uploaded` state, then the request fails with 404 / 403 / 409 respectively.
- Error 2: Given a reviewer, when a duplicate open review already exists for the same (userId, documentId), then the request returns 409 and the existing review is returned (idempotent).

**Key technical points:**

- Guard the status transition so only `Uploaded` documents can enter `On review`; make review creation idempotent on (userId, documentId).
- Log review creation with reviewId and documentId.
