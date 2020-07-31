// stolen from bungie-api-ts/destiny2/interfaces
const DestinySocketCategoryStyle = {
  Unknown: 0,
  Reusable: 1,
  Consumable: 2,
  Unlockable: 3,
  Intrinsic: 4,
  EnergyMeter: 5,
  LargePerk: 6,
};
const DestinyItemType = {
  None: 0,
  Currency: 1,
  Armor: 2,
  Weapon: 3,
  Message: 7,
  Engram: 8,
  Consumable: 9,
  ExchangeMaterial: 10,
  MissionReward: 11,
  QuestStep: 12,
  QuestStepComplete: 13,
  Emblem: 14,
  Quest: 15,
  Subclass: 16,
  ClanBanner: 17,
  Aura: 18,
  Mod: 19,
  Dummy: 20,
  Ship: 21,
  Vehicle: 22,
  Emote: 23,
  Ghost: 24,
  Package: 25,
  Bounty: 26,
  Wrapper: 27,
  SeasonalArtifact: 28,
  Finisher: 29,
};
const DestinyItemSubType = {
  None: 0,
  Crucible: 1,
  Vanguard: 2,
  Exotic: 5,
  AutoRifle: 6,
  Shotgun: 7,
  Machinegun: 8,
  HandCannon: 9,
  RocketLauncher: 10,
  FusionRifle: 11,
  SniperRifle: 12,
  PulseRifle: 13,
  ScoutRifle: 14,
  Crm: 16,
  Sidearm: 17,
  Sword: 18,
  Mask: 19,
  Shader: 20,
  Ornament: 21,
  FusionRifleLine: 22,
  GrenadeLauncher: 23,
  SubmachineGun: 24,
  TraceRifle: 25,
  HelmetArmor: 26,
  GauntletsArmor: 27,
  ChestArmor: 28,
  LegArmor: 29,
  ClassArmor: 30,
  Bow: 31,
};

export const DestinySocketCategoryStyleLookup: Record<number, string> = {};
Object.entries(DestinySocketCategoryStyle).forEach(([name, num]) => {
  DestinySocketCategoryStyleLookup[num] = name;
});

export const DestinyItemTypeLookup: Record<number, string> = {};
Object.entries(DestinyItemType).forEach(([name, num]) => {
  DestinyItemTypeLookup[num] = name;
});

export const DestinyItemSubTypeLookup: Record<number, string> = {};
Object.entries(DestinyItemSubType).forEach(([name, num]) => {
  DestinyItemSubTypeLookup[num] = name;
});
