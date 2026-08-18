import { Pool } from 'pg';

export const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'locario_db',
	password: process.env.DB_PASSWORD,
	port: 5432,
});

pool.connect()
	.then(() => console.log('Connected to PostgreSQL'))
	.catch((err: Error) => console.error('Connection error', err.stack));