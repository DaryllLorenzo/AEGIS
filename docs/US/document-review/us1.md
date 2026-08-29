**Title:** Upload a document

**Quick context:** An authenticated User (Submitter) uploads a file; the system creates a `Document` in the `Uploaded` state and notifies the assigned reviewer.

**Scenarios (Given/When/Then):**

- Happy: Given an authenticated user with upload permission, when they submit a valid file, then the object is stored (objectKey, bucketName, fileSize, mimeType, checksum, totalPages), a `Document` row is created in `Uploaded` state, and the reviewer is notified (201 Created).
- Error 1: Given an authenticated user, when they upload an unsupported mime type or a file that exceeds the maximum size, then the request is rejected (4xx), no `Document` row is created, and no object is stored.
- Error 2: Given an authenticated user, when the computed checksum collides with an existing object, then the upload is rejected or versioned and a warning is logged.

**Key technical points:**

- Validate mime type and size before storing; compute the checksum before persisting the `Document` row.
- Log upload start, success, and failure with userId and objectKey.
