import { getAllDefs, getDef } from '@d2api/manifest-node';
import type {
  DestinyInventoryItemDefinition,
  DestinyItemSocketEntryDefinition,
  DestinyRecordDefinition,
} from 'bungie-api-ts/destiny2';
import { DestinyItemType, TierType } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes } from '../data/generated-enums.js';
import { writeFile } from './helpers.js';
import { infoLog } from './log.js';

const TAG = 'CATALYST-DATA';

// PlugUiStyles.Masterwork — single-catalyst plug items carry this style
const MASTERWORK_PLUG_STYLE = 1;
// uiPlugLabel on the legacy auto-apply catalyst dummies
const CATALYST_PLUG_LABEL = 'masterwork_interactable';
// generic empty exotic catalyst socket, skipped when scanning a weapon's sockets
const EMPTY_CATALYST_SOCKET = 1649663920;

// Records whose manifest catalyst icon is unusable — fall back to the weapon's
// own icon. Osteo Striga's catalyst icon is non-standard; DIM curates an override.
const USE_WEAPON_ICON = new Set<number>([
  494981303, // Osteo Striga Catalyst
]);

// ---------------------------------------------------------------------------
// SETUP — every exotic weapon now has a catalyst, so the weapon list is just
// all exotic weapons. We still need catalyst plug ICONS (the important output)
// and the weapon->record link.
// ---------------------------------------------------------------------------

const allInventoryItems = getAllDefs('InventoryItem');
const allSockets = getAllDefs('SocketType');

// Reissues create multiple InventoryItem defs sharing a name; collapse to one
// canonical def per weapon so the outputs don't carry duplicate hashes.
const exoticWeaponDefs = allInventoryItems.filter(
  (i) =>
    i.inventory?.tierType === TierType.Exotic &&
    i.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) &&
    i.itemType !== DestinyItemType.Dummy,
);

const exoticWeaponByName = new Map<string, DestinyInventoryItemDefinition>();
for (const w of exoticWeaponDefs) {
  const current = exoticWeaponByName.get(w.displayProperties.name);
  if (!current || preferReissue(w, current)) {
    exoticWeaponByName.set(w.displayProperties.name, w);
  }
}
const exoticWeapons = [...exoticWeaponByName.values()];

const dummyItems = allInventoryItems.filter((i) =>
  i.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies),
);

// ---------------------------------------------------------------------------
// ICON INDEXES
// - catalystIconByKey: catalyst items named "<weapon> Catalyst" with jpg artwork,
//   keyed by canonical name. Covers normal + "Edge of" catalysts. Non-dummy wins.
// - refitBlobByIcon: "<config> Refit" dummies (crafted / multi-config exotics)
//   carry weapon-specific artwork. Config NAMES repeat across weapons, so group
//   by ICON (unique per weapon) and match a weapon's whole config set to a group.
// Catalyst icons are always .jpg; png is never a valid catalyst icon.
// ---------------------------------------------------------------------------

const catalystIconByKey = new Map<string, string>();
for (const i of allInventoryItems) {
  if (!/ Catalyst$/i.test(i.displayProperties.name)) {
    continue;
  }
  const icon = i.displayProperties?.icon;
  if (!icon?.toLowerCase().endsWith('.jpg')) {
    continue;
  }
  const key = catalystKey(i.displayProperties.name);
  const isDummy = i.itemType === DestinyItemType.Dummy;
  if (!catalystIconByKey.has(key) || !isDummy) {
    catalystIconByKey.set(key, icon);
  }
}

const refitBlobByIcon = new Map<string, string>();
for (const i of dummyItems) {
  const icon = i.displayProperties.icon;
  if (!i.displayProperties.name.includes('Refit') || !icon?.toLowerCase().endsWith('.jpg')) {
    continue;
  }
  refitBlobByIcon.set(
    icon,
    `${refitBlobByIcon.get(icon) ?? ''} ${i.displayProperties.name.toLowerCase()}`,
  );
}

// ---------------------------------------------------------------------------
// RECORD INDEX — walk the Exotic Catalysts node once for the record list + name
// index (icons are resolved after the bounce, below).
// ---------------------------------------------------------------------------

const catalystRecords: DestinyRecordDefinition[] = [];
const recordsByKey = new Map<string, number>();

getDef('PresentationNode', getCatalystPresentationNodeHash())?.children.presentationNodes.forEach(
  (p) =>
    getDef('PresentationNode', p.presentationNodeHash)?.children.records.forEach((r) => {
      const record = getDef('Record', r.recordHash);
      if (!record) {
        return;
      }
      catalystRecords.push(record);
      const name = record.stateInfo?.obscuredName ?? record.displayProperties.name;
      if (name) {
        recordsByKey.set(catalystKey(name), record.hash);
      }
    }),
);

