(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const fixedLineCta = document.querySelector('.fixed-line-cta');
  const secondSection = document.querySelector('.photo-section');
  const scrollTitles = document.querySelectorAll('[data-scroll-title]');
  let framePending = false;

  document.querySelectorAll('[data-image-src]').forEach((slot) => {
    if (!slot.dataset.imageSrc) return;
    const image = document.createElement('img');
    image.src = slot.dataset.imageSrc;
    image.alt = slot.dataset.imageAlt || '';
    image.loading = 'lazy';
    slot.querySelector('.image-slot__media')?.after(image);
    slot.classList.add('has-image');
  });

  function updateScrollEffects() {
    framePending = false;
    if (fixedLineCta && secondSection) fixedLineCta.classList.toggle('is-visible', secondSection.getBoundingClientRect().top <= 2);
    if (!reducedMotion && hero) {
      const heroTop = hero.offsetTop;
      const scrollRange = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - heroTop) / scrollRange));
      hero.style.setProperty('--hero-scale', String(1.1 - progress * .1));
      hero.style.setProperty('--hero-content-opacity', String(1 - Math.min(.92, progress * 1.2)));
    }
    if (!reducedMotion) {
      scrollTitles.forEach((title) => {
        const offset = Math.max(-28, Math.min(28, (window.innerHeight * .5 - title.getBoundingClientRect().top) * .035));
        title.style.setProperty('--title-shift', `${offset}px`);
      });
    }
  }

  function requestScrollUpdate() {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateScrollEffects);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

  document.querySelectorAll('.reveal, .image-slot').forEach((element) => observer.observe(element));
  if (!reducedMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!entry.target.ended || entry.target.loop)) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { threshold: .15 });
    document.querySelectorAll('main video[autoplay]').forEach((video) => {
      video.muted = true;
      videoObserver.observe(video);
    });
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScrollEffects();
})();
