import { Router } from 'express';
import { getPlaceFull, getPlaceShort, getPlaceRelated } from '../controllers/places.controller';

const router = Router();

router.get('/full/:id', getPlaceFull);
router.get('/short/:ids', getPlaceShort);
router.get('/related/:id', getPlaceRelated);

export default router;