// ---------------------------------------------------------------------------
// BOUNCE — link each exotic weapon to a catalyst record (both directions kept).
// ---------------------------------------------------------------------------

const exoticWeaponHashToCatalystRecord: Record<string, number> = {};
const recordToWeapon = new Map<number, DestinyInventoryItemDefinition>();
const weaponsWithoutRecord: { hash: number; name: string }[] = [];

for (const weapon of exoticWeapons) {
  const recordHash = matchWeaponToRecord(weapon);
  if (recordHash !== undefined) {
    exoticWeaponHashToCatalystRecord[weapon.hash] = recordHash;
    recordToWeapon.set(recordHash, weapon);
  } else {
    weaponsWithoutRecord.push({ hash: weapon.hash, name: weapon.displayProperties.name });
  }
}

// ---------------------------------------------------------------------------
// ICON RESOLUTION — per record, priority: refit jpg (crafted/multi-config, beats
// the placeholder "X Catalyst" item) -> name index -> weapon-socket jpg.
// ---------------------------------------------------------------------------

const triumphData: Record<string, string> = {};
const recordsWithoutIcon: { hash: number; name: string }[] = [];

for (const record of catalystRecords) {
  const name = record.stateInfo?.obscuredName ?? record.displayProperties.name;
  const weapon = recordToWeapon.get(record.hash);

  const icon =
    (USE_WEAPON_ICON.has(record.hash) ? weapon?.displayProperties.icon : undefined) ??
    (weapon && findRefitIcon(weapon)) ??
    (name ? catalystIconByKey.get(catalystKey(name)) : undefined) ??
    (weapon && findWeaponCatalystIcon(weapon)) ??
    undefined;

  if (icon) {
    triumphData[record.hash] = icon;
  } else {
    recordsWithoutIcon.push({ hash: record.hash, name: name ?? '(classified)' });
  }
}

recordsWithoutIcon.sort((a, b) => a.name.localeCompare(b.name));
weaponsWithoutRecord.sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// LEGACY auto-apply dummy mapping (older catalyst socket system)
// ---------------------------------------------------------------------------

const dummyCatalystMapping = Object.fromEntries(
  dummyItems
    .filter((i) => i.plug?.uiPlugLabel === CATALYST_PLUG_LABEL)
    .flatMap((i) => {
      if (!i.plug?.plugCategoryHash || !i.hash) {
        return [];
      }
      const catalyst = findAutoAppliedCatalystForCatalystPCH(i.plug.plugCategoryHash);
      return catalyst ? [[i.hash, catalyst] as const] : [];
    }),
);

// ---------------------------------------------------------------------------
// WRITE OUTPUTS
// ---------------------------------------------------------------------------

infoLog(
  TAG,
  `${exoticWeapons.length} exotic weapons, ` +
    `${Object.keys(triumphData).length} record icons, ` +
    `${Object.keys(exoticWeaponHashToCatalystRecord).length} weapon->record links, ` +
    `${recordsWithoutIcon.length} records w/o icon, ${weaponsWithoutRecord.length} weapons w/o record`,
);

writeFile('./output/dummy-catalyst-mapping.json', dummyCatalystMapping);
writeFile('./output/catalyst-triumph-icons.json', triumphData);
writeFile('./output/exotic-to-catalyst-record.json', exoticWeaponHashToCatalystRecord);
writeFile('./output/catalyst-no-match.json', { recordsWithoutIcon, weaponsWithoutRecord });

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getCatalystPresentationNodeHash(): number | undefined {
  return getAllDefs('PresentationNode').find(
    (p) =>
      p.displayProperties.name === 'Exotic Catalysts' && p.children.presentationNodes.length > 1,
  )?.hash;
}

/**
 * Which of two same-named exotic defs to keep as the canonical one. Prefers the
 * collectible (acquirable) version, then the original/oldest by index. Flip the
 * index comparison if the newest reissue is wanted instead.
 */
function preferReissue(
  candidate: DestinyInventoryItemDefinition,
  current: DestinyInventoryItemDefinition,
): boolean {
  const candidateCollectible = candidate.collectibleHash ? 1 : 0;
  const currentCollectible = current.collectibleHash ? 1 : 0;
  if (candidateCollectible !== currentCollectible) {
    return candidateCollectible > currentCollectible;
  }
  return candidate.index < current.index;
}

/**
 * Canonical key for name matching across records, weapons, and catalyst items.
 * Strips a trailing " Catalyst" and a leading "The " so article/suffix
 * mismatches collapse to the same key.
 */
function catalystKey(name: string): string {
  return name
    .replace(/ Catalyst$/i, '')
    .replace(/^The /i, '')
    .trim()
    .toLowerCase();
}

