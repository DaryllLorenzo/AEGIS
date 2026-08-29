# US format

Each User Story lives in its own file inside a feature folder under `docs/US/`:

```
docs/US/<feature>/usN.md
```

Example: `docs/US/document-review/us1.md`.

Every US file must follow this template (all in English, including the labels):

```markdown
**Title:** [concrete action]

**Quick context:** [who, when, and conditions]

**Scenarios (Given/When/Then):**

- Happy: [main flow]
- Error 1: [what happens if X fails]
- Error 2: [what happens if Y fails]

**Key technical points:**

- [important validations]
- [what to log]
```

Notes:

- One folder per feature; USs are numbered per folder starting at `us1`.
