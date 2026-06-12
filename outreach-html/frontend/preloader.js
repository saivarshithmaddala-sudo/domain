document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const progressFill = document.querySelector('.preloader-progress-fill');
  const preloaderStatus = document.querySelector('.preloader-status');
  
  const statusMessages = [
    'Initializing pipeline engine...',
    'Loading telemetry nodes...',
    'Establishing secure sockets...',
    'Caching lookup matrices...',
    'Ready.'
  ];
  
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < statusMessages.length - 1) {
      currentStep++;
      if (preloaderStatus) {
        preloaderStatus.textContent = statusMessages[currentStep];
      }
    }
  }, 550);

  // Function to fade out the preloader
  const fadeOutPreloader = () => {
    if (progressFill) {
      progressFill.style.animation = 'none';
      progressFill.style.width = '100%';
    }
    if (preloaderStatus) {
      preloaderStatus.textContent = 'Ready.';
    }

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('fade-out');
        clearInterval(interval);
      }
    }, 450); // Small delay for visual satisfaction
  };

  // Check if page is already loaded (fallback)
  if (document.readyState === 'complete') {
    fadeOutPreloader();
  } else {
    window.addEventListener('load', fadeOutPreloader);
  }
  
  // Hard fallback to prevent stuck loader
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
      clearInterval(interval);
    }
  }, 3500);
});
