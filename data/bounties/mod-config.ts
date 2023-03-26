import { DamageType } from 'bungie-api-ts/destiny2';
import { ItemCategoryHashes } from '../generated-enums.js';

// TODO: could draw icons... maybe after mods get redone
export enum ModEffect {
  None = 0, // Reserve 0
  // Standardized per-weapon mods
  Finder,
  Targeting,
  Dexterity,
  Loader,
  Reserves,
  Unflinching,
  Holster,
  Scavenger,
  // More like effects that any mod can have
  Resistance,
  Super,
  ClassAbility,
  Grenade,
  Orbs,
  Finisher,
  Champion,
  // These should be based on mod type, but they can also show up in the seasonal artifact
  ChargedWithLight,
  ElementalWell,
  WarmindCell,
  ArmorCharge,
}

/** Interesting things about mods that we can't figure out from the translated defs */
export interface ModInfo {
  effects?: ModEffect[];
  weapon?: ItemCategoryHashes[]; // Should be ItemSubType?
  element?: DamageType[]; // effects arc
  // element cost
  // modslot
  // raid
  // artifact mods
}

export const matchTable: {
  assign: ModInfo;
  name?: (string | RegExp)[];
  desc?: (string | RegExp)[];
  type?: (string | RegExp)[];
}[] = [
  {
    assign: { effects: [ModEffect.Finder] },
    name: ['Finder'],
  },
  {
    assign: { effects: [ModEffect.Targeting] },
    name: ['Targeting'],
  },
  {
    assign: { effects: [ModEffect.Dexterity] },
    name: ['Dexterity'],
  },
  {
    assign: { effects: [ModEffect.Loader] },
    name: ['Loader'],
  },
  {
    assign: { effects: [ModEffect.Reserves] },
    name: ['Reserves'],
  },
  {
    assign: { effects: [ModEffect.Unflinching] },
    name: ['Unflinching'],
  },
  {
    assign: { effects: [ModEffect.Holster] },
    name: ['Holster'],
  },
  {
    assign: { effects: [ModEffect.Scavenger] },
    name: ['Scavenger'],
  },

  {
    assign: { effects: [ModEffect.Resistance] },
    name: ['Resistance'],
    desc: [/resistance/i],
  },
  {
    assign: { effects: [ModEffect.Super] },
    desc: ['Super'],
  },
  {
    assign: { effects: [ModEffect.Champion] },
    desc: ['Champion'],
  },
  {
    assign: { effects: [ModEffect.ClassAbility] },
    desc: [/class ability/i],
  },
  {
    assign: { effects: [ModEffect.Finisher] },
    desc: [/finisher/i],
  },
  {
    assign: { effects: [ModEffect.Grenade] },
    desc: [/grenade/i],
  },
  {
    assign: { effects: [ModEffect.Orbs] },
    desc: ['Orb of Power'],
  },
  {
    assign: { effects: [ModEffect.ChargedWithLight] },
    desc: ['Charged with Light'],
  },
  {
    assign: { effects: [ModEffect.WarmindCell] },
    desc: ['Warmind Cell'],
  },
  {
    assign: { effects: [ModEffect.ElementalWell] },
    desc: [/elemental well/i],
  },
  {
    assign: { effects: [ModEffect.ArmorCharge] },
    desc: ['Armor Charge'],
  },

  {
    assign: { element: [DamageType.Arc] },
    desc: ['Arc'],
  },
  {
    assign: { element: [DamageType.Thermal] },
    desc: ['Solar'],
  },
  {
    assign: { element: [DamageType.Void] },
    desc: ['Void'],
  },
  {
    assign: { element: [DamageType.Stasis] },
    desc: ['Stasis'],
  },
  {
    assign: { element: [DamageType.Kinetic] },
    desc: ['Kinetic'],
  },

  // Item Category
  {
    assign: { weapon: [ItemCategoryHashes.AutoRifle] },
    desc: ['Auto Rifle'],
  },
  { assign: { weapon: [ItemCategoryHashes.Bows] }, desc: ['Bow'] },
  {
    assign: { weapon: [ItemCategoryHashes.FusionRifle] },
    desc: [/(?<!Linear )Fusion Rifle/],
  },
  {
    assign: { weapon: [ItemCategoryHashes.GrenadeLaunchers] },
    desc: [
      /(?<!breechloaded|non-Heavy ammo|Kinetic or Energy)(a(ny)?|with|Heavy|Power)? Grenade Launcher(s)?(?!(s)? that use Special ammo)/,
    ],
  },
  {
    assign: { weapon: [-ItemCategoryHashes.GrenadeLaunchers] },
    desc: [
      /(?<!Heavy|Power)(breechloaded|non-Heavy ammo|Kinetic or Energy|a(ny)?|with)? Grenade Launcher(s)?(?!(s)? that use Heavy ammo)/,
    ],
  },
  {
    assign: { weapon: [ItemCategoryHashes.HandCannon] },
    desc: ['Hand Cannon'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.LinearFusionRifles] },
    desc: ['Linear Fusion Rifle'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.MachineGun] },
    desc: ['Machine Gun'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.PulseRifle] },
    desc: ['Pulse Rifle'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.RocketLauncher] },
    desc: ['Rocket Launcher'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.SubmachineGuns] },
    desc: ['[SMG]', 'Submachine Gun'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.ScoutRifle] },
    desc: ['Scout Rifle'],
  },
  { assign: { weapon: [ItemCategoryHashes.Shotgun] }, desc: ['Shotgun'] },
  { assign: { weapon: [ItemCategoryHashes.Sidearm] }, desc: ['Sidearm'] },
  {
    assign: { weapon: [ItemCategoryHashes.SniperRifle] },
    desc: ['Sniper Rifle'],
  },
  { assign: { weapon: [ItemCategoryHashes.Sword] }, desc: ['Sword'] },
  {
    assign: { weapon: [ItemCategoryHashes.TraceRifles] },
    desc: ['Trace Rifle'],
  },
  {
    assign: { weapon: [ItemCategoryHashes.Glaives] },
    desc: ['Glaive'],
  },
];
