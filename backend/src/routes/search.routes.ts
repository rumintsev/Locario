import { Router } from 'express';
import { getSearchShort, getSearchFull } from '../controllers/search.controller';

const router = Router();

router.get('/short', getSearchShort);
router.get('/full', getSearchFull);

export default router;