module.exports.matchTable = [

// location
  { assign: { location: 'EDZ',                   }, matches: ['edz','european dead zone'],                                                 test: ['desc'] },
  { assign: { location: 'Mars',                  }, matches: ['mars' ,'latent memories' ,'escalation protocol'],                           test: ['desc'] },
  { assign: { location: 'Mercury',               }, matches: ['mercury'],                                                                  test: ['desc'] },
  { assign: { location: 'Titan',                 }, matches: ['titan'],                                                                    test: ['desc'] },
  { assign: { location: 'Nessus',                }, matches: ['nessus'],                                                                   test: ['desc'] },
  { assign: { location: 'Io',                    }, matches: [/\bio\b/],                                       vendorHashes: [3982706173], test: ['desc'] },
  { assign: { location: 'Tangled Shore',         }, matches: ['tangled shore','jetsam of saturn'],                                         test: ['desc'] },
  { assign: { location: 'Dreaming City',         }, matches: ['dreaming city','Oracle Engine','plague.+well'], vendorHashes: [1841717884], test: ['desc'] },
  { assign: { location: 'Crucible',              }, matches: ['crucible','control'],                       /*vendorHashes: [3603221665],*/ test: ['desc'] },
  { assign: { location: 'Gambit',                }, matches: ['gambit'],                                                                   test: ['desc'] },
  { assign: { location: 'Strike',                }, matches: ['strike'],                                                                   test: ['desc'] },
  { assign: { location: 'Tower',                 }, matches: ['tower','annex'],                                                            test: ['desc'] },
  { assign: { location: 'Haunted Forest',        }, matches: ['haunted forest'],                                                           test: ['desc'] },
  { assign: { location: 'Verdant Forest',        }, matches: ['verdant forest'],                                                           test: ['desc'] },
  { assign: { location: 'Infinite Forest',       }, matches: ['infinite forest'],                                                          test: ['desc'] },
  { assign: { location: 'The Shattered Throne',  }, matches: ['shattered throne'],                                                         test: ['desc'] },
  { assign: { location: 'Anywhere',              }, matches: ['anywhere in the system','all over the system','in any destination'],        test: ['desc'] },
  { assign: { location: 'Gambit',                },                                                           categoryHashes: [2588263708],               },

// damageType
  { assign: { damageType: 'Arc',                 }, matches: [/\barc\b/],   test: ['desc'] },
  { assign: { damageType: 'Void',                }, matches: ['void'],       test: ['desc'] },
  { assign: { damageType: 'Solar',               }, matches: ['solar'],      test: ['desc'] },
  { assign: { damageType: 'Kinetic',             }, matches: ['kinetic'],    test: ['desc'] },
  { assign: { damageType: 'Multikills',          }, matches: ['multikills'], test: ['desc'] },

// enemyType
  { assign: { enemyType: 'Taken',                }, matches: ['taken'],                                                            test: ['desc', 'name'] },
  { assign: { enemyType: 'Cabal',                }, matches: ['cabal'],                                                            test: ['desc', 'name'] },
  { assign: { enemyType: 'Fallen',               }, matches: ['fallen'],                                                           test: ['desc', 'name'] },
  { assign: { enemyType: 'Scorn',                }, matches: ['scorn'],                                                            test: ['desc', 'name'] },
  { assign: { enemyType: 'Vex',                  }, matches: ['vex'],                                                              test: ['desc', 'name'] },
  { assign: { enemyType: 'Hive',                 }, matches: ['hive'],                                                             test: ['desc', 'name'] },
  { assign: { enemyType: 'Guardians',            }, matches: ['guardians are worth', /(defeat|opposing|enemy|other) guardians/],   test: ['desc', 'name'] },
  { assign: { enemyType: 'Minibosses',           }, matches: ['minibosses'],                                                       test: ['desc', 'name'] },
  { assign: { enemyType: 'Bosses',               }, matches: ['bosses'],                                                           test: ['desc', 'name'] },
  { assign: { enemyType: 'HVT',                  }, matches: ['high-value targets'],                                               test: ['desc', 'name'] },

// weaponType
  { assign: { weaponType: 'Pulse Rifle',         }, matches: ['pulse rifle'],                         test: ['desc']         },
  { assign: { weaponType: 'Auto Rifle',          }, matches: ['auto rifle'],                          test: ['desc']         },
  { assign: { weaponType: 'Linear Fusion Rifle', }, matches: ['linear fusion rifle'],                 test: ['desc']         },
  { assign: { weaponType: 'Fusion Rifle',        }, matches: [/(?<!linear )fusion rifle/],            test: ['desc']         },
  { assign: { weaponType: 'Trace Rifle',         }, matches: ['trace rifle'],                         test: ['desc']         },
  { assign: { weaponType: 'Rocket Launcher',     }, matches: ['rocker launcher'],                     test: ['desc']         },
  { assign: { weaponType: 'Bow',                 }, matches: [/\bbows?\b/],                           test: ['desc']         },
  { assign: { weaponType: 'Scout Rifle',         }, matches: ['scout rifle'],                         test: ['desc']         },
  { assign: { weaponType: 'Hand Cannon',         }, matches: ['hand cannon'],                         test: ['desc']         },
  { assign: { weaponType: 'Shotgun',             }, matches: ['shotgun'],                             test: ['desc']         },
  { assign: { weaponType: 'Sniper Rifle',        }, matches: ['sniper rifle'],                        test: ['desc']         },
  { assign: { weaponType: 'Rocket Launcher',     }, matches: ['rocker launcher','rocket launcher'],   test: ['desc']         },
  { assign: { weaponType: 'SMG',                 }, matches: ['smg','submachine gun'],                test: ['desc']         },
  { assign: { weaponType: 'Sidearm',             }, matches: ['sidearm'],                             test: ['desc']         },
  { assign: { weaponType: 'Grenade Launcher',    }, matches: ['grenade launcher'],                    test: ['desc']         },
  { assign: { weaponType: 'Grenade',             }, matches: [/grenade(?! launcher)/],                test: ['desc']         },
  { assign: { weaponType: 'Headshot',            }, matches: ['headshot','precision'],                test: ['desc']         },
  { assign: { weaponType: 'Sword',               }, matches: ['sword'],                               test: ['desc']         },
  { assign: { weaponType: 'Machine Gun',         }, matches: [/(?<!sub)machine gun/],                 test: ['desc']         },
  { assign: { weaponType: 'Melee',               }, matches: ['melee'],                               test: ['desc']         },
  { assign: { weaponType: 'Power Weapons',       }, matches: ['power weapons','power weapon'],        test: ['desc']         },
  { assign: { weaponType: 'Close Range',         }, matches: ['close range'],                         test: ['desc']         },
  { assign: { weaponType: 'Explosion',           }, matches: ['explosion'],                           test: ['desc']         },
  { assign: { weaponType: 'Orbs',                }, matches: ['orbs of light'],                       test: ['desc']         },
  { assign: { weaponType: 'Super',               }, matches: ['super'],                               test: ['desc']         },

// eventType
  { assign: { eventType: 'Patrol',               }, matches: ['patrol'],                              test: ['desc']         },
  { assign: { eventType: 'Public Event',         }, matches: ['public event'],                        test: ['desc']         },
  { assign: { eventType: 'Forge',                }, matches: ['forge ignition','ignition'],           test: ['desc']         },
  { assign: { eventType: 'Adventure',            }, matches: ['adventure'],                           test: ['desc']         },
  { assign: { eventType: 'Lost Sector',          }, matches: ['lost sector', 'wanted: '] ,            test: ['desc', 'name'] },
  { assign: { eventType: 'Story',                }, matches: ['story'],                               test: ['desc']         },
  { assign: { eventType: 'Harvest',              }, matches: ['harvest','ingredients'],               test: ['desc']         },
  { assign: { eventType: 'Bounty',               }, matches: ['bounties'],                            test: ['desc']         },
  { assign: { eventType: 'Chest',                }, matches: ['chest','supply caches'],               test: ['desc']         },
  { assign: { eventType: 'Blind Well',           }, matches: ['plague of the well','blind well'],     test: ['desc']         },
  { assign: { eventType: 'Escalation Protocol',  }, matches: ['escalation protocol'],                 test: ['desc']         },
  { assign: { eventType: 'Ascendant Challenge',  }, matches: ['ascendant challenge'],                 test: ['desc', 'name'] },
  { assign: { eventType: 'The Dawning',          }, matches: ['holiday oven'],                        test: ['desc']         },

// requiredItems
  { assign: { requiredItems: 'blackarmory'       }, matches: ['one black armory weapon equipped'],    test: ['desc']         },
  { assign: { requiredItems: 'fotl'              }, matches: ['wearing a festival of the lost mask'], test: ['desc']         },
  { assign: { requiredItems: 'solar'             }, matches: ['solar subclass equipped'],             test: ['desc']         },
  { assign: { requiredItems: 'arc'               }, matches: ['arc subclass equipped'],               test: ['desc']         },
  { assign: { requiredItems: 'void'              }, matches: ['void subclass equipped'],              test: ['desc']         },

// raids 
  { assign: { eventType: 'Raid', location: 'Last Wish'           }, matches: ['which witch', 'keep out', 'forever fight', 'strength of memory'], test: ['name'] },
  { assign: { eventType: 'Raid', location: 'Scourge of the Past' }, matches: ['hold the line', 'all for one, one for all', 'to each their own'], test: ['name'] },
  { assign: { eventType: 'Raid', location: 'Crown of Sorrow'     }, matches: ['limited blessings', 'total victory', 'with both hands'],          test: ['name'] },

];

module.exports.requirements = {
  // subclass hashes
  arc:  [1334959255, 1751782730, 2958378809],
  solar:  [3105935002, 3481861797, 3635991036],
  void:  [3225959819, 3382391785, 3887892656],
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
  ],
}
