/**
 * widget-interact.js
 * Handles all interactive component behaviors.
 * No dependencies — pure vanilla JS.
 */

(function () {
  'use strict';

  // ── Utility ──────────────────────────────────────────────────
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ── Tabs ─────────────────────────────────────────────────────
  function initTabs() {
    qsa('[data-wg-tabs]').forEach(container => {
      const btnList = qsa('.wg-tab-btn', container);
      const panels  = qsa('.wg-tab-panel', container);

      function activate(index) {
        btnList.forEach((b, i) => b.classList.toggle('active', i === index));
        panels.forEach((p, i)  => p.classList.toggle('active',  i === index));
      }

      btnList.forEach((btn, i) => {
        on(btn, 'click', () => activate(i));
      });

      // Activate first by default
      if (!btnList.some(b => b.classList.contains('active'))) activate(0);
    });
  }

  // ── Dropdowns ────────────────────────────────────────────────
  function initDropdowns() {
    qsa('[data-wg-dropdown]').forEach(container => {
      const trigger = qs('[data-wg-dropdown-toggle]', container) || qs('.wg-btn', container);
      const menu    = qs('.wg-dropdown-menu', container);
      if (!trigger || !menu) return;

      on(trigger, 'click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) menu.classList.add('open');
      });
    });

    // Close on outside click
    on(document, 'click', closeAllDropdowns);
    on(document, 'keydown', e => { if (e.key === 'Escape') closeAllDropdowns(); });
  }

  function closeAllDropdowns() {
    qsa('.wg-dropdown-menu.open').forEach(m => m.classList.remove('open'));
  }

  // ── Modals ───────────────────────────────────────────────────
  function initModals() {
    // Open triggers: data-wg-modal-open="#modal-id"
    on(document, 'click', (e) => {
      const trigger = e.target.closest('[data-wg-modal-open]');
      if (trigger) {
        const target = qs(trigger.dataset.wgModalOpen);
        if (target) openModal(target);
      }

      // Close triggers: data-wg-modal-close, .wg-modal-close, or overlay click
      if (
        e.target.closest('[data-wg-modal-close]') ||
        e.target.closest('.wg-modal-close') ||
        e.target.classList.contains('wg-modal-overlay')
      ) {
        const overlay = e.target.closest('.wg-modal-overlay');
        if (overlay) closeModal(overlay);
      }
    });

    // Keyboard: Escape to close
    on(document, 'keydown', e => {
      if (e.key === 'Escape') {
        qsa('.wg-modal-overlay.open').forEach(closeModal);
      }
    });
  }

  function openModal(overlayOrModal) {
    const overlay = overlayOrModal.classList.contains('wg-modal-overlay')
      ? overlayOrModal
      : overlayOrModal.closest('.wg-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Expose for manual use
  window.wgModal = { open: openModal, close: closeModal };

  // ── Alerts (dismissible) ─────────────────────────────────────
  function initAlerts() {
    on(document, 'click', e => {
      const btn = e.target.closest('.wg-alert-close');
      if (btn) {
        const alert = btn.closest('.wg-alert');
        if (alert) {
          alert.style.transition = 'opacity 0.2s';
          alert.style.opacity = '0';
          setTimeout(() => alert.classList.add('wg-alert-dismissed'), 200);
        }
      }
    });
  }

  // ── Toasts ───────────────────────────────────────────────────
  function getToastContainer() {
    let el = qs('.wg-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.className = 'wg-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  function showToast(message, { type = '', duration = 3000, icon = '' } = {}) {
    const container = getToastContainer();

    const icons = {
      success: '✓',
      danger:  '✕',
      warning: '⚠',
      '': 'ℹ',
    };

    const toast = document.createElement('div');
    toast.className = `wg-toast${type ? ' wg-toast-' + type : ''}`;
    toast.innerHTML = `
      <span class="wg-toast-icon">${icon || icons[type] || icons['']}</span>
      <span class="wg-toast-msg">${message}</span>
    `;
    container.appendChild(toast);

    const dismiss = () => {
      toast.classList.add('wg-toast-out');
      setTimeout(() => toast.remove(), 220);
    };

    setTimeout(dismiss, duration);
    on(toast, 'click', dismiss);

    return { dismiss };
  }

  // Expose globally
  window.wgToast = showToast;

  // ── Custom Checkboxes ────────────────────────────────────────
  function initCheckboxes() {
    on(document, 'click', e => {
      const box = e.target.closest('.wg-check-box');
      if (box) {
        box.classList.toggle('checked');
        const label = box.closest('.wg-check-label');
        if (label) {
          const input = label.querySelector('input[type="checkbox"]');
          if (input) input.checked = box.classList.contains('checked');
        }
        box.dispatchEvent(new CustomEvent('wg:check', {
          bubbles: true,
          detail: { checked: box.classList.contains('checked') }
        }));
      }
    });
  }

  // ── Toggle switches ──────────────────────────────────────────
  function initToggles() {
    // Native input drives the toggle; CSS handles the visual
    // But for custom .wg-toggle-track clicks:
    on(document, 'click', e => {
      const track = e.target.closest('.wg-toggle-track');
      if (track) {
        const wrapper = track.closest('.wg-toggle');
        const input   = wrapper && qs('input', wrapper);
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }

  // ── Code copy buttons ─────────────────────────────────────────
  function initCopyButtons() {
    on(document, 'click', async e => {
      const btn = e.target.closest('[data-wg-copy]');
      if (!btn) return;

      const targetSel = btn.dataset.wgCopy;
      const text = targetSel
        ? (qs(targetSel)?.textContent || '')
        : (btn.dataset.wgCopyText || '');

      if (!text) return;

      try {
        await navigator.clipboard.writeText(text.trim());
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text.trim();
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      }
    });
  }

  // ── Progress bar helper ──────────────────────────────────────
  function setProgress(barEl, value) {
    const clamped = Math.min(100, Math.max(0, value));
    if (typeof barEl === 'string') barEl = qs(barEl);
    if (barEl) {
      barEl.style.width = clamped + '%';
      const label = barEl.closest('.wg-progress-labeled')?.querySelector('.wg-progress-val');
      if (label) label.textContent = Math.round(clamped) + '%';
    }
  }
  window.wgProgress = setProgress;

  // ── Init all ─────────────────────────────────────────────────
  function init() {
    initTabs();
    initDropdowns();
    initModals();
    initAlerts();
    initCheckboxes();
    initToggles();
    initCopyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
