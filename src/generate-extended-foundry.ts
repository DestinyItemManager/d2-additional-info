import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes, SocketCategoryHashes } from '../data/generated-enums.js';
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
  const foundryOriginTraitHashes = [1607056502, 2839173408, 3988215619, 4008116374];
  const foundryIconMismatchHashes = inventoryItems
    .filter(
      (item) =>
        item.traitIds?.some((trait) => trait.startsWith(`foundry.${foundry}`)) &&
        item.secondaryIcon !== extendedFoundryIcons[foundry]
    )
    .map((i) => i.hash);

  foundryIconMismatchHashes.forEach(function (hash) {
    extendedFoundry[hash] = {
      secondaryIcon: extendedFoundryIcons[foundry],
      traitId: `foundry.${foundry}`,
      traitHash: extendedFoundryTraitHashes[foundry],
    };
  });

  inventoryItems.filter(
    (item) =>
      item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
      !item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
      item.sockets?.socketEntries.find((socket) => {
        if ([SocketCategoryHashes.IntrinsicTraits, 3993098925].includes(socket.socketTypeHash)) {
          let foundry = '';
          const hash = item.hash;
          const foundryOriginTrait =
            get('DestinyPlugSetDefinition', socket.reusablePlugSetHash)
              ?.reusablePlugItems.map((i) => i.plugItemHash)
              .filter((hashes) => foundryOriginTraitHashes.includes(hashes)) ?? [];

          if (foundryOriginTraitHashes.includes(foundryOriginTrait[0])) {
            switch (foundryOriginTrait[0]) {
              case 1607056502:
                foundry = 'hakke';
                break;
              case 2839173408:
                foundry = 'omolon';
                break;
              case 3988215619:
                foundry = 'veist';
                break;
              case 4008116374:
                foundry = 'suros';
                break;
            }
            if (
              item.secondaryIcon !== extendedFoundryIcons[foundry] ||
              !item.traitIds.includes(`foundry.${foundry}`) ||
              !item.traitHashes.includes(extendedFoundryTraitHashes[foundry])
            ) {
              extendedFoundry[hash] = {
                secondaryIcon: extendedFoundryIcons[foundry],
                traitId: `foundry.${foundry}`,
                traitHash: extendedFoundryTraitHashes[foundry],
              };
            }
          }
        }
      })
  );
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
