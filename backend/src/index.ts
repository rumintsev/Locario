import 'dotenv/config';

import placesRouter from './routes/places.routes';
import articlesRouter from './routes/articles.routes';
import citiesRouter from './routes/cities.routes';
import collectionsRouter from './routes/collections.routes';
import searchRouter from './routes/search.routes';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet()); // middleware for security headers

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 30,
	message: {
		error: 'Too many requests from this IP, please try again later.'
	},
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(limiter);

app.use(cors({
	origin: function (origin, callback) {
		if (!origin || origin === process.env.DOMAIN) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '1mb' }));

app.use('/places', placesRouter);
app.use('/articles', articlesRouter);
app.use('/cities', citiesRouter);
app.use('/collections', collectionsRouter);
app.use('/search', searchRouter);

// If middlware fails, log the error and send a 500 response
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(err);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));