import { getAllDefs } from '@d2api/manifest-node';
import seasons from 'data/seasons/seasons_unfiltered.json' with { type: 'json' };
import stringifyObject from 'stringify-object';
import { annotate, getCurrentSeason, writeFile } from './helpers.js';

export const D2CalculatedSeason: number = getCurrentSeason();

const D2SeasonInfo: Record<
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
> = {};

const powerCaps = new Set(
  getAllDefs('PowerCap')
    .map((p) => p.powerCap)
    .filter((p) => p > 1000 && p < 50000)
    .sort((a, b) => a - b),
);

const seasonOverrides: Record<
  number,
  {
    DLCName?: string;
    seasonName?: string;
    powerFloor?: number;
    softCap?: number;
    powerfulCap?: number;
    pinnacleCap?: number;
    startDate?: string;
    seasonTag?: string;
    maxLevel?: number;
  }
> = {
  1: {
    DLCName: 'Red War',
    seasonName: 'Red War',
    seasonTag: 'redwar',
    maxLevel: 20,
    powerFloor: 0,
    softCap: 285,
    powerfulCap: 300,
    pinnacleCap: 300,
    startDate: '2017-09-06T09:00:00Z',
  },
  2: {
    DLCName: 'Curse of Osiris',
    seasonName: 'Curse of Osiris',
    seasonTag: 'osiris',
    maxLevel: 25,
    powerFloor: 0,
    softCap: 320,
    powerfulCap: 330,
    pinnacleCap: 330,
    startDate: '2017-12-05T17:00:00Z',
  },
  3: {
    DLCName: 'Warmind',
    seasonName: 'Resurgence',
    seasonTag: 'warmind',
    maxLevel: 30,
    powerFloor: 0,
    softCap: 340,
    powerfulCap: 380,
    pinnacleCap: 380,
    startDate: '2018-05-08T18:00:00Z',
  },
  4: {
    DLCName: 'Forsaken',
    seasonName: 'Season of the Outlaw',
    maxLevel: 50,
    powerFloor: 0,
    softCap: 500,
    powerfulCap: 600,
    pinnacleCap: 600,
    startDate: '2018-09-04T17:00:00Z',
  },
  5: {
    DLCName: 'Black Armory',
    seasonName: 'Season of the Forge',
    maxLevel: 50,
    powerFloor: 0,
    softCap: 500,
    powerfulCap: 650,
    pinnacleCap: 650,
    startDate: '2018-11-27T17:00:00Z',
  },
  6: {
    DLCName: "Joker's Wild",
    seasonName: 'Season of the Drifter',
    maxLevel: 50,
    powerFloor: 0,
    softCap: 500,
    powerfulCap: 700,
    pinnacleCap: 700,
    startDate: '2019-03-05T17:00:00Z',
  },
  7: {
    DLCName: 'Penumbra',
    seasonName: 'Season of Opulence',
    maxLevel: 50,
    powerFloor: 0,
    softCap: 500,
    powerfulCap: 750,
    pinnacleCap: 750,
    startDate: '2019-06-04T17:00:00Z',
  },
  8: { powerFloor: 750, softCap: 900, pinnacleCap: 960, DLCName: 'Shadowkeep' },
  9: { powerFloor: 750, softCap: 900, pinnacleCap: 970 },
  10: { powerFloor: 750, softCap: 950 },
  11: {
    powerFloor: 750,
    softCap: 1000,
    powerfulCap: 1050,
    pinnacleCap: 1060,
    seasonName: 'Season of the Arrival',
  },
  12: {
    powerFloor: 1050,
    softCap: 1200,
    powerfulCap: 1250,
    pinnacleCap: 1260,
    DLCName: 'Beyond Light',
  },
  13: { powerFloor: 1100, softCap: 1250, powerfulCap: 1300, pinnacleCap: 1310 },
  14: { powerFloor: 1100, softCap: 1250, pinnacleCap: 1320 },
  15: { powerFloor: 1100, softCap: 1250, pinnacleCap: 1330 },
  16: { powerFloor: 1350, softCap: 1500, pinnacleCap: 1560, DLCName: 'Witch Queen' },
  17: { powerFloor: 1350, softCap: 1510, pinnacleCap: 1570 },
  18: { powerFloor: 1350, softCap: 1520, pinnacleCap: 1580 },
  19: { powerFloor: 1350, softCap: 1530, pinnacleCap: 1590 },
  20: { DLCName: 'Lightfall', powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
  21: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
  22: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
  23: { powerFloor: 1600, softCap: 1750, pinnacleCap: 1810 },
  24: { DLCName: 'The Final Shape', powerFloor: 1900, softCap: 1940, pinnacleCap: 2000 },
};

const MAX_PINNACLE_CAP = 2000;
const MAX_SOFT_CAP = 1940;
const MAX_POWER_FLOOR = 1900;

// Sort seasons in numerical order for use in the below for/next
const seasonDefs = getAllDefs('Season').sort((a, b) => (a.seasonNumber > b.seasonNumber ? 1 : -1));

// make seasonDef and D2SeasonInfo indexes the same
seasonDefs.splice(0, 0, seasonDefs[0]);
seasonDefs[0] = { ...seasonDefs[0], seasonNumber: 0 };

let seasonsMD = ``;

for (const season of seasonDefs) {
  if (season.seasonNumber === 0) {
    // next iteration on season 0; dupe of season 1
    continue;
  }

  const seasonNumber = season.seasonNumber;
  const seasonName = seasonOverrides[seasonNumber]?.seasonName ?? season.displayProperties.name;

  if (season.redacted || seasonName.includes('[Redacted]')) {
    // If season is redacted exit early
    break;
  }

  const pinnacleCap =
    seasonOverrides[seasonNumber]?.pinnacleCap ?? getPinnacleCap(seasonNumber) ?? MAX_PINNACLE_CAP;

  D2SeasonInfo[seasonNumber] = {
    DLCName: seasonOverrides[seasonNumber]?.DLCName ?? D2SeasonInfo[seasonNumber]?.DLCName ?? '',
    seasonName: seasonName,
    seasonTag:
      seasonOverrides[seasonNumber]?.seasonTag ?? seasonName.split(' ').pop()?.toLowerCase() ?? '',
    season: seasonNumber,
    maxLevel: seasonOverrides[seasonNumber]?.maxLevel ?? D2SeasonInfo[seasonNumber]?.maxLevel ?? 50,
    powerFloor: seasonOverrides[seasonNumber]?.powerFloor ?? MAX_POWER_FLOOR,
    softCap: seasonOverrides[seasonNumber]?.softCap ?? MAX_SOFT_CAP,
    powerfulCap: seasonOverrides[seasonNumber]?.powerfulCap ?? pinnacleCap - 10,
    pinnacleCap: pinnacleCap,
    releaseDate: (seasonOverrides[seasonNumber]?.startDate ?? season.startDate)?.slice(0, 10) ?? '',
    resetTime: (seasonOverrides[seasonNumber]?.startDate ?? season.startDate)?.slice(-9) ?? '',
    numWeeks: getNumWeeks(seasonNumber),
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
    {},
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
| :----: | ---------- | ----------- | --------------- | ------------ |`,
  footer: `\n\n- \\*denotes best guess dates`,
};

writeFile('./SEASONS.md', `${seasonMDInfo.header}${seasonsMD}${seasonMDInfo.footer}`, true);

function getPinnacleCap(seasonNumber: number) {
  return [...powerCaps][seasonNumber - 10];
}

function getNumWeeks(seasonNumber: number) {
  const msInAWeek = 604800000;
  const startDate =
    seasonOverrides[seasonNumber]?.startDate ?? seasonDefs[seasonNumber]?.startDate ?? '';
  const endDate = getEndDate(seasonNumber) ?? '';
  const numWeeks = (new Date(endDate).getTime() - new Date(startDate).getTime()) / msInAWeek;
  return numWeeks ? Math.round(numWeeks) : -1;
}

function updateSeasonsMD(seasonNumber: number) {
  const releaseDate = formatDateDDMMMYYYY(
    `${D2SeasonInfo[seasonNumber].releaseDate}T${D2SeasonInfo[seasonNumber].resetTime}`,
  );
  const endDate = formatDateDDMMMYYYY(
    getEndDate(seasonNumber) ?? generateBestGuessEndDate(seasonNumber),
    true,
  );
  const DLCName = D2SeasonInfo[seasonNumber].DLCName;
  const seasonName =
    seasonNumber < 3
      ? '' // Season 1 & 2 had no name ...
      : D2SeasonInfo[seasonNumber].seasonName.replace('Season of ', '');

  return `\n| ${seasonNumber} | ${releaseDate} | ${endDate} | ${DLCName} | ${seasonName} |`;
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
    `${D2SeasonInfo[seasonNumber].releaseDate}T${D2SeasonInfo[seasonNumber].resetTime}Z`,
  );
  bestGuess.setDate(bestGuess.getDate() + numWeeks * 7);
  const validDate = bestGuess instanceof Date && !isNaN(bestGuess.getDate());
  return `${formatDateDDMMMYYYY(validDate ? bestGuess.toISOString() : '', true)}\\*`;
}

function getEndDate(seasonNumber: number) {
  const nextSeasonNumber = seasonNumber + 1;
  return (
    seasonOverrides[nextSeasonNumber]?.startDate ??
    seasonDefs[seasonNumber]?.endDate ??
    seasonDefs[nextSeasonNumber]?.startDate
  );
}
