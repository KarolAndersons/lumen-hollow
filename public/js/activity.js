/* Lumen Hollow, "Spot the Nocturnal Creature" activity.
   The canvas sits over a hidden creature label and acts as a scratch-off layer.
   As the player drags or taps, pixels are cleared and the creature is revealed.
   Once ~30% of the canvas has been cleared, three guess options appear.
*/
(() => {
  'use strict';

  const root = document.querySelector('[data-activity]');
  if (!root) return;

  const raw = root.getAttribute('data-creatures') || '[]';
  let creatures = [];
  try { creatures = JSON.parse(raw); } catch (err) { creatures = []; }
  if (!creatures.length) return;

  const canvas = root.querySelector('[data-activity-canvas]');
  const ctx = canvas.getContext('2d');
  const nameEl = root.querySelector('[data-activity-name]');
  const habitatEl = root.querySelector('[data-activity-habitat]');
  const guessEl = root.querySelector('[data-activity-guess]');
  const optionsEl = root.querySelector('[data-activity-options]');
  const feedbackEl = root.querySelector('[data-activity-feedback]');
  const hintEl = root.querySelector('[data-activity-hint]');
  const roundEl = root.querySelector('[data-activity-round]');
  const scoreEl = root.querySelector('[data-activity-score]');
  const resetBtn = root.querySelector('[data-activity-reset]');

  const SCRATCH_RADIUS = 38;
  const REVEAL_THRESHOLD = 0.30; // 30% revealed before guessing
  const MAX_ROUNDS = 5;

  let state = {
    round: 1,
    score: 0,
    answer: null,
    options: [],
    revealedPixels: 0,
    totalPixels: 0,
    scratchEnabled: false,
    optionsShown: false,
    lastPoint: null,
  };

  function pickRandom(arr, n) {
    const copy = [...arr];
    const out = [];
    while (out.length < n && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  function buildOptions(answer) {
    const distractors = creatures
      .filter((c) => c.species_common !== answer.species_common)
      .filter((c) => c.species_common);
    const picks = pickRandom(distractors, 2);
    const all = [answer, ...picks];
    return all.sort(() => Math.random() - 0.5);
  }

  function paintFog() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 20,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.2,
    );
    gradient.addColorStop(0, '#0c1228');
    gradient.addColorStop(1, '#050810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Speckled stars
    ctx.fillStyle = 'rgba(203, 214, 230, 0.4)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    state.totalPixels = canvas.width * canvas.height;
    state.revealedPixels = 0;
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    if (state.lastPoint) {
      ctx.beginPath();
      ctx.lineWidth = SCRATCH_RADIUS * 2;
      ctx.lineCap = 'round';
      ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    state.lastPoint = { x, y };
  }

  function calculateRevealRatio() {
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const step = 16; // sample every 4th pixel (4 bytes each)
    for (let i = 3; i < sample.length; i += step) {
      if (sample[i] === 0) transparent++;
    }
    const samples = sample.length / step;
    return transparent / samples;
  }

  function maybeShowOptions() {
    if (state.optionsShown) return;
    const ratio = calculateRevealRatio();
    if (ratio >= REVEAL_THRESHOLD) {
      state.optionsShown = true;
      renderOptions();
      if (hintEl) hintEl.textContent = 'Now choose the right animal below.';
    }
  }

  function renderOptions() {
    optionsEl.innerHTML = '';
    state.options.forEach((opt) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'activity__option';
      btn.textContent = opt.species_common;
      btn.addEventListener('click', () => handleGuess(opt, btn));
      li.appendChild(btn);
      optionsEl.appendChild(li);
    });
    guessEl.hidden = false;
  }

  function handleGuess(option, button) {
    if (!state.answer) return;
    state.scratchEnabled = false;
    const buttons = optionsEl.querySelectorAll('button');
    buttons.forEach((b) => b.disabled = true);
    const isCorrect = option.species_common === state.answer.species_common;
    if (isCorrect) {
      button.classList.add('is-correct');
      state.score += 1;
      feedbackEl.textContent = `Yes, that’s a ${state.answer.species_common}.`;
    } else {
      button.classList.add('is-wrong');
      buttons.forEach((b) => {
        if (b.textContent === state.answer.species_common) b.classList.add('is-correct');
      });
      feedbackEl.textContent = `Not quite, that’s a ${state.answer.species_common}.`;
    }
    scoreEl.textContent = String(state.score);
    // Fully reveal the canvas
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(nextRound, 1800);
  }

  function nextRound() {
    if (state.round >= MAX_ROUNDS) {
      feedbackEl.textContent = `Round complete! Final score: ${state.score} out of ${MAX_ROUNDS}. Press “Start again” to play another round.`;
      hintEl.textContent = '';
      guessEl.hidden = true;
      return;
    }
    state.round += 1;
    roundEl.textContent = String(state.round);
    startRound();
  }

  function startRound() {
    state.answer = pickRandom(creatures.filter((c) => c.species_common), 1)[0];
    state.options = buildOptions(state.answer);
    state.optionsShown = false;
    state.lastPoint = null;
    state.scratchEnabled = true;
    guessEl.hidden = true;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    if (hintEl) hintEl.textContent = 'Move your mouse or finger over the dark panel to reveal the animal.';
    nameEl.textContent = state.answer.species_common;
    habitatEl.textContent = state.answer.habitat_name;
    root.style.setProperty('--accent', state.answer.accent_colour || '#f3d27a');
    paintFog();
  }

  function fullReset() {
    state.round = 1;
    state.score = 0;
    roundEl.textContent = '1';
    scoreEl.textContent = '0';
    startRound();
  }

  function pointerPosition(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  let pointerActive = false;
  canvas.addEventListener('mousedown', (e) => {
    if (!state.scratchEnabled) return;
    pointerActive = true;
    const p = pointerPosition(e);
    scratch(p.x, p.y);
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!state.scratchEnabled || !pointerActive) return;
    const p = pointerPosition(e);
    scratch(p.x, p.y);
    maybeShowOptions();
  });
  ['mouseup', 'mouseleave'].forEach((ev) => canvas.addEventListener(ev, () => {
    pointerActive = false;
    state.lastPoint = null;
    if (state.scratchEnabled) maybeShowOptions();
  }));

  canvas.addEventListener('touchstart', (e) => {
    if (!state.scratchEnabled) return;
    e.preventDefault();
    pointerActive = true;
    const p = pointerPosition(e);
    scratch(p.x, p.y);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    if (!state.scratchEnabled || !pointerActive) return;
    e.preventDefault();
    const p = pointerPosition(e);
    scratch(p.x, p.y);
    maybeShowOptions();
  }, { passive: false });
  canvas.addEventListener('touchend', () => {
    pointerActive = false;
    state.lastPoint = null;
    if (state.scratchEnabled) maybeShowOptions();
  });

  resetBtn.addEventListener('click', fullReset);
  window.addEventListener('resize', () => {
    if (state.scratchEnabled) paintFog();
  });

  fullReset();
})();
