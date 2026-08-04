const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll('.project-visual').forEach((visual) => {
  const video = visual.querySelector('video');
  const button = visual.querySelector('.play-button');
  const icon = button.querySelector('.play-icon');
  const label = button.querySelector('.play-label');

  const resetButton = () => {
    visual.classList.remove('is-playing');
    icon.textContent = '▶';
    label.textContent = video.ended ? 'Replay project' : 'Play project';
  };

  button.addEventListener('click', () => {
    document.querySelectorAll('video').forEach((other) => {
      if (other !== video) other.pause();
    });
    video.play();
    visual.classList.add('is-playing');
  });

  video.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      visual.classList.add('is-playing');
    } else {
      video.pause();
      resetButton();
      icon.textContent = '▶';
      label.textContent = 'Resume project';
    }
  });
  video.addEventListener('pause', () => { if (!video.ended) resetButton(); });
  video.addEventListener('ended', resetButton);
});

document.getElementById('year').textContent = new Date().getFullYear();

if (!reducedMotion) {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let pointer = { x: -999, y: -999 };
  let particles = [];

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(70, Math.floor(width / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.2 + .35
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, index) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      const pd = Math.hypot(p.x - pointer.x, p.y - pointer.y);
      if (pd < 155) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pointer.x, pointer.y);
        ctx.strokeStyle = `rgba(35,168,255,${(1 - pd / 155) * .55})`;
        ctx.lineWidth = .7; ctx.stroke();
      }
      for (let j = index + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 105) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(35,168,255,${(1 - d / 105) * .12})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = pd < 155 ? 'rgba(131,210,255,.85)' : 'rgba(141,152,165,.38)';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer = { x: -999, y: -999 }; });
  resize();
  draw();
}
