import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import homeRouter from './routes/home.mjs';
import habitatsRouter from './routes/habitats.mjs';
import faqRouter from './routes/faq.mjs';
import contactRouter from './routes/contact.mjs';
import eventsRouter from './routes/events.mjs';
import activityRouter from './routes/activity.mjs';
import searchRouter from './routes/search.mjs';
import apiRouter from './routes/api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.parkName = 'Lumen Hollow';
  res.locals.parkTagline = 'Nightfall Wildlife Reserve';
  res.locals.openingHours = 'Open every day, 9.00 am – 6.00 pm';
  next();
});

app.use('/', homeRouter);
app.use('/habitats', habitatsRouter);
app.use('/faq', faqRouter);
app.use('/contact', contactRouter);
app.use('/events', eventsRouter);
app.use('/activity', activityRouter);
app.use('/search', searchRouter);
app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Lumen Hollow running at http://localhost:${PORT}`);
});
