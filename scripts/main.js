document.addEventListener('DOMContentLoaded', function () {
  // Only run scroll behavior if there are scroll-sections (index page only)
  const sections = document.querySelectorAll('.scroll-section');
  if (sections.length === 0) return; // Exit if not on index page
  
  // Scroll-based horizontal movement that only snaps at ends (start/end) with fixed animation speed
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
    
    // Trigger entrance animation for content section when scrolled into view
    const contentSection = document.getElementById('features');
    if (contentSection) {
      // Trigger animation as section starts entering (p >= 0.3)
      if (p >= 0.3) {
        contentSection.classList.add('in-view');
        console.log('Added in-view class, p =', p);
      } else {
        contentSection.classList.remove('in-view');
      }
    }
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
