export function readBody<T = unknown>(response: {
  text(): Promise<string>;
  headers?: { get(name: string): string | null };
}): Promise<T | string | null>;
