import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  res.render('search', { title: 'Search, Lumen Hollow', query: q });
});

export default router;
