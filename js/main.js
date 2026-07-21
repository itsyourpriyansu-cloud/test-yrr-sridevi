/* ==========================================================================
   YOSHITHA'S REAL RISE - INTERACTIVE & ANIMATION CONTROLLER (GSAP)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  // Link Lenis to GSAP ScrollTrigger updates
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  // 2. Smooth Anchor Navigation (Lenis) — desktop nav-links + mobile menu links
  const HEADER_OFFSET = -90; // keeps target title clear of the fixed header
  document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      window.__lenis && window.__lenis.scrollTo(target, {
        offset: HEADER_OFFSET,
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic — premium, not sluggish
      });

      // Auto-close mobile menu if it was open
      if (mobileMenu && mobileMenu.classList.contains('active') && mobileToggle) {
        mobileToggle.click();
      }
    });
  });

  // 3. Magnetic Hover Buttons (Magnet Effect)
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-arrow-btn');
  if (window.innerWidth > 1024) {
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const bound = btn.getBoundingClientRect();
        const x = e.clientX - bound.left - (bound.width / 2);
        const y = e.clientY - bound.top - (bound.height / 2);
        
        // Move button toward cursor slightly
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        // Snap back to origin
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // 4. Mobile Menu Navigation panel toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu-overlay');
  const mobileClose = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');

  if (mobileToggle && mobileMenu) {
    const toggleMenu = () => {
      const isActive = mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open', isActive);

      // ARIA state
      mobileToggle.setAttribute('aria-expanded', String(isActive));
      mobileToggle.setAttribute('aria-label', isActive ? 'Close Navigation Menu' : 'Open Navigation Menu');
      mobileMenu.setAttribute('aria-hidden', String(!isActive));

      // Pause/resume Lenis so it can't fight the locked overlay scroll
      if (window.__lenis) {
        isActive ? window.__lenis.stop() : window.__lenis.start();
      }

      // Animate line state
      const spans = mobileToggle.querySelectorAll('span');
      if (isActive) {
        gsap.to(spans[0], { y: 7, rotate: 45, duration: 0.3 });
        gsap.to(spans[1], { opacity: 0, duration: 0.2 });
        gsap.to(spans[2], { y: -7, rotate: -45, duration: 0.3 });

        // Stagger list elements in Mobile Menu
        gsap.fromTo(mobileLinks,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.1, delay: 0.3, duration: 0.5, ease: 'power3.out' }
        );

        // Move focus into the dialog for keyboard/screen-reader users
        mobileClose && mobileClose.focus();
      } else {
        gsap.to(spans[0], { y: 0, rotate: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.2 });
        gsap.to(spans[2], { y: 0, rotate: 0, duration: 0.3 });

        // Return focus to the trigger that opened the menu
        mobileToggle.focus();
      }
    };

    mobileToggle.addEventListener('click', toggleMenu);
    mobileClose && mobileClose.addEventListener('click', toggleMenu);

    // Escape key closes the menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        toggleMenu();
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
          toggleMenu();
        }
      });
    });
  }

  // 5. Header Scroll Effect
  const header = document.querySelector('header');
  ScrollTrigger.create({
    start: 'top -50',
    onUpdate: (self) => {
      if (self.direction === 1) {
        header.classList.add('scrolled');
      } else if (self.scroll() < 50) {
        header.classList.remove('scrolled');
      }
    }
  });

  // 6. Header Entrance Animation
  gsap.set('header', { y: -50, opacity: 0 });
  gsap.to('header', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });


  // Parallax zoom effect on Hero Image
  gsap.to('.hero-main-img', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // 6b. Hero title — cycling word animation ("Ventures" → "Investments" → "Communities")
  (function initChangingWord() {
    const wordEl = document.getElementById('changing-word');
    if (!wordEl) return;

    const words = ['Near Regional Ring Road', 'Near Bangalore Highway ', 'Near Rajiv Gandhi Airport'];
    let idx = 0;

    // Set initial state (visible, no filter)
    gsap.set(wordEl, { yPercent: 0, opacity: 1, filter: 'blur(0px)' });

    function cycleWord() {
      // Exit: slide up + blur out
      gsap.to(wordEl, {
        duration: 0.45,
        yPercent: -100,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'power3.in',
        onComplete: () => {
          idx = (idx + 1) % words.length;
          wordEl.textContent = words[idx];

          // Enter: slide up from below + blur in
          gsap.fromTo(wordEl,
            { yPercent: 100, opacity: 0, filter: 'blur(8px)' },
            { duration: 0.6, yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power4.out' }
          );
        }
      });
    }

    // Start after hero entrance animation has settled
    setTimeout(() => {
      setInterval(cycleWord, 2000);
    }, 2000);
  })();

  // 6c. Features title — cycling word animation ("Infrastructure" → "Portfolios" → "Assets")
  (function initFeaturesChangingWord() {
    const wordEl = document.getElementById('changing-word-features');
    if (!wordEl) return;

    const words = ['Infrastructure', 'Portfolios', 'Assets'];
    let idx = 0;

    // Set initial state
    gsap.set(wordEl, { yPercent: 0, opacity: 1, filter: 'blur(0px)' });

    function cycleWord() {
      gsap.to(wordEl, {
        duration: 0.45,
        yPercent: -100,
        opacity: 0,
        filter: 'blur(8px)',
        ease: 'power3.in',
        onComplete: () => {
          idx = (idx + 1) % words.length;
          wordEl.textContent = words[idx];

          gsap.fromTo(wordEl,
            { yPercent: 100, opacity: 0, filter: 'blur(8px)' },
            { duration: 0.6, yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power4.out' }
          );
        }
      });
    }

    setTimeout(() => {
      setInterval(cycleWord, 2000);
    }, 2000);
  })();

  // Stat Numbers Count-up
  const animateStats = () => {
    const stats = document.querySelectorAll('.stat-number-val');
    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 2.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          stat.textContent = Math.floor(counter.val);
        }
      });
    });
  };
  animateStats();

  // 6b. Interactive Brand Pillars Section
  (function initBrandPillars() {
    const pillarsSection = document.getElementById('pillarsSection');
    const panels = document.querySelectorAll('.rr-panel');
    if (!pillarsSection || panels.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- ACCESSIBILITY / SETUP KEYS ---
    panels.forEach((panel) => {
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activatePanel(panel);
        }
      });
    });

    function activatePanel(targetPanel) {
      if (targetPanel.classList.contains('is-active')) {
        return;
      }

      const prevActive = document.querySelector('.rr-panel.is-active');

      if (prevActive) {
        prevActive.classList.remove('is-active');
        prevActive.setAttribute('aria-expanded', 'false');
        prevActive.setAttribute('aria-selected', 'false');
        // Reset SVG artwork parallax positions in previous active panel
        const prevArtwork = prevActive.querySelector('[data-artwork]');
        if (prevArtwork) {
          gsap.to(prevArtwork, { x: 0, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        }
      }

      targetPanel.classList.add('is-active');
      targetPanel.setAttribute('aria-expanded', 'true');
      targetPanel.setAttribute('aria-selected', 'true');
    }

    // --- INTERACTIVE EVENTS (DESKTOP HOVER / CLICK / FOCUS) ---
    panels.forEach((panel) => {
      // Hover event
      panel.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
          activatePanel(panel);
        }
      });

      // Focus event for keyboard tab access
      panel.addEventListener('focusin', () => {
        if (window.innerWidth > 1024) {
          activatePanel(panel);
        }
      });

      // Click/Tap event
      panel.addEventListener('click', () => {
        activatePanel(panel);
      });

      // Mouse move inside panel for glow and artwork parallax (only active panel)
      panel.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 1024) return;
        if (!panel.classList.contains('is-active')) return;

        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Move glow
        const glow = panel.querySelector('[data-glow]');
        if (glow) {
          gsap.to(glow, {
            left: x,
            top: y,
            duration: 0.1,
            overwrite: 'auto'
          });
        }

        // Move artwork parallax (dx, dy from -0.5 to 0.5)
        const artwork = panel.querySelector('[data-artwork]');
        if (artwork) {
          const dx = (x / rect.width) - 0.5;
          const dy = (y / rect.height) - 0.5;
          gsap.to(artwork, {
            x: dx * 25,
            y: dy * 25,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      // Mouse leave reset glow and parallax
      panel.addEventListener('mouseleave', () => {
        const glow = panel.querySelector('[data-glow]');
        if (glow) {
          gsap.to(glow, { left: '50%', top: '50%', duration: 0.3, overwrite: 'auto' });
        }
        const artwork = panel.querySelector('[data-artwork]');
        if (artwork) {
          gsap.to(artwork, { x: 0, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    });

    // --- INITIALIZE DEFAULT STATE ---
    const initialActive = document.querySelector('.rr-panel.is-active') || panels[0];
    if (initialActive) {
      initialActive.classList.add('is-active');
      initialActive.setAttribute('aria-expanded', 'true');
      initialActive.setAttribute('aria-selected', 'true');
    }

    // --- SCROLLTRIGGER ENTRANCE ANIMATION ---
    gsap.from(['.rr-pillars-eyebrow', '.rr-pillars-heading', '.rr-pillars-subtext', '.rr-panel'], {
      y: prefersReducedMotion ? 0 : 40,
      opacity: 0,
      duration: prefersReducedMotion ? 0.3 : 0.8,
      stagger: prefersReducedMotion ? 0 : 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: pillarsSection,
        start: 'top 80%',
        once: true
      }
    });
  })();

  // (About Section reveal handled by centralized animation manager)

  // 7b. About Photo Card — hover zoom + lift (desktop only)
  const aboutPhotoCard = document.querySelector('.about-photo-card');
  if (aboutPhotoCard && window.innerWidth > 1024) {
    const aboutPhotoImg = aboutPhotoCard.querySelector('img');

    aboutPhotoCard.addEventListener('mouseenter', () => {
      gsap.to(aboutPhotoImg, { scale: 1.1, duration: 0.9, ease: 'power3.out' });
      gsap.to(aboutPhotoCard, { y: -8, borderColor: 'rgba(255, 255, 255, 0.35)', duration: 0.6, ease: 'power3.out' });
    });

    aboutPhotoCard.addEventListener('mouseleave', () => {
      gsap.to(aboutPhotoImg, { scale: 1, duration: 0.7, ease: 'power3.out' });
      gsap.to(aboutPhotoCard, { y: 0, borderColor: 'rgba(255, 255, 255, 0.15)', duration: 0.6, ease: 'power3.out' });
    });
  }

  // 8. Bento Grid Card Tilting mouse hover (3D Perspective)
  const bentoCards = document.querySelectorAll('.bento-card');
  if (window.innerWidth > 1024) {
    bentoCards.forEach(card => {
      const inner = card.querySelector('.bento-card-inner') || card;
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate offsets relative to card center (-0.5 to 0.5 range)
        const dx = (x / rect.width) - 0.5;
        const dy = (y / rect.height) - 0.5;
        
        // Perform 3D rotation based on mouse offset
        gsap.to(inner, {
          rotateY: dx * 10,   // horizontal tilt
          rotateX: -dy * 10,  // vertical tilt
          transformPerspective: 1000,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        // Reset coordinates
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out'
        });
      });
    });
  }

  // (Bento and Features reveal handled by centralized animation manager)

  // 10. Showcase Slider Gallery Controller (GSAP)
  (function () {
    const sliderWrapper = document.getElementById('sg-slider-wrapper');
    const slides = document.querySelectorAll('.sg-slide');

    if (!sliderWrapper || slides.length === 0) return;

    // Single-video layout: skip slider/autoplay logic, just load the video
    // and run a slow looping zoom on it.
    if (slides.length === 1) {
      const slide = slides[0];
      const img = slide.querySelector('.sg-img');
      if (img) {
        const src = img.dataset.src;
        if (src && img.getAttribute('src') !== src) {
          img.src = src;
        }
        gsap.set(img, { scale: 1 });
        gsap.to(img, {
          scale: 1.05,
          duration: 10,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut'
        });
      }
      return;
    }

    const prevBtn = document.getElementById('sg-prev-btn');
    const nextBtn = document.getElementById('sg-next-btn');
    const progressBar = document.getElementById('sg-progress-bar');

    let currentIndex = 0;
    const totalSlides = slides.length;
    let progressTween = null;
    let zoomTween = null;
    let isTransitioning = false;

    // Helper to get active slide elements
    function getSlideElements(slide) {
      return {
        img: slide.querySelector('.sg-img'),
        title: slide.querySelector('.sg-title'),
        desc: slide.querySelector('.sg-desc'),
        counter: slide.querySelector('.sg-counter'),
        tag: slide.querySelector('.sg-tag')
      };
    }

    // Lazy-load a slide's YouTube video (only when it becomes active)
    function loadSlideVideo(iframe) {
      if (!iframe) return;
      const src = iframe.dataset.src;
      if (src && iframe.getAttribute('src') !== src) {
        iframe.src = src;
      }
    }

    // Unload a slide's YouTube video to stop playback and free resources
    function unloadSlideVideo(iframe) {
      if (!iframe) return;
      iframe.removeAttribute('src');
    }

    // Function to run transition
    function goToSlide(nextIndex) {
      if (isTransitioning || nextIndex === currentIndex) return;
      isTransitioning = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      const currentEl = getSlideElements(currentSlide);
      const nextEl = getSlideElements(nextSlide);

      // Reset progress bar tween
      if (progressTween) {
        progressTween.kill();
      }
      if (zoomTween) {
        zoomTween.kill();
      }

      // 1. Prepare next slide state
      gsap.set(nextSlide, { zIndex: 3, opacity: 0 });
      gsap.set(nextEl.img, { scale: 1 });
      gsap.set([nextEl.tag, nextEl.counter, nextEl.title, nextEl.desc], { opacity: 0, y: 20 });

      // 2. Animate out current slide
      gsap.set(currentSlide, { zIndex: 2 });
      gsap.to(currentSlide, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          currentSlide.classList.remove('active');
          unloadSlideVideo(currentEl.img);
          isTransitioning = false;
        }
      });

      // 3. Animate in next slide
      nextSlide.classList.add('active');
      loadSlideVideo(nextEl.img);
      gsap.to(nextSlide, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      });

      // Zoom effect on new slide image over 5s duration
      zoomTween = gsap.to(nextEl.img, {
        scale: 1.05,
        duration: 5,
        ease: 'none'
      });

      // Animate text elements independently
      gsap.to([nextEl.tag, nextEl.counter], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.2
      });

      gsap.to(nextEl.title, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.3
      });

      gsap.to(nextEl.desc, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.4
      });

      // Update current index
      currentIndex = nextIndex;

      // Restart progress bar autoplay
      startAutoplay();
    }

    function nextSlide() {
      const nextIndex = (currentIndex + 1) % totalSlides;
      goToSlide(nextIndex);
    }

    function prevSlide() {
      const nextIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      goToSlide(nextIndex);
    }

    // Start progress bar animation
    function startAutoplay() {
      progressTween = gsap.fromTo(progressBar, 
        { width: '0%' },
        {
          width: '100%',
          duration: 5,
          ease: 'none',
          onComplete: nextSlide
        }
      );
    }

    // Initialize first slide's zoom animation
    const firstEl = getSlideElements(slides[0]);
    gsap.set(slides[0], { opacity: 1, zIndex: 3 });
    gsap.set(firstEl.img, { scale: 1 });
    zoomTween = gsap.to(firstEl.img, {
      scale: 1.05,
      duration: 5,
      ease: 'none'
    });

    startAutoplay();

    // Hover listeners
    sliderWrapper.addEventListener('mouseenter', () => {
      if (progressTween) progressTween.pause();
      if (zoomTween) zoomTween.pause();
    });

    sliderWrapper.addEventListener('mouseleave', () => {
      if (progressTween) progressTween.play();
      if (zoomTween) zoomTween.play();
    });

    // Navigation Click listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }
  })();

  // 10b. Location Overview Accordion (single-open)
  (function () {
    const accordion = document.getElementById('lo-accordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('.lo-item');
    const visualImg = document.getElementById('lo-visual-img');

    function setVisual(item, animate) {
      if (!visualImg || !item.dataset.image) return;
      if (visualImg.getAttribute('src') === item.dataset.image) return;

      const swap = () => {
        visualImg.src = item.dataset.image;
        if (item.dataset.alt) visualImg.alt = item.dataset.alt;
      };

      if (animate) {
        gsap.to(visualImg, {
          opacity: 0, duration: 0.25, ease: 'power2.out',
          onComplete: () => {
            swap();
            gsap.to(visualImg, { opacity: 1, duration: 0.35, ease: 'power2.out' });
          }
        });
      } else {
        swap();
      }
    }

    function openItem(item, animate) {
      const content = item.querySelector('.lo-item-content');
      const icon = item.querySelector('.lo-item-icon span:last-child');
      const header = item.querySelector('.lo-item-header');
      item.classList.add('is-open');
      header.setAttribute('aria-expanded', 'true');
      setVisual(item, animate);

      if (animate) {
        gsap.to(content, { height: 'auto', duration: 0.6, ease: 'power3.inOut' });
        gsap.to(icon, { scaleY: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.set(content, { height: 'auto' });
        gsap.set(icon, { scaleY: 0 });
      }
    }

    function closeItem(item) {
      const content = item.querySelector('.lo-item-content');
      const icon = item.querySelector('.lo-item-icon span:last-child');
      const header = item.querySelector('.lo-item-header');
      item.classList.remove('is-open');
      header.setAttribute('aria-expanded', 'false');

      gsap.to(content, { height: 0, duration: 0.5, ease: 'power3.inOut' });
      gsap.to(icon, { scaleY: 1, duration: 0.4, ease: 'power2.out' });
    }

    items.forEach((item) => {
      const content = item.querySelector('.lo-item-content');

      if (item.classList.contains('is-open')) {
        openItem(item, false);
      } else {
        gsap.set(content, { height: 0 });
      }

      item.querySelector('.lo-item-header').addEventListener('click', () => {
        const alreadyOpen = item.classList.contains('is-open');

        items.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            closeItem(other);
          }
        });

        if (alreadyOpen) {
          closeItem(item);
        } else {
          openItem(item, true);
        }
      });
    });
  })();

  // 11. Testimonials — drag-to-scroll + arrow navigation
  (function () {
    const track   = document.getElementById('tm-cards-track');
    const prevBtn = document.getElementById('tm-prev-btn');
    const nextBtn = document.getElementById('tm-next-btn');
    const bar     = document.getElementById('tm-scroll-bar');

    if (!track) return;

    // ── Drag to scroll ──────────────────────────────────────────────────
    let isDown = false, startX, scrollStart;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollStart = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x  = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollStart - walk;
    });

    // Touch support
    let touchStartX, touchScrollStart;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchScrollStart = track.scrollLeft;
    }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      track.scrollLeft = touchScrollStart - dx;
    }, { passive: true });

    // ── Arrow navigation ────────────────────────────────────────────────
    function getScrollAmount() {
      const card = track.querySelector('.tm-card');
      if (!card) return 360;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      return card.offsetWidth + gap;
    }

    function updateArrows() {
      if (!prevBtn || !nextBtn) return;
      prevBtn.disabled = track.scrollLeft <= 4;
      nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;

      // Update progress bar width
      if (bar) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        const pct = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
        bar.style.width = pct + '%';
      }
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });
      track.addEventListener('scroll', updateArrows, { passive: true });
      updateArrows();
    }
  })();

  // 12. NRI Support — card hover zoom + expand icon (desktop only)
  if (window.innerWidth > 1024) {
    document.querySelectorAll('.nri-card').forEach((card) => {
      const img = card.querySelector('img');
      const expandIcon = card.querySelector('.nri-card-expand');
      gsap.set(expandIcon, { scale: 0.85 });

      card.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.08, duration: 0.7, ease: 'power3.out' });
        gsap.to(expandIcon, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.6, ease: 'power3.out' });
        gsap.to(expandIcon, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  // 13. Scroll Reveal Text Color Fill Animation
  const revealTitles = document.querySelectorAll('.section-title');
  revealTitles.forEach(title => {
    const fill = title.querySelector('.title-fill');
    if (!fill) return;

    gsap.fromTo(fill,
      {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0.2,
        filter: "blur(8px)"
      },
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        filter: "blur(0px)",
        ease: "power4.out",
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          end: "top 10%",
          scrub: true
        }
      }
    );
  });

  // 14. Stats Description Text Scroll Reveal (Vanilla JS)
  (function initTextReveal() {
    const desc = document.querySelector('.stats-new-desc');
    if (!desc) return;

    const originalText = desc.textContent.replace(/\s+/g, ' ').trim();
    desc.innerHTML = '';
    
    // Create spans for each character to enable smooth character-by-character transition
    const spans = [...originalText].map(char => {
      const span = document.createElement('span');
      span.className = 'reveal-char';
      span.textContent = char;
      desc.appendChild(span);
      return span;
    });

    const handler = () => {
      const rect = desc.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Reveal window: starts when top of text enters 85% of screen height
      // Completes when top of text reaches 35% of screen height
      const startReveal = viewportHeight * 0.85;
      const endReveal = viewportHeight * 0.35;
      
      let progress = (startReveal - rect.top) / (startReveal - endReveal);
      progress = Math.max(0, Math.min(1, progress));
      
      const totalSpans = spans.length;
      const revealIndex = Math.floor(progress * totalSpans);
      
      for (let i = 0; i < totalSpans; i++) {
        if (i <= revealIndex) {
          spans[i].classList.add('active');
        } else {
          spans[i].classList.remove('active');
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handler();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', handler);
    // Initial paint
    handler();
  })();

  // ─── Smart Investors: Drag-to-scroll & progress bar ───
  (function () {
    const track = document.getElementById('si-cards-track');
    const bar   = document.getElementById('si-scroll-bar');
    if (!track) return;

    // Update progress bar on scroll
    const updateBar = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const pct = (track.scrollLeft / maxScroll) * 100;
      if (bar) bar.style.width = pct + '%';
    };
    track.addEventListener('scroll', updateBar, { passive: true });

    // Drag-to-scroll
    let isDragging = false;
    let startX, scrollStart, dragMoved;

    // Suppress the card-open click that follows a real drag gesture
    track.addEventListener('click', (e) => {
      if (dragMoved) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragMoved  = false;
      startX     = e.clientX;
      scrollStart = track.scrollLeft;
      track.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) dragMoved = true;
      track.scrollLeft = scrollStart - dx;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      track.style.userSelect = '';
    });

    // Touch support
    let touchStartX, touchScrollStart;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchScrollStart = track.scrollLeft;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      track.scrollLeft = touchScrollStart - dx;
    }, { passive: true });
  })();

  // ── Service Cards Arrow Navigation ──────────────────────────────────────
  (function () {
    const track   = document.getElementById('si-cards-track');
    const prevBtn = document.getElementById('si-prev-btn');
    const nextBtn = document.getElementById('si-next-btn');

    if (!track || !prevBtn || !nextBtn) return;

    /** Width of one card + gap to scroll per click */
    function getScrollAmount() {
      const card = track.querySelector('.si-card');
      if (!card) return 360;
      const style = getComputedStyle(track);
      const gap   = parseFloat(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    /** Enable / disable buttons based on scroll position */
    function updateArrows() {
      const atStart = track.scrollLeft <= 4;
      const atEnd   = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
    }

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows(); // set initial state
  })();

  // (Services reveal handled by centralized animation manager)

  // ── OUR WORKS — Scroll-Driven GSAP Showcase ─────────────────────────────
  (function initWorksSection() {

    // ── Tiny SplitText utility (mimics GSAP SplitText for chars with mask) ──
    function splitChars(el) {
      const childNodes = Array.from(el.childNodes);
      el.textContent = '';

      const chars = [];
      childNodes.forEach(function(node) {
        if (node.nodeType === 3) { // Text node
          const text = node.textContent;
          for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (ch === ' ') {
              const sp = document.createElement('span');
              sp.innerHTML = '&nbsp;';
              sp.style.display = 'inline-block';
              el.appendChild(sp);
              continue;
            }
            if (ch === '\n' || ch === '\r') {
              continue;
            }

            const wrap = document.createElement('span');
            wrap.classList.add('char-wrap');

            const inner = document.createElement('span');
            inner.classList.add('char');
            inner.textContent = ch;

            wrap.appendChild(inner);
            el.appendChild(wrap);
            chars.push(inner);
          }
        } else if (node.nodeName.toLowerCase() === 'br') {
          el.appendChild(document.createElement('br'));
        } else {
          el.appendChild(node);
        }
      });
      return chars;
    }

    // ── Animate the section hero title on scroll-into-view ──
    const worksHeroTitle = document.querySelector('.works-hero-title');
    if (worksHeroTitle) {
      const heroChars = splitChars(worksHeroTitle);
      gsap.set(heroChars, { yPercent: 120 });
      gsap.to(heroChars, {
        yPercent: 0,
        ease: 'power3.out',
        stagger: { amount: 0.55, from: 'center' },
        scrollTrigger: {
          trigger: '.works-hero',
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse'
        }
      });
    }

    // ── Per work item: clip-path image reveal + char stagger ──
    document.querySelectorAll('.work-item').forEach(function(item) {
      const img    = item.querySelector('.work-item-img');
      const nameH1 = item.querySelector('.work-item-name h1');

      if (!img || !nameH1) return;

      // ── 1. Split title into masked chars ──
      const chars = splitChars(nameH1);
      gsap.set(chars, { yPercent: 125 });

      // Per-char ScrollTrigger scrub (exact port of the React GSAP code)
      chars.forEach(function(char, index) {
        ScrollTrigger.create({
          trigger: item,
          start: 'top+=' + (index * 25 - 250) + ' top',
          end:   'top+=' + (index * 25 - 100)  + ' top',
          scrub: 1,
          animation: gsap.fromTo(
            char,
            { yPercent: 125 },
            { yPercent: 0, ease: 'none' }
          )
        });
      });

      // ── 2. Clip-path ENTRY reveal ──
      ScrollTrigger.create({
        trigger: item,
        start: 'top bottom',
        end:   'top top',
        scrub: 0.5,
        animation: gsap.fromTo(
          img,
          { clipPath: 'polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'none' }
        )
      });

      // ── 3. Clip-path EXIT collapse ──
      ScrollTrigger.create({
        trigger: item,
        start: 'bottom bottom',
        end:   'bottom top',
        scrub: 0.5,
        animation: gsap.fromTo(
          img,
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)', ease: 'none' }
        )
      });
    });

  })();

  // Centralized Section Reveal Animation Manager
  function initSectionRevealAnimations() {
    const childSelectors = [
      // 1. Heading
      'h1, h2, h3, .section-title, .about-title, .features-title, .si-heading, .lo-title, .tm-heading, .nri-title, .cf-heading, .works-hero-title, .hero-video-title',
      // 2. Subtitle
      '.hero-video-subtitle, .features-subtitle, .lo-subtitle, .tm-desc, .si-desc, .works-tag, .lo-eyebrow, .features-eyebrow, .about-tag, .si-tag, .cf-tag, .hero-video-metadata',
      // 3. Paragraph
      'p, .about-text, .nri-text p',
      // 4. Cards
      '.stats-card, .feature-card, .si-card, .tm-card, .nri-card, .about-point-card, .lo-item, .partner-logo-item, .form-group',
      // 5. Buttons
      '.btn-primary, .btn-secondary, .cf-submit-btn, .nri-link, .lo-learn-more, .card-cta, .si-nav-arrows button, .tm-nav-arrows button, .sg-controls button, .cf-footer-cta, .btn-video-text, .hero-video-btn',
      // 6. Images
      '.about-photo-card, .lo-visual, .nri-card img, .cf-footer-logo, .hero-bg-image, .about-bg-image, .lo-visual-img, .partner-logo-img, .tm-card-avatar, .feature-image-cover-card',
      // 7. Statistics
      '.hero-stats, .stats-cards-grid, .stat-number-val, .sg-counter'
    ];

    const sections = [
      '#hero',
      '.hero-stats-strip',
      '#about',
      '#features',
      '#bento',
      '#gallery',
      '#location',
      '#testimonials',
      '.partners',
      '#nri',
      '#contact'
    ];

    function animateSection(sectionSelector, childSelectors) {
      const section = document.querySelector(sectionSelector);
      if (!section) return;

      const targets = [];
      childSelectors.forEach(selector => {
        const elements = Array.from(section.querySelectorAll(selector));
        elements.forEach(el => {
          if (!targets.includes(el)) {
            targets.push(el);
          }
        });
      });

      // Filter out elements whose parent/ancestor is already in targets to prevent conflicting transitions.
      const filteredTargets = targets.filter(el => {
        let parent = el.parentElement;
        while (parent && parent !== section) {
          if (targets.includes(parent)) {
            return false;
          }
          parent = parent.parentElement;
        }
        return true;
      });

      if (filteredTargets.length === 0) return;

      // Add performance/GPU optimization class
      filteredTargets.forEach(el => {
        el.classList.add('gsap-reveal-target');
      });

      // Temporarily disable CSS transitions on properties controlled by GSAP
      section.classList.add('gsap-reveal-active');

      // 1. Set initial states using gsap.set() once
      gsap.set(filteredTargets, {
        opacity: 0,
        y: 60,
        scale: 0.985,
        filter: 'blur(8px)',
        force3D: true,
        lazy: false,
        immediateRender: false
      });

      // 2. Animate with gsap.to() using ScrollTrigger
      gsap.to(filteredTargets, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power4.out',
        stagger: 0.12,
        overwrite: 'auto',
        force3D: true,
        lazy: false,
        clearProps: 'filter',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
          onComplete: () => {
            section.classList.remove('gsap-reveal-active');
            filteredTargets.forEach(el => el.classList.remove('gsap-reveal-target'));
          }
        }
      });
    }

    sections.forEach(selector => {
      animateSection(selector, childSelectors);
    });
  }

  initSectionRevealAnimations();

  // 13. Masterplan Lightbox Controller
  (function () {
    const openBtn = document.getElementById('open-masterplan-btn');
    const lightbox = document.getElementById('mp-lightbox');
    const closeBtn = document.getElementById('mp-lightbox-close');
    const overlay = document.getElementById('mp-lightbox-overlay');

    if (!openBtn || !lightbox) return;

    function openLightbox() {
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    }

    openBtn.addEventListener('click', openLightbox);
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  })();

  // 14. Amenities Gallery Lightbox
  (function () {
    const AMENITIES = [
      { title: 'Avenue Plantations', desc: 'Tree-lined avenues that create a refreshing, green environment for peaceful everyday living.', img: 'Assets/Amenities/avenue-plantation.webp' },
      { title: 'Central Park with Water Body', desc: 'A beautifully designed central park with a serene water feature, offering the perfect space to relax and reconnect with nature.', img: 'Assets/Amenities/central-park.webp' },
      { title: "Kid's Play Zone", desc: 'A safe and engaging play area where children can learn, explore, and enjoy endless fun.', img: 'Assets/Amenities/children-playarea.webp' },
      { title: 'Open Theatre', desc: 'An open-air gathering space designed for cultural events, celebrations, and memorable community experiences.', img: 'Assets/Amenities/open-theatre.webp' },
      { title: 'Senior Citizen Park', desc: 'A peaceful and comfortable green space designed exclusively for relaxation, wellness, and social interaction.', img: 'Assets/Amenities/senior-citizens-park.webp' },
      { title: 'Sports Zone', desc: 'Dedicated sports facilities that encourage an active, healthy, and energetic lifestyle for all age groups.', img: 'Assets/Amenities/sports.webp' },
      { title: 'Private Swimming Pool', desc: 'An exclusive swimming pool offering a refreshing escape and a premium leisure experience for residents.', img: 'Assets/Amenities/swimming-pool.webp' },
      { title: 'Site View Point', desc: 'Enjoy panoramic views of the community from a thoughtfully designed viewpoint that showcases the beauty of Real Rise.', img: 'Assets/Amenities/community-aerial-view.webp' },
      { title: 'Herbal Garden', desc: 'A thoughtfully curated herbal garden that promotes natural wellness in a refreshing green setting.', img: 'Assets/Amenities/garden-spot.webp' },
      { title: 'Recreation Zone', desc: 'A vibrant recreational space where families can unwind, connect, and create lasting memories together.', img: 'Assets/Amenities/chill-out-spot.webp' },
      { title: 'Project Junction', desc: 'The heart of the community, bringing together landscaped spaces, pathways, and lifestyle amenities for everyday convenience.', img: 'Assets/Amenities/sculpture-fountain-plaza.webp' },
      // Bonus gallery shots — no dedicated card, but browsable from any card's lightbox
      { title: 'Jogging Track', desc: 'A palm-fringed track that turns every run into a scenic escape, right at your doorstep.', img: 'Assets/Amenities/roads.webp' },
      { title: 'Blossom Bridge', desc: 'A charming timber bridge weaving through fragrant gardens, made for slow evening walks.', img: 'Assets/Amenities/blossom-bridge.webp' },
      { title: 'Entrance Plaza', desc: 'A striking gateway of architecture and light, the first impression of a life well-designed.', img: 'Assets/Amenities/entrance-plaza.webp' },
      { title: 'Bougainvillea Avenue', desc: 'Blossom-lined boulevards that turn every drive home into a scenic one.', img: 'Assets/Amenities/bougainvillea-avenue.webp' },
      { title: 'Poolside Deck', desc: 'Sun loungers and shaded corners set around the water, made for lazy weekend afternoons.', img: 'Assets/Amenities/poolside-deck.webp' },
      { title: 'Garden Sculpture at Dusk', desc: 'Illuminated art and manicured lawns that turn evening walks into something memorable.', img: 'Assets/Amenities/garden-sculpture-dusk.webp' },
      { title: 'Palm Fountain Walkway', desc: 'A shaded, palm-canopied path leading to a tranquil fountain courtyard.', img: 'Assets/Amenities/palm-fountain-walkway.webp' }
    ];

    const cards      = document.querySelectorAll('.si-card[data-amenity-index]');
    const lightbox   = document.getElementById('am-lightbox');
    const overlay    = document.getElementById('am-lightbox-overlay');
    const closeBtn   = document.getElementById('am-lightbox-close');
    const prevBtn    = document.getElementById('am-lightbox-prev');
    const nextBtn    = document.getElementById('am-lightbox-next');
    const stage      = document.getElementById('am-lightbox-stage');
    const imgEl      = document.getElementById('am-lightbox-img');
    const titleEl    = document.getElementById('am-lightbox-title');
    const descEl     = document.getElementById('am-lightbox-desc');
    const counterEl  = document.getElementById('am-lightbox-counter');
    const thumbsWrap = document.getElementById('am-lightbox-thumbs');

    if (!cards.length || !lightbox || !imgEl || !thumbsWrap) return;

    let currentIndex = 0;
    let isOpen = false;

    // Build thumbnail strip once
    const thumbEls = AMENITIES.map((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'am-lightbox-thumb';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'View ' + item.title);
      const thumbImg = document.createElement('img');
      thumbImg.src = item.img;
      thumbImg.alt = '';
      thumbImg.loading = 'lazy';
      btn.appendChild(thumbImg);
      btn.addEventListener('click', () => goTo(i));
      thumbsWrap.appendChild(btn);
      return btn;
    });

    /** Preload the images adjacent to the given index for smooth navigation */
    function preloadAdjacent(index) {
      [index - 1, index + 1].forEach((i) => {
        const idx = (i + AMENITIES.length) % AMENITIES.length;
        const preloadImg = new Image();
        preloadImg.src = AMENITIES[idx].img;
      });
    }

    function render(index, skipFade) {
      const item = AMENITIES[index];

      const applyContent = () => {
        imgEl.src = item.img;
        imgEl.alt = item.title;
        titleEl.textContent = item.title;
        descEl.textContent = item.desc;
        counterEl.textContent = (index + 1) + ' / ' + AMENITIES.length;
        thumbEls.forEach((el, i) => el.classList.toggle('is-active', i === index));

        const activeThumb = thumbEls[index];
        if (activeThumb && activeThumb.scrollIntoView) {
          activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      };

      if (skipFade) {
        applyContent();
        imgEl.classList.add('is-visible');
      } else {
        imgEl.classList.remove('is-visible');
        window.setTimeout(() => {
          applyContent();
          requestAnimationFrame(() => imgEl.classList.add('is-visible'));
        }, 180);
      }

      preloadAdjacent(index);
    }

    function goTo(index) {
      currentIndex = (index + AMENITIES.length) % AMENITIES.length;
      render(currentIndex, false);
    }

    function openLightbox(index) {
      currentIndex = index;
      isOpen = true;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
      render(currentIndex, true);
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      isOpen = false;
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      imgEl.classList.remove('is-visible');
    }

    // Open on card click / keyboard activation
    cards.forEach((card) => {
      const index = parseInt(card.getAttribute('data-amenity-index'), 10);

      card.addEventListener('click', () => openLightbox(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
      if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    // Swipe gesture support (mobile)
    let touchStartX = 0;
    let touchStartY = 0;

    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) goTo(currentIndex + 1);
          else goTo(currentIndex - 1);
        }
      }, { passive: true });
    }
  })();

  // ── Redesigned Features Card Spotlight Interaction ──
  (function initFeaturesSpotlight() {
    const cards = document.querySelectorAll('.feature-card.content-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  })();

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

});
