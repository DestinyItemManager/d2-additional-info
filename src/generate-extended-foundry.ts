import { getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const extendedFoundry = {} as Record<
  number,
  { secondaryIcon: string; traitId: string; traitHash: number }
>;

const extendedFoundryIcons = {} as Record<string, string>;

const extendedFoundryTraitHashes = {
  // Maybe generate this
  veist: 963390771,
  suros: 3690635686,
  hakke: 2210483526,
  omolon: 192828432,
} as Record<string, number>;

const foundryItems = inventoryItems.filter(
  (item) => item.traitIds?.some((trait) => trait.startsWith('foundry')) && item.secondaryIcon
);

const foundries = ['hakke', 'suros', 'veist', 'omolon'];

foundries.forEach(function (foundry) {
  getFoundryIcon(foundry);
  getMissingFoundryIcons(foundry);
});

foundries.forEach(function (foundry) {
  fixMismatchIconFoundry(foundry);
});

writeFile('./output/extended-foundry.json', extendedFoundry);

function fixMismatchIconFoundry(foundry: string) {
  const foundryIconMismatchHashes = inventoryItems
    .filter(
      (item) =>
        item.traitIds?.some((trait) => trait.startsWith(`foundry.${foundry}`)) &&
        item.secondaryIcon !== extendedFoundryIcons[foundry]
    )
    .map((i) => i.hash);

  // This is completely naive atm, it incorrectly assumes that trait is correct
  // we could make this smarter by checking Origin Traits etc
  // Omolon - Omolon Fluid Dynamics
  // Veist - Veist Stinger
  // Suros - Suros Synergy
  // Hakke - Hakke Breach Armaments

  foundryIconMismatchHashes.forEach(function (hash) {
    extendedFoundry[hash] = {
      secondaryIcon: extendedFoundryIcons[foundry],
      traitId: `foundry.${foundry}`,
      traitHash: extendedFoundryTraitHashes[foundry],
    };
  });
}

function getFoundryIcon(foundry: string) {
  const foundryIcon = foundryItems
    .filter(
      (item) =>
        item.traitIds?.some((trait) => trait.startsWith(`foundry.${foundry}`)) && item.secondaryIcon
    )
    .map((i) => i.secondaryIcon);

  let count = {} as Record<string, number>;
  foundryIcon.forEach(function (i) {
    count[i] = (count[i] || 0) + 1;
  });
  const mostLikelyIcon = Math.max(...Object.values(count));

  for (const [key, value] of Object.entries(count)) {
    if (Number(value) === mostLikelyIcon) {
      extendedFoundryIcons[foundry] = key;
    }
  }
}

function getMissingFoundryIcons(foundry: string) {
  const hashes = inventoryItems
    .filter(
      (item) =>
        item.traitIds?.some((trait) => trait.startsWith(`foundry.${foundry}`)) &&
        !item.secondaryIcon
    )
    .map((i) => i.hash);
  hashes.forEach(function (hash) {
    extendedFoundry[hash] = {
      secondaryIcon: extendedFoundryIcons[foundry],
      traitId: `foundry.${foundry}`,
      traitHash: extendedFoundryTraitHashes[foundry],
    };
  });
}
