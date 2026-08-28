import { apiBaseUrl, getNotes } from "@/lib/api";

// Rendered on every request so the page always reflects the current database state.
export const dynamic = "force-dynamic";

export default async function Home() {
  const notes = await getNotes();

  return (
    <main className="page">
      <h1>AEGIS</h1>
      <p className="subtitle">Academic Editorial &amp; Graduate Integration System</p>

      <section>
        <h2>Notes</h2>

        {notes === null ? (
          <p className="error">
            No response from <code>{apiBaseUrl}</code>. Check that the <code>api</code>{" "}
            resource is running; the server log has the underlying error.
          </p>
        ) : notes.length === 0 ? (
          <p className="muted">
            No notes yet. Create one with{" "}
            <code>curl -X POST $API_URL/api/notes -H &quot;content-type: application/json&quot; -d &apos;{"{"}&quot;title&quot;:&quot;Hello&quot;{"}"}&apos;</code>
          </p>
        ) : (
          <ul className="notes">
            {notes.map((note) => (
              <li key={note.id}>
                <span>{note.title}</span>
                <time dateTime={note.createdAt}>
                  {new Date(note.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
