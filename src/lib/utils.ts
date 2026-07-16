/**
 * Safely parse a JSON string, returning a fallback value if parsing fails.
 * This prevents the application from crashing if the database contains malformed JSON strings.
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error('Failed to parse JSON:', jsonString, error);
    return fallback;
  }
}
