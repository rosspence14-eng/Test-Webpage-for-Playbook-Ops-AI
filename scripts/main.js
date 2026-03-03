document.addEventListener('DOMContentLoaded', function () {
  // Only run scroll behavior if there are scroll-sections (index page only)
  const sections = document.querySelectorAll('.scroll-section');
  if (sections.length === 0) return; // Exit if not on index page
  const scrollContainer = document.querySelector('main.scroll-container');
  if (scrollContainer) {
    scrollContainer.style.width = `${sections.length * 100}%`;
  }
  const featuresSection = document.getElementById('features');
  const featuresIndex = featuresSection ? Array.from(sections).indexOf(featuresSection) : -1;
  const proofSection = document.getElementById('proof-preview');
  const proofIndex = proofSection ? Array.from(sections).indexOf(proofSection) : -1;
  const sectionBackgrounds = [
    'var(--brand-dark)',
    'var(--brand-secondary-bg)',
    'var(--brand-third-bg)',
    'var(--brand-secondary-bg)',
    'var(--brand-third-bg)',
    'var(--brand-dark)'
  ];
  let activeSectionIndex = 0;

  const applySectionBackground = (index) => {
    const color = sectionBackgrounds[index % sectionBackgrounds.length] || 'var(--brand-dark)';
    document.documentElement.style.setProperty('--section-bg-color', color);
  };

  applySectionBackground(activeSectionIndex);
  
  // Scroll-based horizontal movement that snaps section-by-section
  const maxIndex = sections.length - 1;
  let progress = 0; // 0 (first section) -> maxIndex (last section)
  let displayProgress = 0; // eased display value

  // fixed animation parameters
  let animating = false;
  let animStart = 0;
  const animDuration = 1050;
  const sectionChangeCooldownMs = 300;
  const wheelTriggerThreshold = 110;
  const firstSectionThreshold = 25;
  const wheelSettleDelayMs = 140;
  let inputLockedUntil = 0;
  let wheelGestureActive = false;
  let wheelDeltaAccumulator = 0;
  let wheelSettleTimer = null;
  let animFrom = 0;
  let animTo = 0;
  let firstTransitionBaseSynced = false;

  const render = (p) => {
    const firstWipeProgress = p >= 0 && p <= 1 ? Math.max(0, Math.min(1, p)) : 0;
    const firstTransitionInMotion =
      animating &&
      Math.min(animFrom, animTo) >= 0 &&
      Math.max(animFrom, animTo) <= 1;

    if (
      firstTransitionInMotion &&
      Math.round(animFrom) === 0 &&
      Math.round(animTo) === 1 &&
      !firstTransitionBaseSynced &&
      firstWipeProgress >= 0.9
    ) {
      applySectionBackground(1);
      activeSectionIndex = 1;
      firstTransitionBaseSynced = true;
    }

    const firstWipeActive = firstTransitionInMotion && p >= 0 && p <= 1 ? 1 : 0;
    document.documentElement.style.setProperty('--first-wipe-progress', firstWipeProgress.toFixed(4));
    document.documentElement.style.setProperty('--first-wipe-active', String(firstWipeActive));

    const normalized = maxIndex > 0 ? p / maxIndex : 0;
    const secondBgProgress = normalized;
    const secondBgSolid = normalized;
    const thirdBgProgress = normalized;
    document.documentElement.style.setProperty('--second-bg-progress', secondBgProgress.toFixed(4));
    document.documentElement.style.setProperty('--second-bg-solid', secondBgSolid.toFixed(4));
    document.documentElement.style.setProperty('--third-bg-progress', thirdBgProgress.toFixed(4));

    if (scrollContainer) {
      scrollContainer.style.transform = `translateX(calc(-${p * 100}vw))`;
    }
    
    // Trigger entrance animation for the features section when it comes into view
    if (featuresSection && featuresIndex >= 0) {
      if (Math.abs(p - featuresIndex) < 0.7) {
        featuresSection.classList.add('in-view');
      } else {
        featuresSection.classList.remove('in-view');
      }

      const movingBetweenFeaturesAndProof =
        animating &&
        proofIndex >= 0 &&
        ((animFrom <= featuresIndex + 0.1 && animTo >= proofIndex - 0.1) ||
          (animFrom >= proofIndex - 0.1 && animTo <= featuresIndex + 0.1));

      const inFeaturesProofHandoff = proofIndex >= 0 && p >= featuresIndex - 0.02 && p <= proofIndex + 0.02;
      if (inFeaturesProofHandoff) {
        const featuresLockX = (p - featuresIndex) * 100;
        featuresSection.style.setProperty('--features-lock-x', `${featuresLockX}vw`);
      } else {
        featuresSection.style.setProperty('--features-lock-x', '0vw');
      }

      let shouldUseCornerLayout = false;
      if (movingBetweenFeaturesAndProof) {
        const movingForward = animTo > animFrom;
        if (movingForward) {
          shouldUseCornerLayout = p >= featuresIndex + 0.08 && p <= proofIndex - 0.12;
        } else {
          shouldUseCornerLayout = p >= featuresIndex + 0.18 && p <= proofIndex - 0.03;
        }
      }

      if (shouldUseCornerLayout) {
        featuresSection.classList.add('leaving-to-third');
      } else {
        featuresSection.classList.remove('leaving-to-third');
      }
    }

    // Trigger proof content rising in from the bottom as it enters
    if (proofSection && proofIndex >= 0) {
      const inFeaturesProofHandoff = featuresIndex >= 0 && p >= featuresIndex - 0.02 && p <= proofIndex + 0.02;
      if (inFeaturesProofHandoff) {
        const proofLockX = (p - proofIndex) * 100;
        proofSection.style.setProperty('--proof-lock-x', `${proofLockX}vw`);
      } else {
        proofSection.style.setProperty('--proof-lock-x', '0vw');
      }

      if (Math.abs(p - proofIndex) <= 0.08) {
        proofSection.classList.add('rise-in');
      } else {
        proofSection.classList.remove('rise-in');
      }
    }
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (now) => {
    if (animating) {
      const t = Math.min(1, (now - animStart) / animDuration);
      const eased = easeOutCubic(t);
      progress = animFrom + (animTo - animFrom) * eased;
      if (t >= 1) {
        animating = false;
        inputLockedUntil = now + sectionChangeCooldownMs;
        const settledIndex = Math.round(progress);
        if (settledIndex !== activeSectionIndex) {
          activeSectionIndex = settledIndex;
          applySectionBackground(activeSectionIndex);
        }
      }
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
    firstTransitionBaseSynced = false;
    const targetIndex = Math.round(animTo);
    const shouldDelayFirstTransitionColor = activeSectionIndex === 0 && targetIndex === 1;
    if (!shouldDelayFirstTransitionColor && targetIndex !== activeSectionIndex) {
      applySectionBackground(targetIndex);
      activeSectionIndex = targetIndex;
    }
    animStart = performance.now();
    animating = true;
    requestAnimationFrame(animate);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (animating || performance.now() < inputLockedUntil) return;

    if (wheelSettleTimer) {
      clearTimeout(wheelSettleTimer);
    }
    wheelSettleTimer = setTimeout(() => {
      wheelGestureActive = false;
      wheelDeltaAccumulator = 0;
    }, wheelSettleDelayMs);

    if (wheelGestureActive) return;

    wheelDeltaAccumulator += e.deltaY;
    const currentIndex = Math.round(progress);
    const triggerThreshold = currentIndex === 0 ? firstSectionThreshold : wheelTriggerThreshold;
    if (Math.abs(wheelDeltaAccumulator) < triggerThreshold) return;

    wheelGestureActive = true;
    const dir = wheelDeltaAccumulator > 0 ? 1 : -1;
    wheelDeltaAccumulator = 0;
    const target = Math.max(0, Math.min(maxIndex, currentIndex + dir));
    if (target === currentIndex) return;
    startAnimationTo(target);
  };

  // Touch support for mobile/tablet: swipe up/down to move sections
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    if (animating || performance.now() < inputLockedUntil) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaY) < 40 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

    const dir = deltaY < 0 ? 1 : -1;
    const currentIndex = Math.round(progress);
    const target = currentIndex + dir;
    startAnimationTo(target);
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});
