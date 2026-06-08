import { Router } from 'express';
import { all, get } from '../db/database.mjs';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const habitats = await all(
      `SELECT slug, name, tagline, description, accent_colour,
              image_filename, image_alt
         FROM habitats
        ORDER BY display_order`,
    );
    res.render('habitats', { title: 'Habitats, Lumen Hollow', habitats });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const habitat = await get(
      `SELECT * FROM habitats WHERE slug = ?`,
      [req.params.slug],
    );
    if (!habitat) {
      return res.status(404).render('404', { title: 'Habitat not found' });
    }
    const exhibits = await all(
      `SELECT * FROM exhibits WHERE habitat_id = ? ORDER BY id`,
      [habitat.id],
    );
    res.render('habitat', {
      title: `${habitat.name}, Lumen Hollow`,
      habitat,
      exhibits,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
