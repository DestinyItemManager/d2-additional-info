import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { ItemCategoryHashes, SocketCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

loadLocal();

const inventoryItems = getAll('DestinyInventoryItemDefinition');

const extendedFoundry = {} as Record<number, string>;

const excludedOriginTraitInitialHashes = [] as number[]; // Add excluded Origin Traits here
const originTraitSocketCategoryHash = 3993098925;

const foundryInfo = {
  hakke: {
    traitHash: 2210483526,
    originTraitHash: 1607056502,
    icon: '',
  },
  omolon: {
    traitHash: 192828432,
    originTraitHash: 2839173408,
    icon: '',
  },
  suros: {
    traitHash: 3690635686,
    originTraitHash: 4008116374,
    icon: '',
  },
  veist: {
    traitHash: 963390771,
    originTraitHash: 3988215619,
    icon: '',
  },
} as Record<string, { traitHash: number; originTraitHash: number; icon: string }>;

const foundries = Object.keys(foundryInfo);
const foundryOriginTraitHashes = Object.values(foundryInfo).map(
  (foundry) => foundry.originTraitHash
);

const foundryItems = inventoryItems.filter(
  (item) => item.traitIds?.some((trait) => trait.startsWith('foundry')) && item.secondaryIcon
);

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
        item.secondaryIcon !== foundryInfo[foundry].icon
    )
    .map((i) => i.hash);

  foundryIconMismatchHashes.forEach(function (hash) {
    setExtendedFoundryInfo(hash, foundry);
  });

  // Overwrite any traitId info with Origin Trait info if it exists

  inventoryItems.filter(
    (item) =>
      item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
      !item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) &&
      item.sockets?.socketEntries.find((socket) => {
        if (
          [SocketCategoryHashes.IntrinsicTraits, originTraitSocketCategoryHash].includes(
            socket.socketTypeHash
          ) &&
          !excludedOriginTraitInitialHashes.includes(socket.singleInitialItemHash)
        ) {
          const hash = item.hash;
          const foundryOriginTrait =
            get('DestinyPlugSetDefinition', socket.reusablePlugSetHash)
              ?.reusablePlugItems.map((i) => i.plugItemHash)
              .filter((hashes) => foundryOriginTraitHashes.includes(hashes)) ?? [];

          if (foundryOriginTraitHashes.includes(foundryOriginTrait[0])) {
            const foundry =
              Object.keys(foundryInfo).find(
                (foundry) => foundryInfo[foundry].originTraitHash === foundryOriginTrait[0]
              ) ?? '';

            if (
              item.secondaryIcon !== foundryInfo[foundry].icon ||
              !item.traitIds.includes(`foundry.${foundry}`) ||
              !item.traitHashes.includes(foundryInfo[foundry].traitHash)
            ) {
              setExtendedFoundryInfo(hash, foundry);
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

  const count = {} as Record<string, number>;
  foundryIcon.forEach(function (i) {
    count[i] = (count[i] || 0) + 1;
  });
  const mostLikelyIcon = Math.max(...Object.values(count));

  for (const [key, value] of Object.entries(count)) {
    if (Number(value) === mostLikelyIcon) {
      foundryInfo[foundry].icon = key;
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
    setExtendedFoundryInfo(hash, foundry);
  });
}

function setExtendedFoundryInfo(hash: number, foundry: string) {
  extendedFoundry[hash] = `foundry.${foundry}`;
}
