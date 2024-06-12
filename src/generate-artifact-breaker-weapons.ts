import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2/interfaces.js';
import { BreakerTypeHashes, ItemCategoryHashes } from '../data/generated-enums.js';
import { D2CalculatedSeason } from './generate-season-info.js';
import { writeFile } from './helpers.js';
import { infoLog, warnLog } from './log.js';

const TAG = 'ARTIFACT-BREAKER';

const currentSeasonDef = getAllDefs('Season').find((s) => s.seasonNumber === D2CalculatedSeason)!;

const breakerMods: Record<BreakerTypeHashes, ItemCategoryHashes[]> = {
  [BreakerTypeHashes.Disruption]: [],
  [BreakerTypeHashes.ShieldPiercing]: [],
  [BreakerTypeHashes.Stagger]: [],
};

const inventoryItems = getAllDefs('InventoryItem');

// First, find the seasonal artifact
const artifactVendor = inventoryItems.find(
  (i) => i.itemTypeDisplayName?.includes('Artifact') && currentSeasonDef.hash === i.seasonHash,
)!.preview!.previewVendorHash;
const artifactMods = getDef('Vendor', artifactVendor)!
  // Take the last 25 mods, since sometimes Bungie doesn't deprecate the old mods
  // Had to increase this by 10 during TFS due to additional rows being added per act in each episode
  .itemList.slice(-35)
  .map((i) => getDef('InventoryItem', i.itemHash))
  .filter((i) => i?.perks);

// Use item categories but remove a trailing s
const itemCategories = getAllDefs('ItemCategory')
  .filter((i) => i.displayProperties?.name)
  .map((cat) => [cat.hash, cat.displayProperties.name.replace(/s$/, '')] as const);

// "strong against [Disruption]", "bonus damage against [Shield-Piercing]", "stun [Shield-Piercing]"
const breakerRegex = /(?:against|stuns?) \[([\w\s-]+)\]/i;

const findBreakerPerk = (i: DestinyInventoryItemDefinition) => {
  for (const perk of i.perks) {
    const perkDef = getDef('SandboxPerk', perk.perkHash);
    const match = perkDef?.displayProperties?.description?.match(breakerRegex);
    if (match) {
      return [perkDef!, match[1]] as const;
    }
  }
};

const glyphToBreakerType: Record<string, BreakerTypeHashes> = {
  'Shield-Piercing': BreakerTypeHashes.ShieldPiercing,
  Stagger: BreakerTypeHashes.Stagger,
  Disruption: BreakerTypeHashes.Disruption,
};

for (const mod of artifactMods) {
  const breakerPerk = findBreakerPerk(mod!);
  if (breakerPerk) {
    infoLog(TAG, mod?.displayProperties.name);
    const [perkDef, breakerCat] = breakerPerk;
    const matchingCategories = itemCategories
      .filter(([, name]) => perkDef.displayProperties.description.includes(name))
      .map(([hash]) => hash);
    const breakerType = glyphToBreakerType[breakerCat];
    if (glyphToBreakerType) {
      breakerMods[breakerType].push(...matchingCategories);
    } else {
      warnLog(TAG, `artifact breaker mods: unknown breaker type ${breakerCat}`);
    }
  }
}

// If we do not have at least one of each breaker type something is wrong
if (
  breakerMods[BreakerTypeHashes.ShieldPiercing].length == 0 ||
  breakerMods[BreakerTypeHashes.Disruption].length == 0 ||
  breakerMods[BreakerTypeHashes.Stagger].length == 0
) {
  let missingType = '';
  if (breakerMods[BreakerTypeHashes.ShieldPiercing].length == 0) {
    missingType += 'Anti-Barrier ';
  }
  if (breakerMods[BreakerTypeHashes.Disruption].length == 0) {
    missingType += 'Overload ';
  }
  if (breakerMods[BreakerTypeHashes.Stagger].length == 0) {
    missingType += 'Unstoppable';
  }
  warnLog(TAG, `Missing Breaker(s): ${missingType}`);
}

writeFile('./output/artifact-breaker-weapon-types.json', breakerMods);
