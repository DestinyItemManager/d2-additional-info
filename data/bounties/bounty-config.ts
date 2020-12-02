// TODO: constants for the activity types?
// TODO: should this really be associated with the objectives, not the bounties?
// TODO: remember to use activity parent hash to light up more-general bounties. E.G. if you select Doubles, highlight all Crucible-specific stuff?

// Activity Mode hashes
export const enum ActivityModeHash {
  gambit = 1848252830,
  strike = 2394616003,
  nightfall = 3789021730,
  crucible = 1164760504,
  mayhem = 1264443021,
  control = 3199098480,
  breakthrough = 4033000329,
  countdown = 1505888634,
  elimination = 4078439804,
  doubles = 3821502017,
  supremacy = 910991990,
  rumble = 157639802,
  survival = 2239249083,
  ironBanner = 1826469369,
  dungeon = 608898761,
  nightmareHunt = 332181804,
  story = 1686739444,
  trials = 1673724806,
  explore = 3497767639,
}

const enum DestinationHash {
  EDZ = 697502628,
  Nessus = 3607432451,
  TangledShore = 3821439926,
  DreamingCity = 1416096592,
  Moon = 677774031,
  Europa = 1729879943,
  Cosmodrome = 3990611421,
}

// Damage hashes
// TODO: how to distinguish between arc damage, arc abilities, arc subclass, etc?
const enum DamageHash {
  solar = 1847026933,
  arc = 2303181850,
  kinetic = 3373582085,
  voidDamage = 3454344768,
  stasis = 151347233,
}

// TODO: Race/enemy hashes?

const enum KillType {
  Melee,
  Super,
  Grenade,
  Finisher,
  Precision,
  ClassAbilities,
}