function matchWeaponToRecord(weapon: DestinyInventoryItemDefinition): number | undefined {
  const name = weapon.displayProperties.name;

  // 1. weapon name == record name
  const direct = recordsByKey.get(catalystKey(name));
  if (direct !== undefined) {
    return direct;
  }

  // 2. structural: the weapon's own catalyst plug is named like the record, even
  //    when the weapon name isn't (e.g. "Khvostov 7G-0X" -> plug "Khvostov
  //    Catalyst" -> record "Khvostov Catalyst"). This is the original's plug-based
  //    link, which never compared weapon names.
  const plugName = weaponCatalystPlugName(weapon);
  if (plugName) {
    const viaPlug = recordsByKey.get(catalystKey(plugName));
    if (viaPlug !== undefined) {
      return viaPlug;
    }
  }

  // 3. weapon name appears in a record description
  return catalystRecords.find((r) => r.displayProperties?.description?.includes(name))?.hash;
}

/** Name of the "<weapon> Catalyst" plug sitting in the weapon's own sockets. */
function weaponCatalystPlugName(weapon: DestinyInventoryItemDefinition): string | undefined {
  for (const socket of weapon.sockets?.socketEntries ?? []) {
    for (const plugHash of socketPlugItemHashes(socket)) {
      const name = getDef('InventoryItem', plugHash)?.displayProperties.name;
      if (name && / Catalyst$/i.test(name)) {
        return name;
      }
    }
  }
  return undefined;
}

function socketPlugItemHashes(socket: DestinyItemSocketEntryDefinition): number[] {
  const hashes: number[] = [];
  if (socket.singleInitialItemHash) {
    hashes.push(socket.singleInitialItemHash);
  }
  for (const p of socket.reusablePlugItems ?? []) {
    hashes.push(p.plugItemHash);
  }
  for (const setHash of [socket.reusablePlugSetHash, socket.randomizedPlugSetHash]) {
    for (const p of getDef('PlugSet', setHash)?.reusablePlugItems ?? []) {
      hashes.push(p.plugItemHash);
    }
  }
  return hashes;
}

/**
 * Refit fallback for crafted / multi-config exotics. Config names repeat across
 * weapons, so disambiguate weapon-specifically:
 *  1. a refit jpg dummy sitting directly in this weapon's sockets (unique by hash)
 *  2. otherwise, the tightest icon-group whose blob contains the weapon's whole
 *     set of "…Refit" config names (a single shared name can't pick a group)
 */
function findRefitIcon(weapon: DestinyInventoryItemDefinition): string | undefined {
  const configNames = new Set<string>();
  for (const socket of weapon.sockets?.socketEntries ?? []) {
    for (const plugHash of socketPlugItemHashes(socket)) {
      const plug = getDef('InventoryItem', plugHash);
      const name = plug?.displayProperties.name;
      if (!plug || !name?.includes('Refit')) {
        continue;
      }
      if (plug.displayProperties.icon?.toLowerCase().endsWith('.jpg')) {
        return plug.displayProperties.icon;
      }
      configNames.add(name.toLowerCase());
    }
  }
  if (!configNames.size) {
    return undefined;
  }
  const names = [...configNames];
  let best: string | undefined;
  let bestLen = Infinity;
  for (const [icon, blob] of refitBlobByIcon) {
    if (blob.length < bestLen && names.every((n) => blob.includes(n))) {
      best = icon;
      bestLen = blob.length;
    }
  }
  return best;
}

/**
 * Last-resort icon source: a masterwork-style jpg catalyst plug on the weapon's
 * sockets (e.g. Two-Tailed Fox -> "Third Tail"). Skips the empty catalyst socket;
 * png is never a valid catalyst icon.
 */
function findWeaponCatalystIcon(weapon: DestinyInventoryItemDefinition): string | undefined {
  for (const socket of weapon.sockets?.socketEntries ?? []) {
    for (const plugHash of socketPlugItemHashes(socket)) {
      if (plugHash === EMPTY_CATALYST_SOCKET) {
        continue;
      }
      const plug = getDef('InventoryItem', plugHash);
      if (!plug || plug.plug?.plugStyle !== MASTERWORK_PLUG_STYLE) {
        continue;
      }
      const icon = plug.displayProperties?.icon;
      if (icon?.toLowerCase().endsWith('.jpg')) {
        return icon;
      }
    }
  }
  return undefined;
}

function findAutoAppliedCatalystForCatalystPCH(catalystPCH: number): number | undefined {
  const plug = allSockets
    .flatMap((socket) => socket.plugWhitelist || [])
    .find((plug) => plug.categoryHash === catalystPCH);

  return plug?.reinitializationPossiblePlugHashes?.[0];
}
