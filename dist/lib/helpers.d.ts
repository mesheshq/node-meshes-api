export function readBody<T>(response: {
    text(): Promise<string>;
    headers?: {
        get(name: string): string | null;
    };
}): Promise<T | string | null>;
