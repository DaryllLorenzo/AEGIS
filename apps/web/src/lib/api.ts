/**
 * Base URL of the AEGIS API.
 *
 * API_URL is the address reachable from the Next.js server (the Aspire endpoint in
 * development, the compose service name in Docker). NEXT_PUBLIC_API_URL is the address the
 * browser uses and is the only one inlined into client bundles.
 */
export const apiBaseUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5180";

export type Note = {
  id: string;
  title: string;
  createdAt: string;
};

/**
 * Fetches the notes from the API. Returns null when the API cannot be reached, after
 * logging why: this runs on the server, so the reason shows up in the `web` resource logs
 * in the Aspire dashboard rather than vanishing into a generic error page.
 */
export async function getNotes(): Promise<Note[] | null> {
  const url = `${apiBaseUrl}/api/notes`;

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(`GET ${url} -> ${response.status} ${response.statusText}`);
      return null;
    }

    return (await response.json()) as Note[];
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause?.code;
    console.error(`GET ${url} failed${cause ? ` (${cause})` : ""}:`, error);
    return null;
  }
}
