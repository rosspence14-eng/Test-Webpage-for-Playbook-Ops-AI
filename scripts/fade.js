// fade.js — set fade to 100% on load (no scroll listening)
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Just set all fade targets to full visibility
    const targets = Array.from(document.querySelectorAll('.fade-target'));
    targets.forEach((el) => {
      el.style.setProperty('--mask-size', '100%');
    });
  });

})();
