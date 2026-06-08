import { Router } from 'express';
import { run } from '../db/database.mjs';

const router = Router();

const SUBJECT_OPTIONS = [
  'General enquiry',
  'Accessibility',
  'School visits',
  'Press and media',
  'Conservation partnerships',
];

router.get('/', (req, res) => {
  res.render('contact', {
    title: 'Contact, Lumen Hollow',
    subjects: SUBJECT_OPTIONS,
    values: { name: '', email: '', subject: '', message: '' },
    errors: {},
    submitted: false,
  });
});

function validate({ name, email, subject, message }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Please tell us your name.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!subject || !SUBJECT_OPTIONS.includes(subject)) errors.subject = 'Please choose a subject.';
  if (!message || message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
  return errors;
}

router.post('/', async (req, res, next) => {
  const values = {
    name: (req.body.name || '').trim(),
    email: (req.body.email || '').trim(),
    subject: (req.body.subject || '').trim(),
    message: (req.body.message || '').trim(),
  };
  const errors = validate(values);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('contact', {
      title: 'Contact, Lumen Hollow',
      subjects: SUBJECT_OPTIONS,
      values,
      errors,
      submitted: false,
    });
  }
  try {
    await run(
      `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [values.name, values.email, values.subject, values.message],
    );
    res.render('contact', {
      title: 'Thank you, Lumen Hollow',
      subjects: SUBJECT_OPTIONS,
      values: { name: '', email: '', subject: '', message: '' },
      errors: {},
      submitted: true,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
