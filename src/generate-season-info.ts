import { getAllDefs, loadLocal } from '@d2api/manifest-node';
import stringifyObject from 'stringify-object';
import { D2SeasonInfo } from '../data/seasons/d2-season-info-static.js';
import seasons from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import { annotate, writeFile } from './helpers.js';

loadLocal();

export const D2CalculatedSeason: number = getCurrentSeason();

const powerCaps = new Set(
  getAllDefs('PowerCap')
    .map((p) => p.powerCap)
    .filter((p) => p > 1000 && p < 50000)
    .sort((a, b) => a - b)
);

const seasonOverrides: Record<
  number,
  {
    DLCName?: string;
    seasonName?: string;
    powerFloor: number;
    softCap: number;
    powerfulCap?: number;
    pinnacleCap?: number;
    startDate?: string;
    resetTime?: string;
  }
> = {
  // prettier-ignore
  // ----===== OVERRIDE TABLE ====----
  8: { powerFloor: 750, softCap: 900, pinnacleCap: 960, DLCName: 'Shadowkeep' },
  9: { powerFloor: 750, softCap: 900, pinnacleCap: 970 },
  10: { powerFloor: 750, softCap: 950 },
  11: { powerFloor: 750, softCap: 1000, seasonName: 'Season of the Arrival' },
  12: { powerFloor: 1050, softCap: 1200, DLCName: 'Beyond Light' },
  13: { powerFloor: 1100, softCap: 1250 },
  14: { powerFloor: 1100, softCap: 1250, pinnacleCap: 1320 },
  15: { powerFloor: 1100, softCap: 1250, pinnacleCap: 1330 },
  16: { powerFloor: 1350, softCap: 1500, pinnacleCap: 1560, DLCName: 'Witch Queen' },
  17: { powerFloor: 1350, softCap: 1510, pinnacleCap: 1570 },
  18: { powerFloor: 1350, softCap: 1520, pinnacleCap: 1580 },
  19: { powerFloor: 1350, softCap: 1530, pinnacleCap: 1590 },
  20: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810, DLCName: 'Lightfall' },
  21: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
  22: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
};

// Sort seasons in numerical order for use in the below for/next
const seasonDefs = getAllDefs('Season').sort((a, b) => (a.seasonNumber > b.seasonNumber ? 1 : -1));

let seasonsMD = ``;
for (let season = 7; season < seasonDefs.length; season++) {
  const seasonNumber = seasonDefs[season].seasonNumber;
  const seasonName =
    seasonOverrides[seasonNumber]?.seasonName ?? seasonDefs[season].displayProperties.name;

  if (seasonDefs[season].redacted || seasonName.includes('[Redacted]')) {
    // If season is redacted exit early
    break;
  }

  const pinnacleCap = seasonOverrides[seasonNumber].pinnacleCap ?? getPinnacleCap(seasonNumber);
  D2SeasonInfo[seasonNumber] = {
    DLCName: seasonOverrides[seasonNumber].DLCName ?? '',
    seasonName: seasonName,
    seasonTag: seasonName.split(' ').pop()?.toLowerCase() ?? '',
    season: seasonNumber,
    maxLevel: 50,
    powerFloor: seasonOverrides[seasonNumber].powerFloor,
    softCap: seasonOverrides[seasonNumber].softCap,
    powerfulCap: pinnacleCap - 10,
    pinnacleCap: pinnacleCap,
    releaseDate:
      seasonOverrides[seasonNumber].startDate ?? seasonDefs[season].startDate?.slice(0, 10) ?? '',
    resetTime:
      seasonOverrides[seasonNumber].resetTime ?? seasonDefs[season].startDate?.slice(-9) ?? '',
    numWeeks: getNumWeeks(season),
  };
  seasonsMD += updateSeasonsMD(seasonNumber);
}

// remove '' from keys e.g. '17': => 17:
let D2SeasonInfoCleanedUp = '';
for (const [key, value] of Object.entries(D2SeasonInfo)) {
  D2SeasonInfoCleanedUp += `  ${key}: ${stringifyObject(value)},\n`;
}

const pretty = `export const D2SeasonInfo: Record<
number,
{
  DLCName: string;
  seasonName: string;
  seasonTag: string;
  season: number;
  maxLevel: number;
  powerFloor: number;
  softCap: number;
  powerfulCap: number;
  pinnacleCap: number;
  releaseDate: string;
  resetTime: string;
  numWeeks: number;
}
> = {\n${D2SeasonInfoCleanedUp}};

export const D2CalculatedSeason = ${D2CalculatedSeason};`;

const D2SeasonInfoAnnotated = annotate(pretty);
writeFile('./output/d2-season-info.ts', D2SeasonInfoAnnotated);

const inventoryItems = getAllDefs('InventoryItem');

inventoryItems.forEach((inventoryItem) => {
  const { hash } = inventoryItem;

  // Only add items not currently in db
  if (!(seasons as Record<string, number>)[hash]) {
    (seasons as Record<string, number>)[hash] = D2CalculatedSeason;
  }
});

writeFile('./data/seasons/seasons_unfiltered.json', seasons);

const seasonTags = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => seasonInfo.season > 0 && seasonInfo.seasonTag && seasonInfo.numWeeks > 0)
  .map((seasonInfo) => [seasonInfo.seasonTag, seasonInfo.season] as const)
  .reduce((acc: Record<string, number>, [tag, num]) => ((acc[tag] = num), acc), {});

