import { Router } from 'express';
import { all } from '../db/database.mjs';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const habitats = await all(
      `SELECT id, slug, name, tagline, description, accent_colour, map_x, map_y, display_order,
              is_featured, image_filename, image_alt
         FROM habitats
        ORDER BY display_order`,
    );
    res.render('home', { title: 'Lumen Hollow, Nightfall Wildlife Reserve', habitats });
  } catch (err) {
    next(err);
  }
});

export default router;
