import fonts from '@hayes0724/web-font-converter/src/lib/fonts.js';
import { loadSync } from 'opentype.js';
import { writeFile } from './helpers.js';

const font = loadSync('./Destiny-2-Font-Symbols/fonts/Destiny_Keys.otf');
const acc: Record<string, number> = {};

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  if (glyph.name && glyph.unicode) {
    acc[glyph.name] = glyph.unicode;
  }
}

const outputEnum = `export const enum FontGlyphs {${Object.entries(acc)
  .filter(([, value]) => typeof value === 'number')
  .sort(([, num1], [, num2]) => num1 - num2)
  .map(([label, value]) => `${label.replace(/[^\w]/g, '_')} = ${value},`)
  .join('\n')}}`;

writeFile('./data/d2-font-glyphs.ts', outputEnum);

fonts.ttf.convert.woff2(
  './Destiny-2-Font-Symbols/fonts/Destiny_Keys.otf',
  './output/DestinySymbols.woff2',
);
