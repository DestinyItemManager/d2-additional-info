// TODO: constants for the activity types?
// TODO: should this really be associated with the objectives, not the bounties?
// TODO: remember to use activity parent hash to light up more-general bounties. E.G. if you select Doubles, highlight all Crucible-specific stuff?

// Activity Mode hashes
const gambit = 1848252830;
const gambitPrime = 1418469392;
const strike = 2394616003;
const nightfall = 3789021730;
const crucible = 1164760504;
const mayhem = 1264443021;
const control = 3199098480;
const breakthrough = 4033000329;
const doubles = 3821502017;
const supremacy = 910991990;
const ironBanner = 1826469369;
const menagerie = 400075666;
const forge = 803838459;
const reckoning = 3894474826;
const sundial = 2319502047;
const dungeon = 608898761;

// Place hashes
// TODO: map out what activities have places by inverting the activity table?
const cruciblePlace = 4088006058;

// Damage hashes
// TODO: how to distinguish between arc damage, arc abilities, arc subclass, etc?
const solar = 1847026933;
const arc = 2303181850;
const kinetic = 3373582085;
const voidDamage = 3454344768;

// Weapon hashes (item category)

// Race/enemy hashes?

module.exports.matchTable = [
  // ActivityMode
  { assign: { ActivityMode: [gambit] }, desc: [/gambit(?! prime)/i] },
  { assign: { ActivityMode: [gambitPrime] }, desc: [/gambit prime/i] },
  { assign: { ActivityMode: [strike] }, desc: [/strike/i] },
  { assign: { ActivityMode: [strike, nightfall] }, desc: [/nightfall/i] },
  { assign: { ActivityMode: [crucible] }, desc: [/crucible/i] },
  { assign: { ActivityMode: [control] }, desc: ['Control'] },
  { assign: { ActivityMode: [mayhem] }, desc: ['Mayhem'] },
  { assign: { ActivityMode: [breakthrough] }, desc: ['Breakthrough'] },
  { assign: { ActivityMode: [doubles] }, desc: ['Doubles'] },
  { assign: { ActivityMode: [supremacy] }, desc: ['Supremacy'] },

  { assign: { ActivityMode: [forge] }, desc: [/ignition/i, /black armory forge/i, /a forge/i] },
  { assign: { ActivityMode: [menagerie] }, desc: [/menagerie/i] },
  { assign: { ActivityMode: [reckoning] }, desc: [/reckoning/i] },
  { assign: { ActivityMode: [ironBanner] }, desc: [/iron banner/i] },
  { assign: { ActivityMode: [sundial] }, desc: ['Sundial'] },
  { assign: { ActivityMode: [dungeon] }, desc: [/dungeon/i] },
  { assign: { ActivityMode: [332181804] }, desc: ['Nightmare Hunt'] },
  { assign: { ActivityMode: [147238405, 1299744814, 2201105581, 1686739444] }, desc: [/story/] },
  {
    assign: { ActivityMode: [2043403989], Place: [2877881518] },
    name: ['which witch', 'keep out', 'forever fight', 'strength of memory']
  },
  {
    assign: { ActivityMode: [2043403989], Place: [0] },
    name: ['hold the line', 'to each their own', 'all for one, one for all']
  },
  {
    assign: { ActivityMode: [2043403989], Place: [2096719558] },
    name: ['limited blessings', 'total victory', 'with both hands']
  },

  // Places
  { assign: { Place: [3747705955] }, desc: ['EDZ', 'European Dead Zone', 'Devrim Kay'] },
  {
    assign: { Place: [2426873752] },
    desc: ['Mars', 'latent memories', 'escalation protocol', 'Ana Bray']
  },
  { assign: { Place: [1259908504] }, desc: ['Mercury', 'Brother Vance'] },
  { assign: { Place: [386951460] }, desc: ['Titan', 'Sloane'] },
  { assign: { Place: [3526908984] }, desc: ['Nessus', 'Failsafe'] },
  { assign: { Place: [4251857532] }, desc: [/\bIo\b/, 'Asher Mir'], vendorHashes: [3982706173] },
  { assign: { Place: [975684424] }, desc: ['Tangled Shore', 'Jetsam of Saturn', 'The Spider'] },
  {
    assign: { Place: [2877881518] },
    desc: ['Dreaming City', 'Oracle Engine', /plague.+well/i],
    obj: [/Ascendant Challenge/i, 'Baryon Boughs'],
    vendorHashes: [1841717884]
  },
  { assign: { Place: [3325508439] }, desc: ['Moon', 'Eris Morn'] },
  { assign: { Place: [1259908504] }, desc: ['Haunted Forest'] },

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
      DamageType: [solar]
    },
    desc: ['Solar']
  },
  {
    assign: {
      DamageType: [arc]
    },
    desc: ['Arc']
  },
  {
    assign: {
      DamageType: [voidDamage]
    },
    desc: ['Void']
  },
  {
    assign: {
      DamageType: [kinetic]
    },
    desc: ['Kinetic']
  },

  // Item Category
  { assign: { ItemCategory: [5] }, desc: ['[Auto Rifle]'], obj: ['[Auto Rifle]'] },
  { assign: { ItemCategory: [3317538576] }, desc: ['[Bow]'], obj: ['[Bow]'] },
  { assign: { ItemCategory: [9] }, desc: ['[Fusion Rifle]'], obj: ['[Fusion Rifle]'] },
  {
    assign: { ItemCategory: [153950757] },
    desc: ['[Grenade Launcher]'],
    obj: ['[Grenade Launcher]']
  },
  { assign: { ItemCategory: [6] }, desc: ['[Hand Cannon]'], obj: ['[Hand Cannon]'] },
  {
    assign: { ItemCategory: [1504945536] },
    desc: ['[Linear Fusion Rifle]'],
    obj: ['[Linear Fusion Rifle]']
  },
  { assign: { ItemCategory: [12] }, desc: ['[Machine Gun]'], obj: ['[Machine Gun]'] },
  { assign: { ItemCategory: [7] }, desc: ['[Pulse Rifle]'], obj: ['[Pulse Rifle]'] },
  { assign: { ItemCategory: [13] }, desc: ['[Rocket Launcher]'], obj: ['[Rocket Launcher]'] },
  { assign: { ItemCategory: [3954685534] }, desc: ['[SMG]'], obj: ['[SMG]'] },
  { assign: { ItemCategory: [8] }, desc: ['[Scout Rifle]'], obj: ['[Scout Rifle]'] },
  { assign: { ItemCategory: [11] }, desc: ['[Shotgun]'], obj: ['[Shotgun]'] },
  { assign: { ItemCategory: [14] }, desc: ['[Sidearm]'], obj: ['[Sidearm]'] },
  { assign: { ItemCategory: [10] }, desc: ['[Sniper Rifle]'], obj: ['[Sniper Rifle]'] },
  { assign: { ItemCategory: [54] }, desc: ['[Sword]', 'Swords'], obj: ['[Sword]'] },
  { assign: { ItemCategory: [2489664120] }, desc: ['[Trace Rifle]'], obj: ['[Trace Rifle]'] }
];
