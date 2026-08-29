**Title:** Add an annotation to a review

**Quick context:** A Reviewer viewing an open review (document in `On review`) marks a page by providing pageNumber, annotationType, geometry (JSON position), color, opacity, content, and selectedText.

**Scenarios (Given/When/Then):**

- Happy: Given a reviewer with access to an open review, when they submit a valid annotation, then an `Annotations` row is created linked to the reviewId and userId (201 Created).
- Error 1: Given a reviewer, when the review does not exist, is inaccessible, or is not in `On review` state, then the request fails with 404 / 403 / 409 respectively.
- Error 2: Given a reviewer, when pageNumber is greater than `Document.totalPages`, then the request is rejected with 400 Bad Request.

**Key technical points:**

- Validate pageNumber ≤ `Document.totalPages`; store geometry (position) as JSON.
- Log annotation creation with reviewId and userId.
