document.addEventListener('DOMContentLoaded', function () {
  // Only run scroll behavior if there are scroll-sections (index page only)
  const sections = document.querySelectorAll('.scroll-section');
  if (sections.length === 0) return; // Exit if not on index page
  
  // Detect if mobile (disable horizontal scroll animation on mobile)
  const isMobile = window.innerWidth <= 1000;
  if (isMobile) return; // Exit on mobile - use natural vertical scrolling
  
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

  // Update scroll cue visibility based on progress
  const updateScrollCue = () => {
    const cue = document.getElementById('scroll-cue');
    if (cue) {
      if (progress > 0.1) {
        cue.style.opacity = '0';
        cue.style.pointerEvents = 'none';
      } else {
        cue.style.opacity = '1';
        cue.style.pointerEvents = 'auto';
      }
    }
  };

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
    updateScrollCue();

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

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);
    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      const dir = Math.sign(deltaX);
      const target = dir > 0 ? 0 : 1; // swipe right = go back, swipe left = go forward
      if (animating && (animTo === target)) return;
      startAnimationTo(target);
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});
