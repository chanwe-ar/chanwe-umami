import { colord } from 'colord';
import { THEME_COLORS } from '@/lib/constants';

export function hex6(str: string) {
  let h = 0x811c9dc5; // FNV-1a 32-bit offset
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h >>> 0) * 0x01000193; // FNV prime
  }
  // use lower 24 bits; pad to 6 hex chars
  return ((h >>> 0) & 0xffffff).toString(16).padStart(6, '0');
}

export const pick = (num: number, arr: any[]) => {
  return arr[num % arr.length];
};

export function clamp(num: number, min: number, max: number) {
  return num < min ? min : num > max ? max : num;
}

export function hex2RGB(color: string, min: number = 0, max: number = 255) {
  const c = color.replace(/^#/, '');
  const diff = max - min;

  const normalize = (num: number) => {
    return Math.floor((num / 255) * diff + min);
  };

  const r = normalize(parseInt(c.substring(0, 2), 16));
  const g = normalize(parseInt(c.substring(2, 4), 16));
  const b = normalize(parseInt(c.substring(4, 6), 16));

  return { r, g, b };
}

export function rgb2Hex(r: number, g: number, b: number, prefix = '') {
  return `${prefix}${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export function getPastel(color: string, factor: number = 0.5, prefix = '') {
  let { r, g, b } = hex2RGB(color);

  r = Math.floor((r + 255 * factor) / (1 + factor));
  g = Math.floor((g + 255 * factor) / (1 + factor));
  b = Math.floor((b + 255 * factor) / (1 + factor));

  return rgb2Hex(r, g, b, prefix);
}

export function getColor(seed: string, min: number = 0, max: number = 255) {
  const color = hex6(seed);
  const { r, g, b } = hex2RGB(color, min, max);

  return rgb2Hex(r, g, b);
}

export function getThemeColors(theme: string) {
  const { primary, text, line, fill } = THEME_COLORS[theme];
  const primaryColor = colord(THEME_COLORS[theme].primary);
  // CHANWE: views draw in the slate secondary so the orange visitors read on top.
  const secondaryColor = colord(THEME_COLORS[theme].secondary);

  return {
    colors: {
      theme: {
        ...THEME_COLORS[theme],
      },
      chart: {
        text,
        line,
        views: {
          hoverBackgroundColor: secondaryColor.alpha(0.7).toRgbString(),
          backgroundColor: secondaryColor.alpha(0.4).toRgbString(),
          borderColor: secondaryColor.alpha(0.7).toRgbString(),
          hoverBorderColor: secondaryColor.toRgbString(),
        },
        // CHANWE: the orange at near full strength; at 0.6 it washes to salmon.
        visitors: {
          hoverBackgroundColor: primaryColor.toRgbString(),
          backgroundColor: primaryColor.alpha(0.9).toRgbString(),
          borderColor: primaryColor.alpha(0.9).toRgbString(),
          hoverBorderColor: primaryColor.toRgbString(),
        },
      },
      map: {
        baseColor: primary,
        fillColor: fill,
        strokeColor: primary,
        hoverColor: primary,
      },
    },
  };
}
