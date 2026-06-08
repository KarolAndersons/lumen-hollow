import { Router } from 'express';
import { all, get } from '../db/database.mjs';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const years = (
      await all(
        `SELECT DISTINCT substr(start_date, 1, 4) AS year FROM events ORDER BY year DESC`,
      )
    ).map((r) => r.year);

    const categories = await all(`SELECT id, slug, name FROM event_categories ORDER BY name`);

    const currentYear = String(new Date().getFullYear());
    const selectedYear = years.includes(req.query.year) ? req.query.year : (years.includes(currentYear) ? currentYear : years[0]);
    const selectedCategory = req.query.category && req.query.category !== 'all' ? req.query.category : null;

    res.render('events', {
      title: 'Events, Lumen Hollow',
      years,
      categories,
      selectedYear,
      selectedCategory,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const event = await get(
      `SELECT e.*, c.name AS category_name, c.slug AS category_slug, h.name AS habitat_name, h.slug AS habitat_slug, h.accent_colour
         FROM events e
         JOIN event_categories c ON c.id = e.category_id
         LEFT JOIN habitats h ON h.id = e.habitat_id
        WHERE e.slug = ?`,
      [req.params.slug],
    );
    if (!event) return res.status(404).render('404', { title: 'Event not found' });
    const today = new Date().toISOString().slice(0, 10);
    const hasOccurred = event.end_date < today;
    const isOngoing = event.start_date <= today && event.end_date >= today;
    res.render('event', {
      title: `${event.title}, Lumen Hollow`,
      event,
      hasOccurred,
      isOngoing,
      today,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
