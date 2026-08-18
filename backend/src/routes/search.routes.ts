import { Router } from 'express';
import { getSearchShort, getSearchFull, getSearchByTag } from '../controllers/search.controller';

const router = Router();

router.get('/short', getSearchShort);
router.get('/full', getSearchFull);
router.get('/tag/:slug', getSearchByTag);

export default router;