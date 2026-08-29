**Title:** Close a group and purge document history, keeping only the final PDF

**Quick context:** A Reviewer with close permission closes a `Group`. The system notifies all group members, purges the intermediate document history (annotations, comments, and draft reviews), preserves only the final PDF version, and marks the `Document` as `Finished` and the `Group` as `Closed`.

**Scenarios (Given/When/Then):**

- Happy: Given a reviewer with close permission, when they close the group, then members are notified, each document's intermediate history is purged while the final PDF (objectKey, bucketName) is retained, and the `Document` and `Group` statuses are updated to `Finished` and `Closed` (200 OK).
- Error 1: Given a user without close permission, when they attempt to close the group, then the request is rejected with 403 and the group remains open.
- Error 2: Given a reviewer with close permission, when an object-storage delete fails mid-purge, then the operation is compensated/aborted, a critical error is logged, and the group remains open.

**Key technical points:**

- Validate close role; make the close operation idempotent.
- Decide between hard-delete and anonymization of `Annotations`, `Comments`, and `Reviews`.
- Log purge start, per-document result, and completion.
