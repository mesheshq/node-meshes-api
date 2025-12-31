/**
 * Helper to read the response body and parse as a json object; if json parsing fails, fallback to text
 * @template T
 * @param {{ text(): Promise<string>, headers?: { get(name: string): string | null } }} response
 * @returns {Promise<T | string | null>}
 */
export const readBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
