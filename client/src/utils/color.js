// Small helpers for generating cover artwork: the same book always gets the same picture.

// Turns text into a repeatable number
export const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// A tiny random number generator: give it a seed and it always produces the same sequence
export const makeRng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const isHex = (value) => typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

const toRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

// Blends two colors: mix('#000000', '#ffffff', 0.5) is gray
export const mix = (a, b, amount) => {
  const from = toRgb(a);
  const to = toRgb(b);
  return `#${from.map((v, i) => Math.round(v + (to[i] - v) * amount).toString(16).padStart(2, '0')).join('')}`;
};