writeFile('./output/season-tags.json', seasonTags);

const lightCapToSeason = Object.values(D2SeasonInfo)
  .filter((seasonInfo) => {
    const isRealSeason = seasonInfo.season > 0 && seasonInfo.season <= D2CalculatedSeason;
    // remove already used max light levels from powerCaps
    if (isRealSeason) {
      powerCaps.delete(seasonInfo.pinnacleCap);
    }
    return isRealSeason;
  })
  .reduce(
    (acc: Record<string, number>, seasonInfo) =>
      Object.assign(acc, { [seasonInfo.pinnacleCap]: seasonInfo.season }),
    {}
  );
// what's left in powerCaps is max light levels that don't apply to any season yet
// we left off at D2CalculatedSeason so we'll start adding dummy seasons at D2CalculatedSeason+1
let count = 1;
[...powerCaps].forEach((p) => {
  if (p > D2SeasonInfo[D2CalculatedSeason]?.pinnacleCap) {
    lightCapToSeason[p] = D2CalculatedSeason + count++;
  }
});
writeFile('./output/lightcap-to-season.json', lightCapToSeason);

const seasonMDInfo = {
  header: `## Seasons

| Season | Start Date | End Date    | DLC Name        | Season of    |
| :----: | ---------- | ----------- | --------------- | ------------ |
|   1    | 06SEP2017  | 04DEC2017   | Red War         |              |
|   2    | 05DEC2017  | 07MAY2018   | Curse of Osiris |              |
|   3    | 08MAY2018  | 03SEP2018   | Warmind         | Resurgence   |
|   4    | 04SEP2018  | 27NOV2018   | Forsaken        | the Outlaw   |
|   5    | 28NOV2018  | 04MAR2019   | Black Armory    | the Forge    |
|   6    | 05MAR2019  | 03JUN2019   | Joker's Wild    | the Drifter  |
|   7    | 04JUN2019  | 30SEP2019   | Penumbra        | Opulence     |`,
  footer: `\n\n- \\*denotes best guess dates`,
};

writeFile('./SEASONS.md', `${seasonMDInfo.header}${seasonsMD}${seasonMDInfo.footer}`, true);

function getCurrentSeason() {
  // Sort Seasons backwards and return the first season without "Redacted" in its name
  const seasonDefs = getAllDefs('Season').sort((a, b) =>
    a.seasonNumber > b.seasonNumber ? 1 : -1
  );
  for (let season = seasonDefs.length - 1; season > 0; season--) {
    const validSeason = !seasonDefs[season].displayProperties.name
      .toLowerCase()
      .includes('redacted');

    if (!validSeason) {
      continue;
    }
    return seasonDefs[season].seasonNumber;
  }
  return 0;
}

function getPinnacleCap(season: number) {
  return [...powerCaps][season - 10];
}

function getNumWeeks(season: number) {
  const numWeeks = Math.round(
    Math.abs(
      new Date(seasonDefs[season].endDate ?? '').getTime() -
        new Date(seasonDefs[season].startDate ?? '').getTime()
    ) / 604800000
  ); // ms in a week
  return numWeeks ? numWeeks : -1;
}

function updateSeasonsMD(seasonNumber: number) {
  const paddedSeasonNumber = `  ${D2SeasonInfo[seasonNumber].season.toString().padEnd(4)}`;
  const paddedDLCName = D2SeasonInfo[seasonNumber].DLCName.padEnd(15);
  const paddedReleaseDate = formatDateDDMMMYYYY(
    `${D2SeasonInfo[seasonNumber].releaseDate}T${D2SeasonInfo[seasonNumber].resetTime}`
  ).padEnd(10);
  const paddedEndDate = (
    seasonDefs[seasonNumber - 1].endDate
      ? formatDateDDMMMYYYY(`${seasonDefs[seasonNumber - 1].endDate}`, true)
      : generateBestGuessEndDate(seasonNumber)
  ).padEnd(11);
  const paddedSeasonName = D2SeasonInfo[seasonNumber].seasonName
    .replace('Season of ', '')
    .padEnd(12);

  return paddedReleaseDate != ''.padEnd(10)
    ? `\n| ${paddedSeasonNumber} | ${paddedReleaseDate} | ${paddedEndDate} | ${paddedDLCName} | ${paddedSeasonName} |`
    : '';
}

function formatDateDDMMMYYYY(dateString: string, dayBefore = false) {
  const date = new Date(dateString);
  const validDate = date instanceof Date && !isNaN(date.getDate());
  if (!validDate) {
    return '';
  }
  if (dayBefore) {
    date.setDate(date.getDate() - 1);
  }
  const day = date.toLocaleString('en-US', { day: '2-digit' });
  const year = date.toLocaleString('en-US', { year: 'numeric' });
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return `${day}${month}${year}`;
}

function generateBestGuessEndDate(seasonNumber: number) {
  const numWeeks = 12;
  const bestGuess = new Date(
    `${D2SeasonInfo[seasonNumber].releaseDate}T${D2SeasonInfo[seasonNumber - 1].resetTime}`
  );
  bestGuess.setDate(bestGuess.getDate() + numWeeks * 7);
  const validDate = bestGuess instanceof Date && !isNaN(bestGuess.getDate());
  return `${formatDateDDMMMYYYY(validDate ? bestGuess.toISOString() : '', true)}\\*`;
}
