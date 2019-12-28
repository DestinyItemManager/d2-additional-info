// TODO: constants for the activity types?
// TODO: should this really be associated with the objectives, not the bounties?

// Activity type hashes
// TODO: just choose one representative activity
// TODO: may need to synthesize some for things like public events? ("Explore")
// TODO: need a synthetic one for crucible. Maybe make our own defs based on ActivityMode?
const gambit = 2490937569;
const gambitPrime = 1418469392;
const strike = 2884569138;
// TODO: separate thing for "playlist strike?"
const nightfall = 575572995;
const mayhem = 3517186939;
const ironBanner = 2371050408;
const menagerie = 400075666;
const explore = 3497767639;
const forge = 838603889;
const reckoning = 3005692706;

// Place hashes
// TODO: map out what activities have places by inverting the activity table?
const cruciblePlace = 4088006058;
const reckoningPlace = 4148998934;

// Damage hashes
// TODO: how to distinguish between arc damage, arc abilities, arc subclass, etc?
const solar = 1847026933;
const arc = 2303181850;
const kinetic = 3373582085;
const voidDamage = 3454344768;

// Weapon hashes (item category)

// Race/enemy hashes?

module.exports.matchTable = [
  // ActivityType
  {
    // Gambit bounties work for Gambit Prime too
    assign: { ActivityType: [gambit, gambitPrime] },
    desc: [/gambit(?! prime)/i]
  },
  {
    assign: { ActivityType: [gambitPrime] },
    desc: [/gambit prime/i]
  },
  {
    assign: { ActivityType: [strike] },
    desc: [/strike/i]
  },
  {
    assign: { ActivityType: [strike, nightfall] },
    desc: [/nightfall/i]
  },
  {
    assign: {
      ActivityType: [
        96396597,
        158362448,
        964120289,
        2394267841,
        2278747016,
        2410913661,
        2505748283,
        3252144427,
        3268478079,
        3517186939,
        4288302346
      ],
      Place: [cruciblePlace]
    },
    desc: [/crucible/i, /control/i]
  },
  {
    assign: {
      ActivityType: [mayhem],
      Place: [cruciblePlace]
    },
    desc: ['Mayhem']
  },

  { assign: { ActivityType: [forge] }, desc: [/ignition/i, /black armory forge/i] },
  { assign: { ActivityType: [menagerie] }, desc: [/menagerie/i] },
  { assign: { ActivityType: [reckoning], Place: [reckoningPlace] }, desc: [/reckoning/i] },
  { assign: { ActivityType: [ironBanner] }, desc: [/iron banner/i] },
  { assign: { ActivityType: [147238405, 1299744814, 2201105581, 1686739444] }, desc: [/story/] },
  {
    assign: { ActivityType: [2043403989], Place: [2877881518] },
    name: ['which witch', 'keep out', 'forever fight', 'strength of memory']
  },
  {
    assign: { ActivityType: [2043403989], Place: [0] },
    name: ['hold the line', 'to each their own', 'all for one, one for all']
  },
  {
    assign: { ActivityType: [2043403989], Place: [2096719558] },
    name: ['limited blessings', 'total victory', 'with both hands']
  },
  {
    assign: { ActivityType: [explore] },
    desc: [/patrols/i]
  },

  // activity??
  /*
  { assign: { Activity: [1893059148]},                                       desc: ['shattered throne'],                                                 },
*/
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
    obj: [/Ascendant Challenge/i],
    vendorHashes: [1841717884]
  },
  { assign: { Place: [1259908504] }, desc: ['Haunted Forest'] },

  //{ assign: { Place: Tower                                                }, desc: ['tower','annex'],                    wha??                           },
  //{ assign: { Place: Infinite Forest                                      }, desc: ['infinite forest'],                                                  },
  //{ assign: { Place: Anywhere                                             }, desc: ['anywhere in the system','all over the system','in any destination'] },

  /*
// damageType
  { assign: { damageType: 'Arc',                                          }, desc: [/\barc\b/],                                                          },
  { assign: { damageType: 'Void',                                         }, desc: [/\bvoid\b/],                                                         },
  { assign: { damageType: 'Solar',                                        }, desc: [/\bsolar\b/],                                                        },
  { assign: { damageType: 'Kinetic',                                      }, desc: [/\bkinetic\b/],                                                      },
  { assign: { damageType: 'Multikills',                                   }, desc: [/\bmultikills\b/],                                                   },

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

// weaponType
  { assign: { weaponType: 'Pulse Rifle',                                  }, desc: ['pulse rifle'],                                                      },
  { assign: { weaponType: 'Auto Rifle',                                   }, desc: ['auto rifle'],                                                       },
  { assign: { weaponType: 'Linear Fusion Rifle',                          }, desc: ['linear fusion rifle'],                                              },
  { assign: { weaponType: 'Fusion Rifle',                                 }, desc: [/(?<!linear )fusion rifle/],                                         },
  { assign: { weaponType: 'Trace Rifle',                                  }, desc: ['trace rifle'],                                                      },
  { assign: { weaponType: 'Bow',                                          }, desc: [/\bbows?\b/],                                                        },
  { assign: { weaponType: 'Scout Rifle',                                  }, desc: ['scout rifle'],                                                      },
  { assign: { weaponType: 'Hand Cannon',                                  }, desc: ['hand cannon'],                                                      },
  { assign: { weaponType: 'Shotgun',                                      }, desc: ['shotgun'],                                                          },
  { assign: { weaponType: 'Sniper Rifle',                                 }, desc: ['sniper rifle'],                                                     },
  { assign: { weaponType: 'Rocket Launcher',                              }, desc: [/rocke[tr] launcher/],                                               },
  { assign: { weaponType: 'SMG',                                          }, desc: ['smg','submachine gun'],                                             },
  { assign: { weaponType: 'Sidearm',                                      }, desc: ['sidearm'],                                                          },
  { assign: { weaponType: 'Grenade Launcher',                             }, desc: ['grenade launcher'],                                                 },
  { assign: { weaponType: 'Grenade',                                      }, desc: [/grenade(?! launcher)/],                                             },
  { assign: { weaponType: 'Headshot',                                     }, desc: ['headshot','precision'],                                             },
  { assign: { weaponType: 'Sword',                                        }, desc: ['sword'],                                                            },
  { assign: { weaponType: 'Machine Gun',                                  }, desc: [/(?<!sub)machine gun/],                                              },
  { assign: { weaponType: 'Melee',                                        }, desc: ['melee'],                                                            },
  { assign: { weaponType: 'Energy Weapons',                               }, desc: [/energy( or \w+)? weapon/],                                          },
  { assign: { weaponType: 'Power Weapons',                                }, desc: ['power weapon'],                                                     },
  { assign: { weaponType: 'Close Range',                                  }, desc: ['close range'],                                                      },
  { assign: { weaponType: 'Explosion',                                    }, desc: ['explosion'],                                                        },
  { assign: { weaponType: 'Orbs',                                         }, desc: ['orbs of light'],                                                    },
  { assign: { weaponType: 'Super',                                        }, desc: ['super'],                                                            },

// eventType
  { assign: { eventType: 'Patrol',                                        }, desc: ['patrol'],                                       },
  { assign: { eventType: 'Public Event',                                  }, desc: ['public event'],                                 },
  { assign: { eventType: 'Adventure',                                     }, desc: ['adventure'],                                    },
  { assign: { eventType: 'Lost Sector',                                   }, desc: ['lost sector', 'wanted: '], name: ['lost sector', 'wanted: '], },
  { assign: { eventType: 'Harvest',                                       }, desc: ['harvest','ingredients'],                        },
  { assign: { eventType: 'Bounty',                                        }, desc: ['bounties'],                                     },
  { assign: { eventType: 'Chest',                                         }, desc: ['chest','supply caches'],                        },
  { assign: { eventType: 'Blind Well',                                    }, desc: ['plague of the well','blind well'],              },
  { assign: { eventType: 'Escalation Protocol',                           }, desc: ['escalation protocol'],                          },
  { assign: { eventType: 'Ascendant Challenge',                           }, desc: ['ascendant challenge'], name: ['ascendant challenge'],       },
  { assign: { eventType: 'The Dawning',                                   }, desc: ['holiday oven'],                                 },

// requiredItems
  { assign: { requiredItems: 'blackarmory'                                }, desc: ['one black armory weapon equipped'],             },
  { assign: { requiredItems: 'fotl'                                       }, desc: ['wearing a festival of the lost mask'],          },
  { assign: { requiredItems: 'solar'                                      }, desc: ['solar subclass equipped'],                      },
  { assign: { requiredItems: 'arc'                                        }, desc: ['arc subclass equipped'],                        },
  { assign: { requiredItems: 'void'                                       }, desc: ['void subclass equipped'],                       },
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
  { assign: { ItemCategory: [54] }, desc: ['[Sword]'], obj: ['[Sword]'] },
  { assign: { ItemCategory: [2489664120] }, desc: ['[Trace Rifle]'], obj: ['[Trace Rifle]'] }
];

module.exports.requirements = {
  // subclass hashes
  arc: [1334959255, 1751782730, 2958378809],
  solar: [3105935002, 3481861797, 3635991036],
  void: [3225959819, 3382391785, 3887892656],
  // black armory weapon hashes
  blackarmory: [
    603242241,
    93253474,
    1449922174,
    2575506895,
    421573768,
    3843477312,
    3704653637,
    3211806999,
    3588934839,
    417164956
  ],
  // festival of the lost mask hashes
  fotl: [
    1138577659,
    1138577658,
    1441415180,
    1441415182,
    1441415178,
    1441415181,
    1441415179,
    1441415175,
    1441415177,
    1441415174,
    1441415176,
    1441415183
  ]
};
