import { Request, Response } from 'express';
import { pool } from '../db';
import { QueryResultRow } from 'pg';

class ValidationError extends Error { }

export async function getItemsById<T extends QueryResultRow>(req: Request, res: Response, path: string, query: string) {
	console.log(path);
	try {
		const id: string | string[] = req.params.id;

		if (Array.isArray(id)) {
			throw new ValidationError('Invalid item ID parameter');
		}

		if (!/^\d+$/.test(id)) {
			throw new ValidationError('Invalid item ID parameter');
		}

		const result = await pool.query<T>(query, [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Item not found' });
		}

		res.json(result.rows);
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching item:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function getItemsByIds<T extends QueryResultRow>(req: Request, res: Response, path: string, query: string,) {
	console.log(path);
	try {
		const idsParam = req.params.ids;

		if (Array.isArray(idsParam)) {
			throw new ValidationError('Invalid item IDs parameter');
		}

		const articleIds = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);

		// Validate that all IDs are numeric
		if (articleIds.length === 0 || articleIds.some(id => !/^\d+$/.test(id))) {
			throw new ValidationError('Invalid item IDs parameter');
		}

		const result = await pool.query<T>(query, [articleIds]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'No items found with provided IDs' });
		}

		res.json(result.rows);
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching items:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}