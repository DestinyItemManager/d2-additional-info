import { getAllDefs, getDef, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2/interfaces.js';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import seasons from '../data/seasons/seasons_unfiltered.json' assert { type: 'json' };
import { diffArrays, uniqAndSortArray, writeFile } from './helpers.js';
loadLocal();

const isShader = (item: DestinyInventoryItemDefinition) =>
  item.itemCategoryHashes?.includes(ItemCategoryHashes.Shaders) &&
  // Some charity shaders have watermarks that confuse our event identification
  !item.inventory?.stackUniqueLabel?.includes('charity');

// Unhelpful watermark
const IGNORED_WATERMARKS = ['/common/destiny2_content/icons/64e07aa12c7c9956ee607ccb5b3c6718.png'];
const inventoryItems = getAllDefs('InventoryItem');
const allWatermarks = getAllWatermarks();

let unassignedWatermarks = diffArrays(allWatermarks, IGNORED_WATERMARKS);

const watermarkToEvent: Record<string, number> = {};
const watermarkToSeason: Record<string, number> = {};

const eventWatermarks = generateEventWatermarks();
eventWatermarks.forEach((item) => findWatermarksForEvent(item));

findWatermarksViaSeasonPass();
unassignedWatermarks.forEach((item) => findWatermarksViaICH(item, ItemCategoryHashes.Shaders));
unassignedWatermarks.forEach((item) => findWatermarksViaICH(item, ItemCategoryHashes.Helmets));

if (unassignedWatermarks.length) {
  console.log('Unassigned Watermarks:');
  console.table(unassignedWatermarks);
}

writeFile('./data/seasons/all-watermarks.json', allWatermarks);
writeFile('./output/watermark-to-season.json', sortObjectByValue(watermarkToSeason));
writeFile('./output/watermark-to-event.json', sortObjectByValue(watermarkToEvent));

//=============================================================================
// Generate Watermarks for Seasons based off of ICH from Season
//=============================================================================
function findWatermarksViaICH(watermark: string, ICH: number) {
  const item = inventoryItems.filter((item) =>
    ICH === ItemCategoryHashes.Shaders ? isShader(item) : item.itemCategoryHashes?.includes(ICH)
  );
  const itemWithUnassignedWatermark = item.find(
    (i) =>
      i.collectibleHash &&
      (i.iconWatermark?.includes(watermark) ||
        i.quality?.displayVersionWatermarkIcons[0].includes(watermark))
  );
  const hash = itemWithUnassignedWatermark?.hash;
  const season = seasons[hash as unknown as keyof typeof seasons];
  const seasonalWatermarks = [
    itemWithUnassignedWatermark?.iconWatermark,
    itemWithUnassignedWatermark?.iconWatermarkShelved,
    itemWithUnassignedWatermark?.quality?.displayVersionWatermarkIcons[0],
    itemWithUnassignedWatermark?.quality?.displayVersionWatermarkIcons[1],
  ];

  seasonalWatermarks?.forEach((watermark) =>
    watermark ? (watermarkToSeason[watermark] = season) : undefined
  );
  // Remove watermarks that have been assigned from unassigned watermarks
  unassignedWatermarks = diffArrays(unassignedWatermarks, Object.keys(watermarkToSeason));
}

//=============================================================================
// Generate Watermarks for Events based off of Event Shaders
//=============================================================================
function findWatermarksForEvent(watermark: string) {
  const item = inventoryItems.filter(isShader);
  const itemWithUnassignedWatermark = item.find((i) => i.iconWatermark?.includes(watermark));
  const eventName = itemWithUnassignedWatermark?.inventory?.stackUniqueLabel ?? '';
  const event = eventNameToEventEnum(eventName);
  const eventWatermarks = [
    itemWithUnassignedWatermark?.iconWatermark,
    itemWithUnassignedWatermark?.iconWatermarkShelved,
  ];

  eventWatermarks?.forEach((watermark) =>
    event && watermark ? (watermarkToEvent[watermark] = event) : undefined
  );
  // Remove watermarks that have been assigned from unassigned watermarks
  unassignedWatermarks = diffArrays(unassignedWatermarks, Object.keys(watermarkToEvent));
}

function eventNameToEventEnum(eventName: string) {
  if (eventName.match(/dawning/g)) {
    return 1;
  }
  if (eventName.match(/crimson/g)) {
    return 2;
  }
  if (eventName.match(/summer|solstice/g)) {
    return 3;
  }
  if (eventName.match(/fotl/g)) {
    return 4;
  }
  if (eventName.match(/spring/g)) {
    return 5;
  }
  if (eventName.match(/ggames|revelry/g)) {
    return 6;
  }
  return 0;
}

function sortObjectByValue(obj: Record<string, number>) {
  return Object.entries(obj)
    .sort((a, b) => a[1] - b[1])
    .reduce(
      (_sortedObj, [k, v]) => ({
        ..._sortedObj,
        [k]: v,
      }),
      {}
    );
}

//=============================================================================
// Generate list of all Watermarks [except for from mods (e.g. Masterworks)]
//=============================================================================
function getAllWatermarks() {
  const itemsNoMods = inventoryItems.filter(
    (item) => !item.itemCategoryHashes?.includes(ItemCategoryHashes.Mods_Mod)
  );

  return uniqAndSortArray([
    ...new Set(
      itemsNoMods
        .map((item) => item.quality?.displayVersionWatermarkIcons.concat(item.iconWatermark))
        .flat()
        .filter(Boolean)
        .concat(
          itemsNoMods
            .map((item) => item.iconWatermarkShelved)
            .flat()
            .filter(Boolean)
        )
    ),
  ]);
}

//=============================================================================
// Generate Watermarks for Seasons based off of Season Pass Rewards
//=============================================================================
function findWatermarksViaSeasonPass() {
  const seasonDefs = getAllDefs('Season').sort((a, b) =>
    a.seasonNumber > b.seasonNumber ? 1 : -1
  );

  for (let season = 6; season < seasonDefs.length; ++season) {
    if (seasonDefs[season].displayProperties.name.includes('[Redacted]')) {
      break;
    }
    const rewardDef = getDef(
      'Progression',
      getDef('SeasonPass', seasonDefs[season].seasonPassHash)?.rewardProgressionHash
    )?.rewardItems.map((item) => getDef('InventoryItem', item.itemHash))[0];

    const seasonalWatermarks = [
      rewardDef?.iconWatermark,
      rewardDef?.iconWatermarkShelved,
      rewardDef?.quality?.displayVersionWatermarkIcons[0],
      rewardDef?.quality?.displayVersionWatermarkIcons[1],
    ];

    seasonalWatermarks?.forEach((watermark) =>
      watermark ? (watermarkToSeason[watermark] = season) : undefined
    );
  }
  // Remove watermarks that have been assigned from unassigned watermarks
  unassignedWatermarks = diffArrays(unassignedWatermarks, Object.keys(watermarkToSeason));
}

function generateEventWatermarks() {
  const eventShaders = inventoryItems.filter(
    (item) =>
      isShader(item) &&
      item.inventory?.stackUniqueLabel?.match(
        /(events.(dawning|crimson|fotl|ggames))|(silver.(spring|summer|solstice|revelry))/g
      )
  );
  return [
    ...new Set(
      eventShaders
        .map((item) => item.iconWatermark)
        .flat()
        .filter(Boolean)
    ),
  ];
}
