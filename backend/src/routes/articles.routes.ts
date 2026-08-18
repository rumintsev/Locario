import { Router } from 'express';
import { getArticleFull, getArticleShort, getArticleRelated } from '../controllers/articles.controller';

const router = Router();

router.get('/full/:id', getArticleFull);
router.get('/short/:ids', getArticleShort);
router.get('/related/:id', getArticleRelated);

export default router;