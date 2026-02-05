(() => {
  const canvas = document.getElementById('linefield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const state = {
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    time: 0,
    scroll: 0,
    targetScroll: 0,
    velocity: 0,
  };

  const lines = [];
  const lineCount = 26;

  const resize = () => {
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    canvas.style.width = `${state.w}px`;
    canvas.style.height = `${state.h}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    seedLines();
  };

  const seedLines = () => {
    lines.length = 0;
    const spacing = state.h / (lineCount + 1);
    for (let i = 0; i < lineCount; i += 1) {
      lines.push({
        y: spacing * (i + 1),
        amp: 12 + Math.random() * 28,
        freq: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.4 + Math.random() * 0.9,
      });
    }
  };

  const updateScroll = (delta) => {
    state.velocity += delta;
  };

  const drawLine = (line, t, intensity) => {
    const step = 24;
    const centerShift = Math.sin(t * 0.0006 + line.phase) * 40 * intensity;
    ctx.beginPath();
    for (let x = -step; x <= state.w + step; x += step) {
      const wave = Math.sin((x / state.w) * Math.PI * 2 * line.freq + t * 0.0010 + line.phase);
      const noise = Math.cos((x / state.w) * Math.PI * 4 * line.wobble + t * 0.0006 + line.phase);
      const offset = (wave + noise) * line.amp * (0.25 + intensity * 1.0);
      const y = line.y + offset + centerShift;
      if (x === -step) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const tick = (time) => {
    state.time = time;
    state.velocity *= 0.86;
    state.targetScroll += state.velocity * 0.0008;
    state.targetScroll *= 0.985;
    state.scroll += (state.targetScroll - state.scroll) * 0.08;

    ctx.clearRect(0, 0, state.w, state.h);
    ctx.fillStyle = 'rgba(243, 241, 236, 0.95)';
    ctx.fillRect(0, 0, state.w, state.h);

    const intensity = 0.28 + Math.min(Math.abs(state.scroll), 1.0) * 0.65;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(23, 22, 20, 0.35)';

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      ctx.globalAlpha = 0.3 + (i / lines.length) * 0.6;
      drawLine(line, time + i * 120, intensity);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(tick);
  };

  const onWheel = (event) => {
    event.preventDefault();
    updateScroll(event.deltaY);
  };

  let touchStartY = 0;
  const onTouchStart = (event) => {
    if (!event.touches || event.touches.length === 0) return;
    touchStartY = event.touches[0].clientY;
  };
  const onTouchMove = (event) => {
    if (!event.touches || event.touches.length === 0) return;
    const currentY = event.touches[0].clientY;
    const delta = touchStartY - currentY;
    touchStartY = currentY;
    updateScroll(delta * 2);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  resize();
  requestAnimationFrame(tick);
})();
