/* Lumen Hollow, site-wide client behaviour
   - Mobile nav toggle
   - AJAX habitat preview on the park map
   - AJAX typeahead search (header)
   - AJAX live search results (search page)
   - AJAX contact form submission with client-side validation
   - AJAX events listing with year + category filters
*/

(() => {
  'use strict';

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.site-nav__toggle');
  const navList = document.getElementById('site-nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('is-open', !expanded);
    });
  }

  // ---------- Park map: AJAX habitat preview ----------
  const map = document.querySelector('[data-park-map]');
  if (map) {
    const panel = map.querySelector('[data-park-map-panel]');
    const body = map.querySelector('[data-park-map-body]');
    const closeBtn = map.querySelector('[data-park-map-close]');
    const markers = map.querySelectorAll('.park-map__marker');
    const cache = new Map();

    const renderHabitat = (data) => {
      const { habitat, exhibits } = data;
      const exhibitsHtml = exhibits.slice(0, 4).map((e) => (
        `<li>${escapeHtml(e.name)}${e.species_common ? `, <span style="color:var(--bone-muted)">${escapeHtml(e.species_common)}</span>` : ''}</li>`
      )).join('');
      const imageHtml = habitat.image_filename
        ? `<img class="park-map__panel-image" src="/images/habitats/${encodeURIComponent(habitat.image_filename)}" alt="${escapeAttr(habitat.image_alt || habitat.name)}">`
        : '';
      body.innerHTML = `
        ${imageHtml}
        <h3>${escapeHtml(habitat.name)}</h3>
        <p class="park-map__panel-tagline" style="color:${escapeHtml(habitat.accent_colour)}">${escapeHtml(habitat.tagline)}</p>
        <p class="park-map__panel-description">${escapeHtml(habitat.description)}</p>
        <ul class="park-map__panel-exhibits">${exhibitsHtml}</ul>
        <a class="park-map__panel-cta" href="/habitats/${encodeURIComponent(habitat.slug)}">Open habitat page &rarr;</a>
      `;
    };

    const loadHabitat = async (slug, markerEl) => {
      markers.forEach((m) => m.classList.remove('is-active'));
      if (markerEl) markerEl.classList.add('is-active');
      panel.hidden = false;
      if (cache.has(slug)) {
        renderHabitat(cache.get(slug));
        return;
      }
      body.innerHTML = '<p class="park-map__loading">Loading…</p>';
      try {
        const res = await fetch(`/api/habitats/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Habitat fetch failed');
        const data = await res.json();
        cache.set(slug, data);
        renderHabitat(data);
      } catch (err) {
        body.innerHTML = '<p>Sorry, we could not load this habitat. Please try again.</p>';
      }
    };

    markers.forEach((marker) => {
      marker.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = marker.dataset.habitatSlug;
        if (slug) loadHabitat(slug, marker);
      });
      marker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const slug = marker.dataset.habitatSlug;
          if (slug) loadHabitat(slug, marker);
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.hidden = true;
        markers.forEach((m) => m.classList.remove('is-active'));
      });
    }
  }

  // ---------- Header search typeahead ----------
  const headerSearch = document.querySelector('.site-search');
  if (headerSearch) {
    const input = headerSearch.querySelector('input[type="search"]');
    const dropdown = headerSearch.querySelector('.site-search__suggestions');
    let timer = null;
    let lastQuery = '';

    const closeDropdown = () => {
      dropdown.classList.remove('is-open');
      dropdown.innerHTML = '';
    };

    const renderSuggestions = (data) => {
      if (!data.results.length) {
        dropdown.innerHTML = '<p class="site-search__no-results">No matches yet, try a different word.</p>';
        dropdown.classList.add('is-open');
        return;
      }
      const items = data.results.map((r) => {
        const href = hrefFor(r);
        return `<a href="${href}">
          <span class="site-search__suggestion-kind">${r.kind}</span>
          <span>${escapeHtml(r.name)}</span>
        </a>`;
      }).join('');
      dropdown.innerHTML = items;
      dropdown.classList.add('is-open');
    };

    input.addEventListener('input', () => {
      const q = input.value.trim();
      lastQuery = q;
      clearTimeout(timer);
      if (q.length < 2) { closeDropdown(); return; }
      timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          const data = await res.json();
          if (data.query !== lastQuery) return; // stale response
          renderSuggestions(data);
        } catch (err) {
          // Silent fail, typeahead is progressive enhancement
        }
      }, 180);
    });

    input.addEventListener('blur', () => setTimeout(closeDropdown, 160));
    input.addEventListener('focus', () => {
      if (dropdown.innerHTML) dropdown.classList.add('is-open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });
  }

  // ---------- Search page live results ----------
  const searchPageInput = document.querySelector('[data-search-page-input]');
  const searchPageResults = document.querySelector('[data-search-page-results]');
  if (searchPageInput && searchPageResults) {
    let timer = null;
    let lastQuery = '';

    const renderResults = (data) => {
      if (!data.query) { searchPageResults.innerHTML = '<p>Start typing above to search the reserve.</p>'; return; }
      if (!data.results.length) {
        searchPageResults.innerHTML = `<p>No results for &ldquo;${escapeHtml(data.query)}&rdquo;.</p>`;
        return;
      }
      const groups = { habitat: [], exhibit: [], event: [] };
      data.results.forEach((r) => { if (groups[r.kind]) groups[r.kind].push(r); });
      const headings = { habitat: 'Habitats', exhibit: 'Exhibits & experiences', event: 'Events' };
      let html = '';
      for (const kind of ['habitat', 'exhibit', 'event']) {
        if (!groups[kind].length) continue;
        html += `<section class="search-page__group">
          <h2 class="search-page__group-heading">${headings[kind]}</h2>`;
        for (const r of groups[kind]) {
          html += `<a class="search-page__result" href="${hrefFor(r)}">
            <span class="search-page__result-title">${escapeHtml(r.name)}</span>
            <p class="search-page__result-snippet">${escapeHtml(r.snippet || '')}</p>
          </a>`;
        }
        html += `</section>`;
      }
      searchPageResults.innerHTML = html;
    };

    const fetchAndRender = async (q) => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.query !== lastQuery) return;
        renderResults(data);
      } catch (err) {
        searchPageResults.innerHTML = '<p>Sorry, search is not available right now.</p>';
      }
    };

    searchPageInput.addEventListener('input', () => {
      const q = searchPageInput.value.trim();
      lastQuery = q;
      clearTimeout(timer);
      if (q.length < 2) {
        renderResults({ query: q, results: [] });
        return;
      }
      timer = setTimeout(() => fetchAndRender(q), 200);
    });

    if (searchPageInput.value.trim().length >= 2) {
      lastQuery = searchPageInput.value.trim();
      fetchAndRender(lastQuery);
    }
  }

  // ---------- Contact form AJAX with progressive enhancement ----------
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = contactForm.querySelector('.form-status');
    const fieldNames = ['name', 'email', 'subject', 'message'];

    const setError = (field, msg) => {
      const errorEl = contactForm.querySelector(`#contact-${field}-error`);
      const inputEl = contactForm.querySelector(`#contact-${field}`);
      if (errorEl) errorEl.textContent = msg || '';
      if (inputEl) inputEl.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    const clearErrors = () => fieldNames.forEach((f) => setError(f, ''));

    const validate = (values) => {
      const errors = {};
      if (values.name.length < 2) errors.name = 'Please tell us your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid email address.';
      if (!values.subject) errors.subject = 'Please choose a subject.';
      if (values.message.length < 10) errors.message = 'Please write a message of at least 10 characters.';
      return errors;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();
      const formData = new FormData(contactForm);
      const values = {
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        subject: (formData.get('subject') || '').toString().trim(),
        message: (formData.get('message') || '').toString().trim(),
      };
      const errors = validate(values);
      if (Object.keys(errors).length) {
        Object.entries(errors).forEach(([f, m]) => setError(f, m));
        status.textContent = 'Please fix the highlighted fields.';
        return;
      }
      status.textContent = 'Sending…';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.errors) Object.entries(data.errors).forEach(([f, m]) => setError(f, m));
          status.textContent = 'Please correct the errors above and try again.';
          return;
        }
        contactForm.reset();
        status.textContent = 'Thank you, your message has been received.';
      } catch (err) {
        status.textContent = 'Sorry, your message could not be sent. Please try again.';
      }
    });
  }

  // ---------- Events: AJAX list with year + category filters ----------
  const eventsRoot = document.querySelector('[data-events]');
  if (eventsRoot) {
    const yearSelect = eventsRoot.querySelector('[data-event-year]');
    const categoryGroup = eventsRoot.querySelector('[data-event-categories]');
    const statusEl = eventsRoot.querySelector('[data-events-status]');
    const listEl = eventsRoot.querySelector('[data-events-list]');

    const formatDateRange = (start, end) => {
      const opts = { day: 'numeric', month: 'long', year: 'numeric' };
      const fmt = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', opts);
      return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
    };

    const render = (events) => {
      if (!events.length) {
        listEl.innerHTML = '<li class="events__empty">No events match these filters.</li>';
        return;
      }
      listEl.innerHTML = events.map((ev) => {
        const badge = ev.is_ongoing
          ? '<span class="event-card__badge event-card__badge--ongoing">Happening now</span>'
          : ev.has_occurred
          ? '<span class="event-card__badge event-card__badge--past">Past event</span>'
          : '<span class="event-card__badge event-card__badge--upcoming">Upcoming</span>';
        const accent = ev.accent_colour ? `style="--accent: ${escapeAttr(ev.accent_colour)}"` : '';
        return `<li class="event-card" ${accent}>
          <a href="/events/${encodeURIComponent(ev.slug)}">
            <div class="event-card__meta">
              <span class="event-card__category">${escapeHtml(ev.category_name)}</span>
              <span class="event-card__date">${escapeHtml(formatDateRange(ev.start_date, ev.end_date))}</span>
            </div>
            <h3 class="event-card__title">${escapeHtml(ev.title)}</h3>
            <p class="event-card__summary">${escapeHtml(ev.summary)}</p>
            ${badge}
          </a>
        </li>`;
      }).join('');
    };

    const load = async () => {
      const year = yearSelect ? yearSelect.value : '';
      const checked = categoryGroup ? categoryGroup.querySelector('input[name="category"]:checked') : null;
      const category = checked ? checked.value : 'all';
      statusEl.textContent = 'Loading events…';
      listEl.innerHTML = '';
      try {
        const params = new URLSearchParams({ year, category });
        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        render(data.events);
        statusEl.textContent = `${data.events.length} event${data.events.length === 1 ? '' : 's'} found.`;
      } catch (err) {
        statusEl.textContent = 'Sorry, events could not be loaded.';
      }
    };

    if (yearSelect) yearSelect.addEventListener('change', load);
    if (categoryGroup) categoryGroup.addEventListener('change', load);
    load();
  }

  // ---------- helpers ----------
  function hrefFor(r) {
    if (r.kind === 'habitat') return `/habitats/${encodeURIComponent(r.slug)}`;
    if (r.kind === 'exhibit') return `/habitats/${encodeURIComponent(r.habitat_slug)}#${encodeURIComponent(r.slug)}`;
    if (r.kind === 'event') return `/events/${encodeURIComponent(r.slug)}`;
    return '#';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
