document.addEventListener('DOMContentLoaded', function () {
  // Only run scroll behavior if there are scroll-sections (index page only)
  const sections = document.querySelectorAll('.scroll-section');
  if (sections.length === 0) return; // Exit if not on index page
  
  // Detect if mobile (disable horizontal scroll animation on mobile)
  const isMobile = window.innerWidth <= 1000;
  if (isMobile) return; // Exit on mobile - use natural vertical scrolling
  
  // Scroll-based horizontal movement that snaps section-by-section
  const maxIndex = sections.length - 1;
  let progress = 0; // 0 (first section) -> maxIndex (last section)
  let displayProgress = 0; // eased display value

  // fixed animation parameters
  let animating = false;
  let animStart = 0;
  const animDuration = 1050;
  let animFrom = 0;
  let animTo = 0;

  const render = (p) => {
    const offsetVw = p * 100;
    const thirdSection = document.getElementById('problems-we-solve');

    sections.forEach((section, index) => {
      if (index === 0) {
        section.style.transform = `translateX(calc(-${offsetVw}vw))`;
        return;
      }

      if (index === 1) {
        const secondOffset = p <= 1 ? offsetVw : 100;
        section.style.transform = `translateX(calc(-${secondOffset}vw))`;
        return;
      }

      const thirdProgress = Math.max(0, Math.min(1, p - 1));
      const thirdY = (1 - thirdProgress) * 100;
      section.style.transform = `translateX(-200vw) translateY(${thirdY}vh)`;
    });

    if (thirdSection) {
      thirdSection.style.zIndex = p >= 1.93 ? '3' : '0';
    }
    
    // Trigger entrance animation for content section when scrolled into view
    const contentSection = document.getElementById('features');
    if (contentSection) {
      if (p >= 0.5 && p < 1.7) {
        contentSection.classList.add('in-view');
      } else {
        contentSection.classList.remove('in-view');
      }

      const isReturningToSecond = animating && animTo === 1 && p > 1;
      const leavingThreshold = isReturningToSecond ? 1.55 : 1.1;

      if (p >= leavingThreshold) {
        contentSection.classList.add('leaving-to-third');
      } else {
        contentSection.classList.remove('leaving-to-third');
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
    animTo = Math.max(0, Math.min(maxIndex, target));
    animStart = performance.now();
    animating = true;
    requestAnimationFrame(animate);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    const currentIndex = Math.round(progress);
    const target = currentIndex + dir;
    // if already animating toward same target, ignore
    if (animating && animTo === Math.max(0, Math.min(maxIndex, target))) return;
    startAnimationTo(target);
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
});
