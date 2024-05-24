import { getAllDefs, getDef } from '@d2api/manifest-node';
import { ItemCategoryHashes, SocketCategoryHashes, TraitHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';

const inventoryItems = getAllDefs('InventoryItem');

const extendedFoundry: Record<number, string> = {};

const excludedOriginTraitInitialHashes: number[] = []; // Add excluded Origin Traits here
const originTraitSocketCategoryHash = 3993098925;

const foundryInfo: Record<
  string,
  { traitHash?: TraitHashes; originTraitHash: number; icon: string; regex?: RegExp }
> = {
  hakke: {
    traitHash: TraitHashes.FoundryHakke,
    originTraitHash: 1607056502, // InventoryItem "Hakke Breach Armaments"
    icon: '',
    regex: /-[A-Z]$/, // Herod-C
  },
  omolon: {
    traitHash: TraitHashes.FoundryOmolon,
    originTraitHash: 2839173408, // InventoryItem "Omolon Fluid Dynamics"
    icon: '',
    regex: /[A-Z][A-Z][0-9]$/, // Hung Jury SR4
  },
  suros: {
    traitHash: TraitHashes.FoundrySuros,
    originTraitHash: 4008116374, // InventoryItem "Suros Synergy"
    icon: '',
    regex: /-[0-9][0-9]$/, // Staccato-46
  },
  veist: {
    traitHash: TraitHashes.FoundryVeist,
    originTraitHash: 3988215619, // InventoryItem "Veist Stinger"
    icon: '',
    regex: /-[0-9][a-z][a-z]?$/, // Taipan-4fr
  },
  nadir: {
    originTraitHash: 2509860981, // InventoryItem "Nadir Focus"
    icon: '',
  },
  cassoid: {
    originTraitHash: 1050127423, // InventoryItem "Wild Card"
    icon: '',
    regex: / (IX|IV|V?I{0,3})$/, // ends with roman numerals
  },
  'field-forged': {
    traitHash: TraitHashes.FoundryFieldForged,
    originTraitHash: 43555494, // InventoryItem "Field-Tested"
    icon: '',
  },
  fotc: {
    traitHash: TraitHashes.FoundryFotc,
    originTraitHash: 0,
    icon: '',
  },
  'tex-mechanica': {
    traitHash: TraitHashes.FoundryTexMechanica,
    originTraitHash: 2437618208, // InventoryItem "Tex Balanced Stock"
    icon: '',
  },
};

const foundries = Object.keys(foundryInfo);
const foundryOriginTraitHashes = Object.values(foundryInfo).map(
  (foundry) => foundry.originTraitHash,
);

const foundryItems = inventoryItems.filter(
  (item) => item.traitIds?.some((trait) => trait.startsWith('foundry')) && item.secondaryIcon,
);

foundries.forEach(function (foundry) {
  getFoundryIcon(foundry);
  getMissingFoundryIcons(foundry);
});

foundries.forEach(function (foundry) {
  fixMismatchIconFoundry(foundry);
});

foundries.forEach(function (foundry) {
  getFoundryInfoViaRegex(foundry);
});

writeFile('./output/extended-foundry.json', extendedFoundry);

function fixMismatchIconFoundry(foundry: string) {
  const foundryIconMismatchHashes = inventoryItems
    .filter(
      (item) =>
        item.traitHashes?.includes(foundryInfo[foundry]?.traitHash ?? 0) &&
        item.secondaryIcon !== foundryInfo[foundry].icon,
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
            socket.socketTypeHash,
          ) &&
          !excludedOriginTraitInitialHashes.includes(socket.singleInitialItemHash)
        ) {
          const hash = item.hash;
          const foundryOriginTrait =
            getDef('PlugSet', socket.reusablePlugSetHash)
              ?.reusablePlugItems.map((i) => i.plugItemHash)
              .filter((hashes) => foundryOriginTraitHashes.includes(hashes)) ?? [];

          if (foundryOriginTraitHashes.includes(foundryOriginTrait[0])) {
            const foundry =
              Object.keys(foundryInfo).find(
                (foundry) => foundryInfo[foundry].originTraitHash === foundryOriginTrait[0],
              ) ?? '';

            if (
              item.secondaryIcon !== foundryInfo[foundry].icon ||
              !item.traitHashes.includes(foundryInfo[foundry]?.traitHash ?? 0)
            ) {
              setExtendedFoundryInfo(hash, foundry);
            }
          }
        }
      }),
  );
}

function getFoundryIcon(foundry: string) {
  const foundryIcon = foundryItems
    .filter(
      (item) =>
        item.traitHashes?.includes(foundryInfo[foundry]?.traitHash ?? 0) && item.secondaryIcon,
    )
    .map((i) => i.secondaryIcon);

  const count: Record<string, number> = {};
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
        item.traitHashes?.includes(foundryInfo[foundry]?.traitHash ?? 0) && !item.secondaryIcon,
    )
    .map((i) => i.hash);
  hashes.forEach(function (hash) {
    setExtendedFoundryInfo(hash, foundry);
  });
}

function setExtendedFoundryInfo(hash: number, foundry: string) {
  extendedFoundry[hash] = foundry;
}

function getFoundryInfoViaRegex(foundry: string) {
  const hashes = inventoryItems
    .filter(
      (i) =>
        i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
        !i.itemCategoryHashes.includes(ItemCategoryHashes.Dummies) &&
        i.displayProperties.name
          .replace(' (Adept)', '')
          .match(foundryInfo[foundry]?.regex ?? /blahblah/) &&
        !i.traitHashes?.includes(foundryInfo[foundry]?.traitHash ?? 0),
    )
    .map((i) => i.hash);
  hashes.forEach(function (hash) {
    setExtendedFoundryInfo(hash, foundry);
  });
}
