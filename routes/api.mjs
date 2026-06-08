import { Router } from 'express';
import { all, get, run } from '../db/database.mjs';

const router = Router();

// AJAX: full habitat data (used by the map homepage preview panel)
router.get('/habitats/:slug', async (req, res, next) => {
  try {
    const habitat = await get(`SELECT * FROM habitats WHERE slug = ?`, [req.params.slug]);
    if (!habitat) return res.status(404).json({ error: 'Habitat not found' });
    const exhibits = await all(
      `SELECT slug, name, kind, species_common, species_scientific, iucn_status, description
         FROM exhibits WHERE habitat_id = ? ORDER BY id`,
      [habitat.id],
    );
    res.json({ habitat, exhibits });
  } catch (err) {
    next(err);
  }
});

// AJAX: global search across habitats, exhibits and events
router.get('/search', async (req, res, next) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ query: q, results: [] });
  const like = `%${q}%`;
  try {
    const habitats = await all(
      `SELECT slug, name, tagline AS snippet, 'habitat' AS kind
         FROM habitats
        WHERE name LIKE ? OR tagline LIKE ? OR description LIKE ?
        LIMIT 6`,
      [like, like, like],
    );
    const exhibits = await all(
      `SELECT e.slug, e.name, e.description AS snippet, 'exhibit' AS kind, h.slug AS habitat_slug
         FROM exhibits e
         JOIN habitats h ON h.id = e.habitat_id
        WHERE e.name LIKE ? OR e.species_common LIKE ? OR e.species_scientific LIKE ? OR e.description LIKE ?
        LIMIT 8`,
      [like, like, like, like],
    );
    const events = await all(
      `SELECT slug, title AS name, summary AS snippet, 'event' AS kind, start_date
         FROM events
        WHERE title LIKE ? OR summary LIKE ? OR description LIKE ?
        LIMIT 6`,
      [like, like, like],
    );
    res.json({ query: q, results: [...habitats, ...exhibits, ...events] });
  } catch (err) {
    next(err);
  }
});

// AJAX: events list filtered by year and category
router.get('/events', async (req, res, next) => {
  const year = (req.query.year || '').match(/^\d{4}$/) ? req.query.year : null;
  const categorySlug = req.query.category && req.query.category !== 'all' ? req.query.category : null;
  try {
    const params = [];
    const conditions = [];
    if (year) {
      conditions.push(`substr(e.start_date, 1, 4) = ?`);
      params.push(year);
    }
    if (categorySlug) {
      conditions.push(`c.slug = ?`);
      params.push(categorySlug);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const events = await all(
      `SELECT e.slug, e.title, e.summary, e.start_date, e.end_date,
              c.slug AS category_slug, c.name AS category_name,
              h.slug AS habitat_slug, h.name AS habitat_name, h.accent_colour
         FROM events e
         JOIN event_categories c ON c.id = e.category_id
         LEFT JOIN habitats h ON h.id = e.habitat_id
         ${where}
        ORDER BY e.start_date ASC`,
      params,
    );
    const today = new Date().toISOString().slice(0, 10);
    const decorated = events.map((ev) => ({
      ...ev,
      has_occurred: ev.end_date < today,
      is_ongoing: ev.start_date <= today && ev.end_date >= today,
    }));
    res.json({ year, category: categorySlug, events: decorated });
  } catch (err) {
    next(err);
  }
});

// AJAX: contact form submission
router.post('/contact', async (req, res, next) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const subject = (req.body.subject || '').trim();
  const message = (req.body.message || '').trim();

  const errors = {};
  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!subject) errors.subject = 'Please choose a subject.';
  if (message.length < 10) errors.message = 'Please write a message of at least 10 characters.';
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  try {
    await run(
      `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name, email, subject, message],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
