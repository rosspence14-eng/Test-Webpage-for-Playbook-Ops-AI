document.addEventListener('DOMContentLoaded', function () {
  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle — toggle `expanded` class on the nav container so CSS can show/hide items
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('expanded', !expanded);
    });
  }

  // Scroll-based horizontal movement that only snaps at ends (start/end) with fixed animation speed
  const sections = document.querySelectorAll('.scroll-section');
  const totalSections = sections.length;
  let progress = 0; // 0.0 (start) -> 1.0 (end)
  let displayProgress = 0; // eased display value

  // fixed animation parameters
  let animating = false;
  let animStart = 0;
  const animDuration = 600; // ms for full travel from start->end
  let animFrom = 0;
  let animTo = 0;

  const render = (p) => {
    const pct = p * 100; // 0..100
    sections.forEach((section, index) => {
      if (index === 0) {
        section.style.transform = `translateX(calc(-${pct}vw))`;
      } else {
        section.style.transform = `translateX(calc(${100 - pct}vw))`;
      }
    });
  };

  const updateBackground = (p) => {
    const gradientPercent = Math.max(0, Math.min(p * 100, 100));
    document.body.style.background = `linear-gradient(90deg, #0D080A 0%, #0D080A ${Math.max(0, 100 - gradientPercent)}%, #7d8d99 100%)`;
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (now) => {
    if (animating) {
      const t = Math.min(1, (now - animStart) / animDuration);
      const eased = easeOutCubic(t);
      progress = animFrom + (animTo - animFrom) * eased;
      if (t >= 1) animating = false;
    }

    // ease displayProgress toward progress for subtle smoothing
    displayProgress += (progress - displayProgress) * 0.12;
    render(displayProgress);
    updateBackground(displayProgress);

    if (animating || Math.abs(displayProgress - progress) > 0.0005) {
      requestAnimationFrame(animate);
    }
  };

  const startAnimationTo = (target) => {
    animFrom = progress;
    animTo = Math.max(0, Math.min(1, target));
    animStart = performance.now();
    animating = true;
    requestAnimationFrame(animate);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const dir = Math.sign(e.deltaY || 1);
    const target = dir > 0 ? 1 : 0;
    // if already animating toward same target, ignore
    if (animating && ((animTo === target))) return;
    startAnimationTo(target);
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
});

