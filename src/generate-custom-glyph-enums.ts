import fonts from '@hayes0724/web-font-converter/src/lib/fonts.js';
import { loadSync } from 'opentype.js';
import { webfont } from 'webfont';
import { writeFile } from './helpers.js';

const acc: Record<string, number> = {};

webfont({
  files: './DIM-custom-font/SVGs/',
  dest: './DIM-custom-font/',
  fontName: 'DIM-Symbols',
  prependUnicode: true,
  startUnicode: 0xf0000,
  centerHorizontally: true,
  fontHeight: '960',
  descent: '150',
})
  .then((result) => {
    // Writes buffer into .svg font file for other conversions
    writeFile('./DIM-custom-font/DIM-Symbols.svg', result.svg);
    // loadSync requires .otf or .woff filetype for enumeration
    fonts.svg.convert.woff(
      './DIM-custom-font/DIM-Symbols.svg',
      './DIM-custom-font/DIM-Symbols.woff',
    );
    // Generate font format to be used by DIM
    fonts.ttf.convert.woff2('./DIM-custom-font/DIM-Symbols.ttf', './output/DIMSymbols.woff2');

    const font = loadSync('./DIM-custom-font/DIM-Symbols.woff');

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
  })
  .catch((error) => {
    throw error;
  });
