/* ==========================================================================
   FLOATING CONTACT WIDGET
   Self-contained module: builds contact links from CONFIG, wires up the
   open/close toggle, keyboard + outside-click dismissal, and a one-time
   entrance pulse. No globals leaked beyond the IIFE.
   ========================================================================== */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION — edit these values to update widget links.
  // ─────────────────────────────────────────────────────────────
  var contactLinks = {
    phone: '+917036922159',
    whatsapp: '917036922159',
    facebook: 'https://www.facebook.com/YoshithaSridevikapalavayi',
    twitter: 'https://x.com/yoshithasridevi',
    instagram: 'https://www.instagram.com/YoshithaSridevikapalavayi',
    linkedin: 'https://www.linkedin.com/company/yoshithasridevikapalavayi/',
    youtube: 'https://www.youtube.com/@YoshithaSridevikapalavayi'
  };
  // ─────────────────────────────────────────────────────────────

  function init() {
    var widget = document.getElementById('floating-contact-widget');
    if (!widget || widget.dataset.fcwInitialized === 'true') {
      return; // already initialized, or markup not present on this page
    }
    widget.dataset.fcwInitialized = 'true';

    var toggle = document.getElementById('floating-contact-widget-toggle');
    var hideBtn = document.getElementById('floating-contact-widget-hide');
    var stack = document.getElementById('floating-contact-widget-stack');
    var links = Array.prototype.slice.call(stack.querySelectorAll('.floating-contact-widget__link'));

    var phoneLink = document.getElementById('fcw-link-phone');
    var whatsappLink = document.getElementById('fcw-link-whatsapp');
    var facebookLink = document.getElementById('fcw-link-facebook');
    var twitterLink = document.getElementById('fcw-link-twitter');
    var instagramLink = document.getElementById('fcw-link-instagram');
    var linkedinLink = document.getElementById('fcw-link-linkedin');
    var youtubeLink = document.getElementById('fcw-link-youtube');

    if (phoneLink) phoneLink.href = 'tel:' + contactLinks.phone;
    if (whatsappLink) whatsappLink.href = 'https://wa.me/' + contactLinks.whatsapp;
    if (facebookLink) facebookLink.href = contactLinks.facebook;
    if (twitterLink) twitterLink.href = contactLinks.twitter;
    if (instagramLink) instagramLink.href = contactLinks.instagram;
    if (linkedinLink) linkedinLink.href = contactLinks.linkedin;
    if (youtubeLink) youtubeLink.href = contactLinks.youtube;

    var isOpen = false;
    var focusableEls = [hideBtn].concat(links);

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setExpandedState(open) {
      isOpen = open;
      widget.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close contact options' : 'Open contact options');

      focusableEls.forEach(function (el) {
        if (!el) return;
        if (open) {
          el.removeAttribute('tabindex');
        } else {
          el.setAttribute('tabindex', '-1');
        }
      });
    }

    function open(focusFirst) {
      if (isOpen) return;
      setExpandedState(true);
      if (focusFirst && links[0]) {
        links[0].focus();
      }
    }

    function close(returnFocus) {
      if (!isOpen) return;
      setExpandedState(false);
      if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function (event) {
      var openedByKeyboard = event.detail === 0; // 0 = keyboard event, 1 = mouse
      if (isOpen) {
        close(false);
      } else {
        open(openedByKeyboard);
      }
    });

    hideBtn.addEventListener('click', function () {
      close(true);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) {
        close(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (!isOpen) return;
      if (!widget.contains(event.target)) {
        close(false);
      }
    });

    // ─── One-time gentle pulse, ~1.5s after load ───
    if (!prefersReducedMotion()) {
      window.setTimeout(function () {
        if (isOpen) return;
        toggle.classList.add('floating-contact-widget__toggle--pulse');
        toggle.addEventListener('animationend', function onPulseEnd() {
          toggle.classList.remove('floating-contact-widget__toggle--pulse');
          toggle.removeEventListener('animationend', onPulseEnd);
        });
      }, 1500);
    }

    trackThirdPartyChatBubble(widget);
  }

  // Polls the third-party chat bubble (CollectChat) size to stack this widget 12px above it
  function trackThirdPartyChatBubble(widget) {
    var GAP = 12;
    var MAX_BUBBLE_SIZE = 140; // open panel vs idle circle check
    var POLL_MS = 1000;

    function findBubble() {
      return document.getElementById('chat-bot-frame-wrap') || document.getElementById('chat-bot-iframe');
    }

    function update() {
      var bubble = findBubble();
      if (!bubble) {
        widget.style.removeProperty('--fcw-bottom');
        widget.style.removeProperty('--fcw-right');
        return;
      }
      var rect = bubble.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.width > MAX_BUBBLE_SIZE || rect.height > MAX_BUBBLE_SIZE) {
        widget.style.removeProperty('--fcw-bottom');
        widget.style.removeProperty('--fcw-right');
        return;
      }

      var isDesktop = window.innerWidth > 768;
      var verticalGap = GAP;
      if (isDesktop) {
        verticalGap = -8; 
      }
      
      var offset = Math.round((window.innerHeight - rect.top) + verticalGap);
      widget.style.setProperty('--fcw-bottom', offset + 'px');

      if (isDesktop) {
        var widgetToggleWidth = 60; // toggle size is 60px
        var rightOffset = Math.round((window.innerWidth - rect.right) + (rect.width - widgetToggleWidth) / 2);
        widget.style.setProperty('--fcw-right', rightOffset + 'px');
      } else {
        widget.style.removeProperty('--fcw-right');
      }
    }

    update();
    window.addEventListener('resize', update);
    window.setInterval(update, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
