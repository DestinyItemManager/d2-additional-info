module.exports.matchTable = [

// ActivityType
  { assign: { ActivityType: [2490937569,  636666746,
                                         1418469392]                      }, desc: ['gambit'],                              categoryHashes: [2588263708] },
  { assign: { ActivityType: [4110605575, 2884569138,
                             2889152536, 4164571395,
                                          575572995]                      }, desc: ['strike'],                                                           },
  { assign: { ActivityType: [96396597,    158362448,
                             964120289,  2394267841,
                             2278747016, 2410913661,
                             2505748283, 3252144427,
                             3268478079, 3517186939,
                                         4288302346], Place: [4088006058] }, desc: ['crucible','control'],                                               },
  { assign: { ActivityType: [838603889],                                  }, desc: ['ignition'],                                                         },
  { assign: { ActivityType: [400075666],                                  }, desc: ['menagerie'],                                                        },
  { assign: { ActivityType: [3005692706],             Place: [4148998934] }, desc: ['reckoning'],                                                        },
  { assign: { ActivityType: [2371050408],                                 }, desc: ['iron banner'],                                                      },
  { assign: { ActivityType: [575572995],                                  }, desc: ['nightfall'],                                                        },
  { assign: { ActivityType: [147238405,  1299744814,
                             2201105581, 1686739444],                     }, desc: ['story'],                                                            },
  { assign: { ActivityType: [2043403989],             Place: [2877881518] }, name: ['which witch', 'keep out',
                                                                                    'forever fight', 'strength of memory'],                              },
  { assign: { ActivityType: [2043403989],             Place: [0]          }, name: ['hold the line', 'to each their own',
                                                                                               'all for one, one for all'],                              },
  { assign: { ActivityType: [2043403989],             Place: [2096719558] }, name: ['limited blessings', 'total victory',
                                                                                                        'with both hands'],                              },

// activity??
/*
  { assign: { Activity: [1893059148]},                                       desc: ['shattered throne'],                                                 },
*/
  // Places 
  { assign: { Place: [3747705955]                                         }, desc: ['edz','european dead zone'],                                         },
  { assign: { Place: [2426873752]                                         }, desc: ['mars' ,'latent memories' ,
                                                                                         'escalation protocol'],                                         },
  { assign: { Place: [1259908504]                                         }, desc: ['mercury'],                                                          },
  { assign: { Place: [386951460]                                          }, desc: ['titan'],                                                            },
  { assign: { Place: [3526908984]                                         }, desc: ['nessus'],                                                           },
  { assign: { Place: [4251857532]                                         }, desc: [/\bio\b/],                              vendorHashes: [3982706173],  },
  { assign: { Place: [975684424]                                          }, desc: ['tangled shore','jetsam of saturn'],                                 },
  { assign: { Place: [2877881518]                                         }, desc: ['dreaming city','Oracle Engine',
                                                                                                           'plague.+well'], vendorHashes: [1841717884],  },
  { assign: { Place: [1259908504]                                         }, desc: ['haunted forest'],                                                   },

//{ assign: { Place: Tower                                                }, desc: ['tower','annex'],                    wha??                           },
//{ assign: { Place: Verdant Forest                                       }, desc: ['verdant forest'],                                                   },
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
