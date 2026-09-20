(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const menu = document.querySelector('.menu');
  const menuPanel = document.querySelector('.site-menu');
  const closeMenu = document.querySelector('.site-menu__close');
  const menuLinks = document.querySelectorAll('.site-menu__links a');
  const scrollTitles = document.querySelectorAll('[data-scroll-title]');
  let framePending = false;
  let storedScrollY = 0;

  document.querySelectorAll('[data-image-src]').forEach((slot) => {
    if (!slot.dataset.imageSrc) return;
    const image = document.createElement('img');
    image.src = slot.dataset.imageSrc;
    image.alt = slot.dataset.imageAlt || '';
    image.loading = 'lazy';
    slot.querySelector('.image-slot__media')?.after(image);
  });

  function updateScrollEffects() {
    framePending = false;
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

  function setMenu(open) {
    if (!menu || !menuPanel) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menuPanel.classList.toggle('is-open', open);
    menuPanel.setAttribute('aria-hidden', String(!open));
    if (open) {
      storedScrollY = window.scrollY;
      document.body.classList.add('menu-open');
      closeMenu?.focus();
    } else {
      document.body.classList.remove('menu-open');
      window.scrollTo(0, storedScrollY);
      menu.focus();
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
  menu?.addEventListener('click', () => setMenu(true));
  closeMenu?.addEventListener('click', () => setMenu(false));
  menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuPanel?.classList.contains('is-open')) setMenu(false); });
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScrollEffects();
})();
