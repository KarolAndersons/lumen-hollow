import { Router } from 'express';
import { all } from '../db/database.mjs';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const creatures = await all(
      `SELECT e.name, e.species_common, e.species_scientific, e.description, h.name AS habitat_name, h.accent_colour
         FROM exhibits e
         JOIN habitats h ON h.id = e.habitat_id
        WHERE e.species_common IS NOT NULL
        ORDER BY e.name`,
    );
    res.render('activity', {
      title: 'Spot the Nocturnal Creature, Lumen Hollow',
      creatures,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
