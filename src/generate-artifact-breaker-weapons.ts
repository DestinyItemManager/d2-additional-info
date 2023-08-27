import { getAllDefs, getDef, loadLocal } from '@d2api/manifest-node';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2/interfaces.js';
import { BreakerTypeHashes, ItemCategoryHashes } from '../data/generated-enums.js';
import { D2CalculatedSeason } from './generate-season-info.js';
import { writeFile } from './helpers.js';

loadLocal();

const currentSeasonDef = getAllDefs('Season').find((s) => s.seasonNumber === D2CalculatedSeason)!;

const breakerMods: Record<BreakerTypeHashes, ItemCategoryHashes[]> = {
  [BreakerTypeHashes.Disruption]: [],
  [BreakerTypeHashes.ShieldPiercing]: [],
  [BreakerTypeHashes.Stagger]: [],
};

const inventoryItems = getAllDefs('InventoryItem');

// First, find the seasonal artifact
const artifactVendor = inventoryItems.find(
  (i) => i.itemTypeDisplayName?.includes('Artifact') && currentSeasonDef.hash === i.seasonHash
)!.preview!.previewVendorHash;
const artifactMods = getDef('Vendor', artifactVendor)!
  // Take the last 25 mods, since sometimes Bungie doesn't deprecate the old mods
  .itemList.slice(-25)
  .map((i) => getDef('InventoryItem', i.itemHash))
  .filter((i) => i?.perks);

// Use item categories but remove a trailing s
const itemCategories = getAllDefs('ItemCategory')
  .filter((i) => i.displayProperties?.name)
  .map((cat) => [cat.hash, cat.displayProperties.name.replace(/s$/, '')] as const);

// "strong against [Disruption]", "bonus damage against [Shield-Piercing]", "stun [Shield-Piercing]"
const breakerRegex = /(?:against|stuns?) \[([\w\s-]+)\]/;

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
    const [perkDef, breakerCat] = breakerPerk;
    const matchingCategories = itemCategories
      .filter(([, name]) => perkDef.displayProperties.description.includes(name))
      .map(([hash]) => hash);
    const breakerType = glyphToBreakerType[breakerCat];
    if (glyphToBreakerType) {
      breakerMods[breakerType].push(...matchingCategories);
    } else {
      console.log(`artifact breaker mods: unknown breaker type ${breakerCat}`);
    }
  }
}

writeFile('./output/artifact-breaker-weapon-types.json', breakerMods);
