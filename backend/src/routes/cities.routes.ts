import { Router } from 'express';
import { getCityFull, getCityShort, getRelatedCities } from '../controllers/cities.controller';

const router = Router();

router.get('/full/:id', getCityFull);
router.get('/short/:ids', getCityShort);
router.get('/related/:id', getRelatedCities);

export default router;