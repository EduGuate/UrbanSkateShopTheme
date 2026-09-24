(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Glass nav on scroll + active link
  const nav = document.querySelector('.ur-nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));

  // Close mobile menu after picking a link
  document.querySelectorAll('#navbarNav a').forEach((a) => a.addEventListener('click', () => {
    const menu = document.getElementById('navbarNav');
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  // Scroll reveal with stagger
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    io.observe(el);
  });

  // Count-up
  const counters = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = +el.dataset.to;
      const suffix = el.dataset.suffix || '';
      counters.unobserve(el);
      if (reduce) { el.textContent = to + suffix; return; }
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.count').forEach((c) => counters.observe(c));

  // 3D tilt + cursor glow (mouse only)
  if (finePointer && !reduce) {
    document.body.classList.add('has-pointer');
    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });

    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .1s linear';
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });
  }

  // Deck finder
  const picks = {
    street: { name: 'UrbanGrind Pro', desc: 'Snappy pop and a tight shape for ledges, rails and stair sets.', width: '8.25"', concave: 'Medium', wheels: '52mm · 99A', v: [0.45, 0.6, 0.35] },
    park: { name: 'AirMaster X', desc: 'Wider platform and deep concave to stay locked in on bowls and vert.', width: '8.5"', concave: 'Deep', wheels: '56mm · 101A', v: [0.7, 0.9, 0.6] },
    cruise: { name: 'CityGlide Cruiser', desc: 'Bamboo flex and soft wheels that eat cracks for the daily city roll.', width: '9"', concave: 'Mellow', wheels: '60mm · 78A', v: [0.9, 0.3, 0.95] },
  };
  const $ = (id) => document.getElementById(id);
  const pick = document.querySelector('.finder-pick');
  document.querySelectorAll('.finder-tab').forEach((tab) => tab.addEventListener('click', () => {
    const p = picks[tab.dataset.pick];
    document.querySelectorAll('.finder-tab').forEach((t) => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    $('f-name').textContent = p.name;
    $('f-desc').textContent = p.desc;
    $('f-width').textContent = p.width;
    $('f-concave').textContent = p.concave;
    $('f-wheels').textContent = p.wheels;
    ['m-width', 'm-concave', 'm-wheels'].forEach((id, i) => $(id).style.setProperty('--v', p.v[i]));
    pick.classList.remove('swap'); void pick.offsetWidth; pick.classList.add('swap');
    document.querySelectorAll('.deck-card').forEach((c) => c.classList.toggle('match', c.dataset.style === tab.dataset.pick));
  }));

  // Load real images into slots when they exist (assets/*.webp)
  document.querySelectorAll('.img-slot[data-img]').forEach((slot) => {
    const img = new Image();
    img.onload = () => {
      slot.style.backgroundImage = `url('${slot.dataset.img}')`;
      slot.classList.add('has-img');
      slot.querySelectorAll('.deck').forEach((d) => d.remove());
    };
    img.src = slot.dataset.img;
  });
})();
