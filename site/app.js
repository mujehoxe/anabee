(() => {
  const nav = document.getElementById('site-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const navLinks = document.querySelectorAll('.nav-link[data-nav]');
  const sections = [...document.querySelectorAll('section[id]')];
  const walletBtn = document.getElementById('wallet-btn');
  const walletModal = document.getElementById('wallet-modal');
  const walletClose = document.getElementById('wallet-close');
  const toast = document.getElementById('toast');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('visible'), 3200);
  };

  const setNavActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('nav-active', active);
      link.setAttribute('aria-current', active ? 'page' : 'false');
    });
  };

  const onScroll = () => {
    nav.classList.toggle('nav-scrolled', window.scrollY > 24);
    const offset = nav.offsetHeight + 48;
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    }
    if (current) setNavActive(current);
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      mobileMenu?.classList.add('hidden');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overflow-hidden');
    });
  });

  mobileToggle?.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  });

  mobileClose?.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  });

  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  });

  const openWallet = () => {
    walletModal.classList.remove('hidden');
    walletModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  };

  const closeWallet = () => {
    walletModal.classList.add('hidden');
    walletModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  };

  walletBtn?.addEventListener('click', openWallet);
  document.querySelectorAll('[data-wallet]').forEach((btn) => btn.addEventListener('click', openWallet));
  walletClose?.addEventListener('click', closeWallet);
  walletModal?.addEventListener('click', (e) => {
    if (e.target === walletModal) closeWallet();
  });

  document.getElementById('download-whitepaper')?.addEventListener('click', () => {
    showToast('Whitepaper launching soon — join the waitlist to receive early access.');
  });

  document.getElementById('join-waitlist')?.addEventListener('click', () => {
    showToast('Thank you! You\'ve been added to the ANABEE waitlist.');
  });

  document.getElementById('view-cases')?.addEventListener('click', () => {
    showToast('12 active cases in Smart E-Court — full dashboard launches with mainnet.');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWallet();
      mobileMenu?.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('reveal-visible');
  });

  const animateValue = (el, end, prefix = '', suffix = '', decimals = 2) => {
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = end * eased;
      el.textContent = `${prefix}${val.toFixed(decimals)}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
    };
    requestAnimationFrame(step);
  };

  const metricsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.animated) return;
        entry.target.dataset.animated = 'true';
        const type = entry.target.dataset.metric;
        if (type === 'beecoin') animateValue(entry.target, 2.45, '$');
        if (type === 'trees') entry.target.textContent = '1.2M+';
        if (type === 'minted') entry.target.textContent = '482.5M';
        if (type === 'rate') animateValue(entry.target, 12.4, '', '', 1);
        if (type === 'stewards') entry.target.textContent = '128K+';
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-metric]').forEach((el) => metricsObserver.observe(el));

  document.querySelectorAll('[data-chart-period]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-chart-period]').forEach((b) => {
        b.classList.remove('chart-btn-active');
        b.classList.add('chart-btn');
      });
      btn.classList.add('chart-btn-active');
      btn.classList.remove('chart-btn');
    });
  });

  const initPillarSwiper = () => {
    const container = document.getElementById('pillar-scroll');
    if (!container) return;

    const originals = [...container.querySelectorAll('.pillar-slide')];
    const count = originals.length;
    if (!count) return;

    originals.forEach((slide) => container.appendChild(slide.cloneNode(true)));
    [...originals].reverse().forEach((slide) => container.insertBefore(slide.cloneNode(true), container.firstChild));

    const gap = () => parseFloat(getComputedStyle(container).gap) || 32;
    const step = () => {
      const slide = container.querySelector('.pillar-slide');
      return slide ? slide.offsetWidth + gap() : 432;
    };
    const setWidth = () => count * step();

    let jumping = false;
    let dragActive = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    let dragMoved = false;

    const normalizeScroll = () => {
      if (jumping || dragActive) return;
      const w = setWidth();
      const { scrollLeft } = container;
      if (scrollLeft >= w * 2 - 2) {
        jumping = true;
        container.scrollLeft -= w;
        jumping = false;
      } else if (scrollLeft <= 2) {
        jumping = true;
        container.scrollLeft += w;
        jumping = false;
      }
    };

    const scrollByStep = (dir) => {
      container.scrollTo({ left: container.scrollLeft + dir * step(), behavior: 'smooth' });
    };

    const startDrag = (clientX) => {
      dragActive = true;
      dragMoved = false;
      dragStartX = clientX;
      dragScrollLeft = container.scrollLeft;
      container.classList.add('is-dragging');
    };

    const moveDrag = (clientX) => {
      if (!dragActive) return;
      const dx = clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;
      container.scrollLeft = dragScrollLeft - dx;
    };

    const endDrag = () => {
      if (!dragActive) return;
      dragActive = false;
      container.classList.remove('is-dragging');
      normalizeScroll();
    };

    requestAnimationFrame(() => {
      container.scrollLeft = setWidth();
    });

    container.addEventListener('scroll', normalizeScroll, { passive: true });

    container.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startDrag(e.pageX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragActive) return;
      e.preventDefault();
      moveDrag(e.pageX);
    });

    window.addEventListener('mouseup', endDrag);

    container.addEventListener('touchstart', (e) => {
      startDrag(e.touches[0].pageX);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!dragActive) return;
      moveDrag(e.touches[0].pageX);
    }, { passive: true });

    container.addEventListener('touchend', endDrag);

    container.addEventListener('click', (e) => {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    document.getElementById('pillar-scroll-left')?.addEventListener('click', () => scrollByStep(-1));
    document.getElementById('pillar-scroll-right')?.addEventListener('click', () => scrollByStep(1));

    window.addEventListener('resize', () => {
      jumping = true;
      container.scrollLeft = setWidth();
      jumping = false;
    });
  };

  initPillarSwiper();

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