export const matchTable: {
  assign: {
    ActivityMode?: number[];
    Destination?: number[];
    DamageType?: number[];
    ItemCategory?: number[];
    KillType?: KillType[];
  };
  name?: (string | RegExp)[];
  desc?: (string | RegExp)[];
  obj?: (string | RegExp)[];
  type?: (string | RegExp)[];
  vendorHashes?: number[];
}[] = [
  // ActivityMode
  {
    assign: { ActivityMode: [ActivityModeHash.gambit] },
    desc: [/gambit/i, 'The Drifter'],
    type: [/gambit/i],
  },
  {
    assign: { ActivityMode: [ActivityModeHash.strike] },
    desc: [/(?<!(?<!vanguard or )nightfall )strike/i],
  },
  { assign: { ActivityMode: [ActivityModeHash.nightfall] }, desc: [/nightfall/i] },
  {
    assign: { ActivityMode: [ActivityModeHash.crucible] },
    desc: [/crucible(?! matches in)/i],
    type: [/crucible/i],
  },
  // TODO: Roll up all crucible types into just crucible?
  { assign: { ActivityMode: [ActivityModeHash.control] }, desc: ['Control'] },
  { assign: { ActivityMode: [ActivityModeHash.mayhem] }, desc: ['Mayhem'] },
  { assign: { ActivityMode: [ActivityModeHash.breakthrough] }, desc: ['Breakthrough'] },
  { assign: { ActivityMode: [ActivityModeHash.doubles] }, desc: ['Doubles'] },
  { assign: { ActivityMode: [ActivityModeHash.supremacy] }, desc: ['Supremacy'] },
  { assign: { ActivityMode: [ActivityModeHash.countdown] }, desc: ['Countdown'] },
  { assign: { ActivityMode: [ActivityModeHash.elimination] }, desc: ['Elimination'] },
  { assign: { ActivityMode: [ActivityModeHash.rumble] }, desc: ['Rumble'] },
  { assign: { ActivityMode: [ActivityModeHash.survival] }, desc: ['Survival'] },
  { assign: { ActivityMode: [ActivityModeHash.ironBanner] }, desc: [/iron banner/i] },
  { assign: { ActivityMode: [ActivityModeHash.dungeon] }, desc: [/dungeon/i] },
  { assign: { ActivityMode: [ActivityModeHash.nightmareHunt] }, desc: ['Nightmare Hunt'] },
  { assign: { ActivityMode: [ActivityModeHash.story] }, desc: [/story mission/] },
  { assign: { ActivityMode: [ActivityModeHash.trials] }, desc: [/Trials of Osiris/i] },
  { assign: { ActivityMode: [ActivityModeHash.explore] }, name: ['WANTED:'] },

  // Destinations
  {
    assign: { Destination: [DestinationHash.EDZ] },
    desc: ['EDZ', 'European Dead Zone', 'Devrim Kay'],
  },

  { assign: { Destination: [DestinationHash.Nessus] }, desc: ['Nessus', 'Failsafe'] },
  {
    assign: { Destination: [DestinationHash.TangledShore] },
    desc: ['Tangled Shore', 'Jetsam of Saturn', 'The Spider'],
  },
  {
    assign: { Destination: [DestinationHash.DreamingCity] },
    desc: ['Dreaming City', 'Oracle Engine', /plague.+well/i, 'Petra Venj'],
    obj: [/Ascendant Challenge/i, 'Baryon Boughs'],
    vendorHashes: [1841717884],
  },
  {
    assign: { Destination: [DestinationHash.Moon] },
    desc: [/Moon(?! grant no progress)/, 'Lectern of Enchantment', 'Sanctuary'],
  },
  {
    assign: { Destination: [DestinationHash.Europa] },
    desc: ['Europa', 'Charon', 'Cadmus Ridge', 'Asterion Abyss', 'Riis-Reborn', 'Empire Hunt'],
  },
  { assign: { Destination: [DestinationHash.Cosmodrome] }, desc: ['Cosmodrome'] },

  /*                                                },

// enemyType
  { assign: { enemyType: 'Taken',                                         }, desc: [/\btaken\b/],                                                        },
  { assign: { enemyType: 'Cabal',                                         }, desc: [/\bcabal\b/],                                                        },
  { assign: { enemyType: 'Fallen',                                        }, desc: [/\bfallen\b/],                                                       },
  { assign: { enemyType: 'Scorn',                                         }, desc: [/\bscorn\b/],                                                        },
  { assign: { enemyType: 'Vex',                                           }, desc: [/\bvex\b/],                                                          },
  { assign: { enemyType: 'Hive',                                          }, desc: [/\bhive\b/],                                                         },
  { assign: { enemyType: 'Guardians',                                     }, desc: ['guardians are worth',
                                                                                   /(defeat|opposing|enemy|other) guardians/],   },
  { assign: { enemyType: 'Minibosses',                                    }, desc: ['minibosses'],                                                       },
  { assign: { enemyType: 'Bosses',                                        }, desc: [/(?<!mini)bosses/],                                                  },
  { assign: { enemyType: 'HVT',                                           }, desc: ['high-value targets'],                                               },
*/

  {
    assign: {
      DamageType: [DamageHash.solar],
    },
    desc: ['Solar'],
  },
  {
    assign: {
      DamageType: [DamageHash.arc],
    },
    desc: ['Arc'],
  },
  {
    assign: {
      DamageType: [DamageHash.voidDamage],
    },
    desc: ['Void'],
  },
  {
    assign: {
      DamageType: [DamageHash.kinetic],
    },
    desc: ['Kinetic'],
  },
  {
    assign: {
      DamageType: [DamageHash.stasis],
    },
    desc: ['Stasis'],
  },

  // Item Category
  { assign: { ItemCategory: [5] }, desc: ['Auto Rifle'], obj: ['Auto Rifle'] },
  { assign: { ItemCategory: [3317538576] }, desc: ['Bow'], obj: ['Bow'] },
  { assign: { ItemCategory: [9] }, desc: [/(?<!Linear )Fusion Rifle/], obj: ['[Fusion Rifle]'] },
  {
    assign: { ItemCategory: [153950757] },
    desc: ['Grenade Launcher'],
    obj: ['Grenade Launcher'],
  },
  { assign: { ItemCategory: [6] }, desc: ['Hand Cannon'], obj: ['Hand Cannon'] },
  {
    assign: { ItemCategory: [1504945536] },
    desc: ['Linear Fusion Rifle'],
    obj: ['Linear Fusion Rifle'],
  },
  { assign: { ItemCategory: [12] }, desc: ['Machine Gun'], obj: ['Machine Gun'] },
  { assign: { ItemCategory: [7] }, desc: ['Pulse Rifle'], obj: ['Pulse Rifle'] },
  { assign: { ItemCategory: [13] }, desc: ['Rocket Launcher'], obj: ['Rocket Launcher'] },
  { assign: { ItemCategory: [3954685534] }, desc: ['[SMG]', 'Submachine Gun'], obj: ['[SMG]'] },
  { assign: { ItemCategory: [8] }, desc: ['Scout Rifle'], obj: ['Scout Rifle'] },
  { assign: { ItemCategory: [11] }, desc: ['Shotgun'], obj: ['Shotgun'] },
  { assign: { ItemCategory: [14] }, desc: ['Sidearm'], obj: ['Sidearm'] },
  { assign: { ItemCategory: [10] }, desc: ['Sniper Rifle'], obj: ['Sniper Rifle'] },
  { assign: { ItemCategory: [54] }, desc: ['Sword'], obj: ['Sword'] },
  { assign: { ItemCategory: [2489664120] }, desc: ['Trace Rifle'], obj: ['Trace Rifle'] },

  // Kill Type
  {
    assign: { KillType: [KillType.Super] },
    desc: [/(?<!Cast your )Super/],
    obj: [/(?<!Cast your )Super/],
  },
  { assign: { KillType: [KillType.Finisher] }, desc: [/finisher/i], obj: [/finisher/i] },
  {
    assign: { KillType: [KillType.Grenade] },
    desc: [/grenade(?! launcher)/i],
    obj: [/grenade(?! launcher)/i],
  },
  { assign: { KillType: [KillType.Melee] }, desc: [/melee/i], obj: [/melee/i] },
  { assign: { KillType: [KillType.Precision] }, desc: [/precision/i], obj: [/precision/i] },
  {
    assign: { KillType: [KillType.ClassAbilities] },
    desc: [/class abilities/i],
    obj: [/class abilities/i],
  },
];
