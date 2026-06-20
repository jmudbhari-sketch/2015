/**
 * widget-theme.js
 * Computes the full design token set from a single hero hue (0–360).
 * Usage:
 *   WidgetTheme.set(200);          // set by hue integer
 *   WidgetTheme.set('#1093af');    // set by hex color
 *   WidgetTheme.set('hsl(200,60%,37%)'); // set by hsl string
 *   WidgetTheme.override('--wg-btn', '#ff0000'); // override one token
 *   WidgetTheme.get();             // returns current hue
 */

const WidgetTheme = (() => {

  // ── Colour math helpers ──────────────────────────────────────

  /** Convert hex → [h, s, l] (0-360, 0-100, 0-100) */
  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0,2),16)/255;
    const g = parseInt(hex.slice(2,4),16)/255;
    const b = parseInt(hex.slice(4,6),16)/255;
    return rgbToHsl(r, g, b);
  }

  /** Parse 'hsl(H,S%,L%)' or 'hsl(H S% L%)' → [h, s, l] */
  function hslStringToHsl(str) {
    const m = str.match(/hsl\(\s*([0-9.]+)[,\s]+([0-9.]+)%[,\s]+([0-9.]+)%/i);
    if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    return null;
  }

  function rgbToHsl(r, g, b) {
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = ((g-b)/d + (g<b?6:0))/6; break;
        case g: h = ((b-r)/d + 2)/6; break;
        case b: h = ((r-g)/d + 4)/6; break;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1-l);
    const f = n => l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
    const toHex = x => Math.round(x*255).toString(16).padStart(2,'0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  /**
   * Given a hero hue + saturation + lightness,
   * compute the full token set matching the design language.
   *
   * The pattern extracted from the three apps:
   *  page-bg  → very light, desaturated, ~92% lightness, s reduced by ~55%
   *  card     → the hero color itself
   *  btn      → slightly lighter L+6, 87% opacity
   *  surface  → L+12, more saturated feel
   *  surface2 → L+20, lighter variant for tags/operators
   *  shadow   → darker D-15, s-10, 0.85–0.92 opacity (colored shadow!)
   *  art      → very dark D-30+, s-20, 0.65–0.81 opacity (watermark text)
   *  inset    → L+8 (display screen / input bg)
   */
  function computeTokens(h, s, l) {
    // Clamp saturation and lightness to useful ranges
    s = clamp(s, 20, 90);
    l = clamp(l, 20, 65);

    const pageBgS = clamp(s * 0.35, 5, 35);
    const pageBgL = clamp(92 + (50 - l) * 0.1, 87, 96);

    const shadowL  = clamp(l - 16, 8, 40);
    const shadowS  = clamp(s - 8, 15, 85);

    const artL     = clamp(l - 28, 8, 35);
    const artS     = clamp(s - 15, 10, 75);

    const btnL     = clamp(l + 6,  20, 72);
    const surfaceL = clamp(l + 14, 25, 78);
    const surface2L= clamp(l + 22, 30, 84);
    const insetL   = clamp(l + 10, 22, 75);

    // Semantic colors — fixed but slightly tinted toward hero hue
    // (a small hue shift toward hero makes them feel part of the family)
    const dangerH  = 355;
    const successH = 158;
    const warningH = 38;
    const infoH    = 205;

    return {
      // ── Page ──
      '--wg-page-bg':     `hsla(${h},${pageBgS}%,${pageBgL}%,0.97)`,

      // ── Card / Container ──
      '--wg-card':        `hsl(${h},${s}%,${l}%)`,
      '--wg-card-shadow': `3px 6px 8px -1px hsla(${h},${shadowS}%,${shadowL}%,0.88)`,

      // ── Buttons ──
      '--wg-btn':         `hsla(${h},${clamp(s+4,20,90)}%,${btnL}%,0.90)`,
      '--wg-btn-shadow':  `3px 3px 19px 0px rgba(0,0,0,0.27)`,
      '--wg-btn-hover':   `1px 1px 5px 0px rgba(0,0,0,0.27)`,
      '--wg-btn-active':  `inset 0px 0px 33px 16px rgba(0,0,0,0.27)`,

      // ── Surfaces ──
      '--wg-surface':     `hsl(${h},${clamp(s+2,20,90)}%,${surfaceL}%)`,
      '--wg-surface2':    `hsl(${h},${clamp(s-5,15,85)}%,${surface2L}%)`,
      '--wg-inset':       `hsl(${h},${clamp(s+6,20,90)}%,${insetL}%)`,
      '--wg-inset-shadow':'inset 2px 3px 9px 1px rgba(0,0,0,0.22)',

      // ── Text ──
      '--wg-text-primary':  `hsla(0,0%,100%,0.96)`,
      '--wg-text-secondary':'hsla(0,0%,100%,0.60)',
      '--wg-text-muted':    `hsla(0,0%,100%,0.38)`,
      '--wg-art':           `hsla(${h},${artS}%,${artL}%,0.72)`,  // watermark

      // ── Shadow ──
      '--wg-shadow-color':  `hsla(${h},${shadowS}%,${shadowL}%,0.88)`,

      // ── Semantic (danger, success, warning, info) ──
      '--wg-danger':   `hsl(${dangerH},65%,50%)`,
      '--wg-success':  `hsl(${successH},58%,40%)`,
      '--wg-warning':  `hsl(${warningH},90%,48%)`,
      '--wg-info':     `hsl(${infoH},60%,45%)`,

      '--wg-danger-bg':  `hsla(${dangerH},65%,50%,0.15)`,
      '--wg-success-bg': `hsla(${successH},58%,40%,0.15)`,
      '--wg-warning-bg': `hsla(${warningH},90%,48%,0.15)`,
      '--wg-info-bg':    `hsla(${infoH},60%,45%,0.15)`,

      // ── Border radii (fixed from design language) ──
      '--wg-radius-card':  '2%',
      '--wg-radius-btn':   '15%',
      '--wg-radius-wide':  '3%',
      '--wg-radius-circle':'50%',
      '--wg-radius-chip':  '15%',

      // ── Spacing scale ──
      '--wg-space-1': '4px',
      '--wg-space-2': '8px',
      '--wg-space-3': '12px',
      '--wg-space-4': '16px',
      '--wg-space-5': '24px',
      '--wg-space-6': '32px',
      '--wg-space-7': '48px',
      '--wg-space-8': '64px',

      // ── Typography scale ──
      '--wg-text-xs':  '11px',
      '--wg-text-sm':  '13px',
      '--wg-text-base':'15px',
      '--wg-text-lg':  '18px',
      '--wg-text-xl':  '22px',
      '--wg-text-2xl': '28px',
      '--wg-text-3xl': '36px',

      // ── Store raw hue for JS consumers ──
      '--wg-h': h,
      '--wg-s': s,
      '--wg-l': l,
    };
  }

  // ── Apply tokens to a root element ──────────────────────────
  let _currentH = 200, _currentS = 60, _currentL = 37;
  let _overrides = {};

  function applyTokens(tokens, root = document.documentElement) {
    for (const [k, v] of Object.entries(tokens)) {
      root.style.setProperty(k, v);
    }
    // Re-apply any user overrides on top
    for (const [k, v] of Object.entries(_overrides)) {
      root.style.setProperty(k, v);
    }
    // Also set body background
    document.body && (document.body.style.backgroundColor = tokens['--wg-page-bg']);
  }

  // ── Public API ───────────────────────────────────────────────
  function set(input, saturation, lightness) {
    let h, s, l;

    if (typeof input === 'number') {
      // Direct HSL
      h = Math.round(input) % 360;
      s = saturation !== undefined ? saturation : _currentS;
      l = lightness  !== undefined ? lightness  : _currentL;
    } else if (typeof input === 'string') {
      if (input.startsWith('#')) {
        [h, s, l] = hexToHsl(input);
      } else if (input.toLowerCase().startsWith('hsl')) {
        const parsed = hslStringToHsl(input);
        if (parsed) [h, s, l] = parsed;
        else { console.warn('WidgetTheme: could not parse', input); return; }
      } else {
        console.warn('WidgetTheme: unknown format', input); return;
      }
    } else {
      console.warn('WidgetTheme.set() expects a hue number, hex string, or hsl string'); return;
    }

    _currentH = h; _currentS = s; _currentL = l;
    const tokens = computeTokens(h, s, l);
    applyTokens(tokens);

    // Fire custom event so docs page can react
    document.dispatchEvent(new CustomEvent('wg:theme', { detail: { h, s, l, tokens } }));
    return tokens;
  }

  function get() { return { h: _currentH, s: _currentS, l: _currentL }; }

  function override(varName, value) {
    _overrides[varName] = value;
    document.documentElement.style.setProperty(varName, value);
  }

  function resetOverrides() {
    _overrides = {};
    set(_currentH, _currentS, _currentL);
  }

  function toHex() { return hslToHex(_currentH, _currentS, _currentL); }

  // Presets matching the original apps
  const presets = {
    pomodoro: () => set('#c4283e'),
    calculator: () => set('#1093af'),
    todo: () => set('hsl(100,100%,30%)'),
    indigo: () => set(240, 55, 42),
    amber:  () => set(38,  90, 45),
    rose:   () => set(340, 70, 45),
  };

  return { set, get, override, resetOverrides, toHex, presets, computeTokens, hexToHsl };
})();

// Auto-init: read --wg-hero-hue from CSS if set, else default to indigo
document.addEventListener('DOMContentLoaded', () => {
  const rootStyle = getComputedStyle(document.documentElement);
  const heroHue = rootStyle.getPropertyValue('--wg-hero-hue').trim();
  const heroHex = rootStyle.getPropertyValue('--wg-hero-hex').trim();
  const heroHsl = rootStyle.getPropertyValue('--wg-hero-hsl').trim();

  if (heroHex)       WidgetTheme.set(heroHex);
  else if (heroHsl)  WidgetTheme.set(heroHsl);
  else if (heroHue)  WidgetTheme.set(parseInt(heroHue));
  else               WidgetTheme.set(240, 55, 42); // default: indigo
});
