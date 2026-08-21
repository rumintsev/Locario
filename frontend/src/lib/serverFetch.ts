import { z } from 'zod';

type FetchResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

export async function serverFetch<T>(
	path: string,
	schema: z.ZodType<T>
): Promise<FetchResult<T>> {
	try {
		const res = await fetch(`${process.env.DOMAIN || 'http://localhost:3001'}${path}`);

		if (!res.ok) {
			return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
		}

		const data = await res.json();
		const result = schema.safeParse(data);

		if (!result.success) {
			console.error(`Zod validation error for ${path}:`, result.error);
			return { success: false, error: 'Invalid data format' };
		}

		return { success: true, data: result.data };
	} catch (err) {
		console.error(`Fetch error for ${path}:`, err);
		return { success: false, error: 'Network error' };
	}
}