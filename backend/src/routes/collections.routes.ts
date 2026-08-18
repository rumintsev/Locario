import { Router } from 'express';
import { getCollectionFull, getCollectionShort, getCollectionRelated } from '../controllers/collections.controller';

const router = Router();

router.get('/full/:id', getCollectionFull);
router.get('/short/:ids', getCollectionShort);
router.get('/related/:id', getCollectionRelated);

export default router;