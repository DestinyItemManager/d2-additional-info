import { parse } from 'opentype.js';
import { webfont } from 'webfont';
import { writeFile, toArrayBuffer } from './helpers.js';
import { infoLog } from './log.js';
import fse from 'fs-extra';

const { writeFileSync } = fse;
const acc: Record<string, number> = {};
const TAG = 'CUSTOM-GLYPHS';

const svgFont = await webfont({
  files: './DIM-custom-font/SVGs/',
  fontName: 'DIM-Symbols',
  prependUnicode: true,
  startUnicode: 0xf0000,
  centerHorizontally: true,
  fontHeight: '960',
  descent: '150',
});

const font = parse(toArrayBuffer(svgFont.woff!));

// Generate font format to be used by DIM
if (svgFont.woff2) {
  const woff2File = './output/DIMSymbols.woff2';
  writeFileSync(woff2File, svgFont.woff2);
  infoLog(TAG, `${woff2File} saved.`);
}

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  if (glyph.name && glyph.unicode) {
    acc[glyph.name] = glyph.unicode;
  }
}

const outputEnum = `export const enum DimCustomSymbols {${Object.entries(acc)
  .filter(([, value]) => typeof value === 'number')
  .sort(([, num1], [, num2]) => num1 - num2)
  .map(([label, value]) => `${label.replace(/[^\w]/g, '_')} = ${value},`)
  .join('\n')}}`;

writeFile('./output/dim-custom-symbols.ts', outputEnum);
writeFile('./data/dim-custom-symbols.ts', outputEnum);
