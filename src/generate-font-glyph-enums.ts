import ttf2woff2 from 'ttf2woff2';
import { readFileSync } from 'fs';
import fse from 'fs-extra';
import { loadSync } from 'opentype.js';
import { writeFile } from './helpers.js';

const { writeFileSync } = fse;

const otfIn = readFileSync('./Destiny-2-Font-Symbols/fonts/destiny_symbols_common.otf');
const font = loadSync('./Destiny-2-Font-Symbols/fonts/destiny_symbols_common.otf');
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
writeFileSync('./output/DestinySymbols.woff2', ttf2woff2(otfIn));
