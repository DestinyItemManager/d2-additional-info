import { loadSync } from 'opentype.js';
import { writeFile } from './helpers';

const font = loadSync('./data/font.otf');
const acc: Record<string, number> = {};

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  acc[glyph.name] = glyph.unicode;
}

writeFile(
  './output/d2-font-glyphs.ts',
  `export const enum FontGlyphs {${Object.entries(acc)
    .filter(([, value]) => typeof value === 'number')
    .sort(([, num1], [, num2]) => num1 - num2)
    .map(([label, value]) => `${label.replace(/[^\w]/g, '_')} = ${value},`)
    .join('\n')}}`
);
