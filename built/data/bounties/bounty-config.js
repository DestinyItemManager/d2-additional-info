'use strict';
// TODO: constants for the activity types?
// TODO: should this really be associated with the objectives, not the bounties?
// TODO: remember to use activity parent hash to light up more-general bounties. E.G. if you select Doubles, highlight all Crucible-specific stuff?
exports.__esModule = true;
// Activity Mode hashes
var gambit = 1848252830;
var gambitPrime = 1418469392;
var strike = 2394616003;
var nightfall = 3789021730;
var crucible = 1164760504;
var mayhem = 1264443021;
var control = 3199098480;
var breakthrough = 4033000329;
var countdown = 1505888634;
var elimination = 4078439804;
var doubles = 3821502017;
var supremacy = 910991990;
var rumble = 157639802;
var survival = 2239249083;
var ironBanner = 1826469369;
var menagerie = 400075666;
var forge = 803838459;
var reckoning = 3894474826;
var sundial = 2319502047;
var dungeon = 608898761;
var nightmareHunt = 332181804;
var story = 1686739444;
// Damage hashes
// TODO: how to distinguish between arc damage, arc abilities, arc subclass, etc?
var solar = 1847026933;
var arc = 2303181850;
var kinetic = 3373582085;
var voidDamage = 3454344768;
// TODO: Race/enemy hashes?
exports.matchTable = [
  // ActivityMode
  { assign: { ActivityMode: [gambit] }, desc: [/gambit(?! prime)/i], type: [/gambit/i] },
  { assign: { ActivityMode: [gambitPrime] }, desc: [/gambit prime/i] },
  { assign: { ActivityMode: [strike] }, desc: [/(?<!(?<!vanguard or )nightfall )strike/i] },
  { assign: { ActivityMode: [nightfall] }, desc: [/nightfall/i] },
  { assign: { ActivityMode: [crucible] }, desc: [/crucible(?! matches in)/i], type: [/crucible/i] },
  // TODO: Roll up all crucible types into just crucible?
  { assign: { ActivityMode: [control] }, desc: ['Control'] },
  { assign: { ActivityMode: [mayhem] }, desc: ['Mayhem'] },
  { assign: { ActivityMode: [breakthrough] }, desc: ['Breakthrough'] },
  { assign: { ActivityMode: [doubles] }, desc: ['Doubles'] },
  { assign: { ActivityMode: [supremacy] }, desc: ['Supremacy'] },
  { assign: { ActivityMode: [countdown] }, desc: ['Countdown'] },
  { assign: { ActivityMode: [elimination] }, desc: ['Elimination'] },
  { assign: { ActivityMode: [rumble] }, desc: ['Rumble'] },
  { assign: { ActivityMode: [survival] }, desc: ['Survival'] },
  { assign: { ActivityMode: [forge] }, desc: [/ignition/i, /black armory forge/i, /a forge/i] },
  { assign: { ActivityMode: [menagerie] }, desc: [/menagerie/i] },
  { assign: { ActivityMode: [reckoning] }, desc: [/reckoning/i] },
  { assign: { ActivityMode: [ironBanner] }, desc: [/iron banner/i] },
  { assign: { ActivityMode: [sundial] }, desc: ['Sundial'] },
  { assign: { ActivityMode: [dungeon] }, desc: [/dungeon/i] },
  { assign: { ActivityMode: [nightmareHunt] }, desc: ['Nightmare Hunt'] },
  { assign: { ActivityMode: [story] }, desc: [/story mission/] },
  // Places
  { assign: { Place: [3747705955] }, desc: ['EDZ', 'European Dead Zone', 'Devrim Kay'] },
  {
    assign: { Place: [2426873752] },
    desc: ['Mars', 'latent memories', 'escalation protocol', 'Ana Bray'],
  },
  {
    assign: { Place: [1259908504] },
    desc: ['Mercury', 'Vex Crossroads', 'Lighthouse', /Brother Vance(?! says)/i],
  },
  { assign: { Place: [386951460] }, desc: ['Titan', 'Sloane'] },
  { assign: { Place: [3526908984] }, desc: ['Nessus', 'Failsafe'] },
  { assign: { Place: [4251857532] }, desc: [/\bIo\b/, 'Asher Mir'], vendorHashes: [3982706173] },
  { assign: { Place: [975684424] }, desc: ['Tangled Shore', 'Jetsam of Saturn', 'The Spider'] },
  {
    assign: { Place: [2877881518] },
    desc: ['Dreaming City', 'Oracle Engine', /plague.+well/i, 'Petra Venj'],
    obj: [/Ascendant Challenge/i, 'Baryon Boughs'],
    vendorHashes: [1841717884],
  },
  { assign: { Place: [3325508439] }, desc: [/Moon(?! grant no progress)/, 'Eris Morn'] },
  { assign: { Place: [1259908504] }, desc: ['Haunted Forest'] },
  { assign: { Place: [3747705955, 3526908984] }, desc: ['Forge Saboteur'] },
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
      DamageType: [solar],
    },
    desc: ['Solar'],
  },
  {
    assign: {
      DamageType: [arc],
    },
    desc: ['Arc'],
  },
  {
    assign: {
      DamageType: [voidDamage],
    },
    desc: ['Void'],
  },
  {
    assign: {
      DamageType: [kinetic],
    },
    desc: ['Kinetic'],
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
];
