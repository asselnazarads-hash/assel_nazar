/* ============================================================
   Асель Назар — скрипты лендинга. Без зависимостей.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Лёгкое появление блоков при скролле ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Тонкая линия у шапки при скролле ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Окно выбора мессенджера ----------
     Кнопки — обычные ссылки на WhatsApp. Если скрипт не загрузился,
     они просто откроют WhatsApp. Если загрузился — показываем выбор
     поверх страницы, не уводя человека вниз. */
  var dialog = document.getElementById('contact-dialog');
  if (!dialog) return;

  var lastFocused = null;

  var openDialog = function (event) {
    if (event) event.preventDefault();
    lastFocused = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add('is-locked');
    var first = dialog.querySelector('.dialog__link');
    if (first) first.focus({ preventScroll: true });
  };

  var closeDialog = function () {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  };

  document.querySelectorAll('[data-contact]').forEach(function (el) {
    el.addEventListener('click', openDialog);
  });

  dialog.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeDialog);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDialog();
  });

  /* Ушли в мессенджер — считаем это заявкой и закрываем окно,
     чтобы при возврате страница была в обычном состоянии.
     Meta Pixel: событие Lead. Яндекс.Метрика: цель contact_click
     (её нужно один раз создать в интерфейсе Метрики). */
  dialog.querySelectorAll('.dialog__link').forEach(function (link) {
    link.addEventListener('click', function () {
      var channel = link.classList.contains('dialog__link--tg') ? 'telegram' : 'whatsapp';

      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { content_name: channel });
      }
      if (typeof ym === 'function') {
        ym(111195520, 'reachGoal', 'contact_click', { channel: channel });
      }

      setTimeout(closeDialog, 120);
    });
  });

  /* Пока окно открыто, фокус не должен уходить за его пределы. */
  dialog.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var items = dialog.querySelectorAll('a[href], button');
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
