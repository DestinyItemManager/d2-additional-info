export const matchTable: {
  /** a sourceTag. i.e. "adventures" or "deadorbit" or "zavala" or "crucible" */
  sourceName: string;
  /**
   * list of strings. if a sourceString contains one of these,
   * it probably refers to this sourceTag
   */
  desc?: string[];
  /**
   * list of strings. if a sourceString contains one of these,
   * it doesn't refer to this sourceTag
   */
  excludes?: string[];
  /** list of english item names or inventoryItem hashes */
  items?: (string | number)[];
  /**
   * presentationNodes can contain a set of items (Collections).
   * we'll find presentation node by name or hash */
  presentationNodes?: (string | number)[];
  /**
   * duplicate this category into another sourceTag
   */
  alias?: string[];
  /**
   *  this sourceTag and all its itemsHashes and sourceHashes
   *  should be added to this additional sourceTag
   */
  extends?: string[];
  /** originTrait english name that matches this sourceTag */
  originTrait?: string[];
  /**
   * english name of items containing the appropriate originTrait
   * but they should not be considered part of this sourceTag
   */
  excludedItems?: string[];
  /** deprecated */
  searchString?: string[];
  /**
   * has this source been relagated into the DCV?
   */
  isDCV?: boolean;
}[] = [
  // ==========================================================================
  //                              DESTINATIONS
  // ==========================================================================
  {
    // DCV'D
    // ADDED IN SEASON 01
    sourceName: 'adventure',
    desc: ['adventure'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // ADDED IN SEASON 01
    sourceName: 'lostsectors',
    desc: ['Lost Sectors'],
  },
  {
    // ADDED IN SEASON 01
    sourceName: 'edz',
    desc: ['European Dead Zone', 'edz'],
  },
  {
    // DCV'D
    // ADDED IN SEASON 01
    sourceName: 'titan',
    desc: ["Saturn's moon, Titan", "Savathûn's Song"],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // ADDED IN SEASON 01
    sourceName: 'nessus',
    desc: ['Nessus', 'The Inverted Spire', 'The Insight Terminus', 'Exodus Crash'],
  },
  {
    // DCV'D
    // ADDED IN SEASON 01
    sourceName: 'io',
    desc: ['on io', 'The Pyramidion'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 02
    sourceName: 'mercury',
    desc: ['mercury', 'A Garden World', 'Tree of Probabilities'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 03
    sourceName: 'mars',
    desc: ['on Mars', 'Will of the Thousands', 'Strange Terrain'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 04
    sourceName: 'tangled',
    desc: [
      'Warden of Nothing',
      'The Hollowed Lair',
      'the Tangled Shore',
      'Complete wanted escapee bounties for the Spider.',
    ],
    items: ['Secret Treasure', 'Tangled Bronze', 'Tangled Rust'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // ADDED IN SEASON 04
    sourceName: 'dreaming',
    desc: ['Dreaming City', 'The Corrupted'],
    items: ['Ennead', 'Secret Victories'],
  },
  {
    // ADDED IN SEASON 08
    sourceName: 'moon',
    desc: ['Moon', 'Altars of Sorrow'],
    excludes: ['Titan'],
  },
  {
    // ADDED IN SEASON 12
    sourceName: 'europa',
    desc: ['Europa', 'Fallen Empire', 'Empire Hunts', 'The Stasis Prototype', 'Lost Lament'],
  },
  {
    // ADDED IN SEASON 16
    sourceName: 'throneworld',
    desc: ['Throne World', 'Vox Obscura', 'Of Queens and Worms'],
    originTrait: ['Psychohack'],
  },
  {
    // ADDED IN SEASON 20
    sourceName: 'neomuna',
    desc: [
      'Source: Strider Exotic Quest',
      'Source: "What Remains" Exotic Quest',
      'Source: "The Final Strand" Exotic Quest',
      'Source: Terminal Overload',
      'Neomuna',
    ],
    originTrait: ['Nanotech Tracer Rockets'],
  },
  // ==========================================================================
  //                                   RAIDS
  // ==========================================================================
  {
    // TO-DO: Make raid programatically from all raids
    sourceName: 'raid',
    desc: ['raid', 'Guide', 'Guided'],
  },
  {
    // DCV'D
    // ADDED IN SEASON 01
    sourceName: 'leviathan',
    desc: ['leviathan raid'],
    items: ['3580904580'], // Acrius (FINAL VERSION)
    extends: ['raid', 'calus', 'dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 02
    sourceName: 'eow',
    desc: ['Eater of Worlds raid'],
    extends: ['raid', 'calus', 'dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 03
    sourceName: 'spireofstars',
    desc: ['Spire of Stars raid'],
    alias: ['sos'],
    extends: ['raid', 'calus', 'dcv'],
    isDCV: true,
  },
  {
    // ADDED IN SEASON 04
    sourceName: 'lastwish',
    desc: ['Last Wish raid'],
    items: ['Dreaming Spectrum'],
    alias: ['lw'],
    originTrait: ['Explosive Pact'],
    extends: ['raid'],
  },
  {
    // DCV'D
    // ADDED IN SEASON 05
    sourceName: 'scourgeofthepast',
    desc: ['Scourge'],
    items: ['Midnight Smith'],
    alias: ['scourge', 'sotp'],
    extends: ['raid', 'dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    // ADDED IN SEASON 07
    sourceName: 'crownofsorrow',
    desc: ['crown of sorrow'],
    items: ['Crown of Sorrow', 'Imperial Dress', 'Imperial Opulence', 'Shadow of Earth Shell'],
    alias: ['cos'],
    extends: ['raid', 'calus', 'dcv'],
    isDCV: true,
  },
  {
    // ADDED IN SEASON 08
    sourceName: 'gardenofsalvation',
    desc: ['Garden of Salvation'],
    items: ['Divinity'],
    alias: ['gos', 'garden'],
    extends: ['raid'],
  },
  {
    // ADDED IN SEASON 12
    sourceName: 'deepstonecrypt',
    desc: ['Deep Stone Crypt', 'Not a Scratch', 'Rock Bottom'],
    alias: ['dsc'],
    originTrait: ['Bray Inheritance'],
    extends: ['raid'],
  },
  {
    // ADDED IN SEASON 14
    sourceName: 'vaultofglass',
    desc: ['Source: "Vault of Glass" Raid'],
    alias: ['vog'],
    extends: ['raid'],
  },
  {
    // ADDED IN SEASON 16
    sourceName: 'vowofthedisciple',
    desc: ['Vow of the Disciple'],
    alias: ['vow', 'votd'],
    extends: ['raid'],
    originTrait: ['Souldrinker'],
  },
  {
    // ADDED IN SEASON 18
    sourceName: 'kingsfall',
    desc: ["King's Fall"],
    alias: ['kf'],
    extends: ['raid'],
    originTrait: ['Runneth Over'],
  },
  {
    // ADDED IN SEASON 20
    sourceName: 'rootofnightmares',
    desc: ['Root of Nightmares'],
    alias: ['root', 'ron'],
    originTrait: ['Harmonic Resonance'],
    excludedItems: ['Epochal Integration'],
    extends: ['raid'],
  },
  {
    // ADDED IN SEASON 22
    sourceName: 'crotasend',
    desc: ["Crota's End"],
    alias: ['crota'],
    extends: ['raid'],
  },
  // ==========================================================================
  //                                    DUNGEONS
  // ==========================================================================
  {
    // TO-DO: Make dungeon programatically from all dungeons
    sourceName: 'dungeon',
    desc: ['Dungeon'],
  },
  {
    // ADDED IN SEASON 04
    sourceName: 'shatteredthrone',
    items: ['Pallas Galliot', 'Wish-Ender', 'The Eternal Return'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 08
    sourceName: 'pit',
    desc: ['Pit of Heresy'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 11
    sourceName: 'prophecy',
    desc: ['"Prophecy" Dungeon'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 15
    sourceName: 'grasp',
    desc: ['Grasp of Avarice'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 17
    sourceName: 'duality',
    desc: ['Dungeon "Duality"'],
    originTrait: ['Bitterspite'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 19
    sourceName: 'spireofthewatcher',
    desc: ['Spire of the Watcher'],
    alias: ['sotw', 'watcher'],
    extends: ['dungeon'],
    originTrait: ['Tex Balanced Stock'],
    excludedItems: ['Last Rite', 'Wild Style', 'The Prophet'],
  },
  {
    // ADDED IN SEASON 21
    sourceName: 'ghostsofthedeep',
    desc: ['Ghosts of the Deep'],
    alias: ['gotd'],
    originTrait: ['Restoration Ritual'],
    extends: ['dungeon'],
  },
  {
    // ADDED IN SEASON 23
    sourceName: 'warlordsruin',
    desc: ["Warlord's Ruin"],
    extends: ['dungeon'],
    originTrait: ['Sundering'],
  },
  // ==========================================================================
  //                                EXOTIC QUESTS
  // ==========================================================================
  {
    sourceName: 'exoticquest',
    desc: ['Exotic Quest', 'Exotic Mission'],
  },
  {
    // ADDED IN SEASON 12
    sourceName: 'harbinger',
    desc: ['Let Loose Thy Talons'],
    extends: ['exoticquest'],
  },
  {
    // ADDED IN SEASON 13
    sourceName: 'presage',
    desc: ['Presage'],
    extends: ['exoticquest'],
  },
  {
    sourceName: 'avalon',
    desc: [
      'Source: "Truly Satisfactory" Triumph',
      'Source: "Firmware Update" Triumph',
      'Source: //node.ovrd.AVALON// Exotic Quest',
    ],
    extends: ['exoticquest'],
  },
  // ==========================================================================
  //                               SEASONAL VENDORS
  // ==========================================================================
  {
    sourceName: 'blackarmory',
    desc: [
      'Source: Acquired from Ada-1',
      'forge ignition',
      'glyph puzzle',
      'Black armory',
      'Obsidian Accelerator',
      'Reunited Siblings',
      'Master Blaster',
      'Clean Up on Aisle Five',
      'Beautiful but Deadly',
      'Master Smith',
    ],
    items: [
      'Bergusian Night',
      'House of Meyrin',
      "Izanagi's Burden",
      'Jötunn',
      'Le Monarque',
      'New Age Black Armory',
      'Rasmussen Clan',
      'Refurbished Black Armory',
      'Satou Tribe',
    ],
    alias: ['ada'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    sourceName: 'calus',
    desc: [],
    items: ['The Tribute Hall', 'Bad Juju'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'wartable',
    desc: ['War Table', "Challenger's Proving VII Quest"],
  },
  {
    sourceName: 'rasputin',
    desc: ['Rasputin', 'Seraph', 'The Lie', 'End-of-Season event'],
  },
  {
    sourceName: 'saint14',
    desc: ['A Matter of Time', 'Empyrean', 'Global Resonance', '???????'],
  },
  {
    sourceName: 'umbral',
    desc: ['Umbral', 'Recaster'],
  },
  {
    sourceName: 'servitor',
    desc: ['Source: Season of the Splicer', 'Source: Splicer Servitor'],
    items: ["Sojourner's Tale", 'Shattered Cipher'],
  },
  {
    sourceName: 'compass',
    desc: [
      "Source: Wayfinder's Compass",
      'Source: Mission "Exorcism"',
      'Source: Display of Supremacy, Weekly Challenge',
    ],
  },
  {
    sourceName: 'sonar',
    desc: ['Season of the Deep'],
    originTrait: ['Unsated Hunger'],
  },
  // ==========================================================================
  //                             SEASONAL ACTIVITIES
  // ==========================================================================
  {
    // DCV'D
    sourceName: 'ep',
    desc: ['Escalation Protocol', 'Defeat 25 Final Bosses'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    sourceName: 'menagerie',
    desc: ['Menagerie'],
    items: [
      'Árma Mákhēs',
      'A Hall of Delights',
      'Cinderchar',
      'Golden Empire',
      'Goldleaf',
      "The Emperor's Chosen",
      'The Imperial Menagerie',
      'Shadow Gilt',
    ],
    extends: ['calus', 'dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    sourceName: 'sundial',
    desc: ['sundial', 'obelisk'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    sourceName: 'vexoffensive',
    desc: ['seasonal activities during Season of the Undying'],
    items: [
      'Substitutional Alloy Greaves',
      'Substitutional Alloy Hood',
      'Substitutional Alloy Cloak',
      'Substitutional Alloy Boots',
      'Substitutional Alloy Bond',
      'Substitutional Alloy Gauntlets',
      'Substitutional Alloy Robes',
      'Substitutional Alloy Strides',
      'Substitutional Alloy Vest',
      'Substitutional Alloy Plate',
      'Substitutional Alloy Helm',
      'Substitutional Alloy Mark',
      'Substitutional Alloy Grips',
      'Substitutional Alloy Mask',
      'Substitutional Alloy Gloves',
    ],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    // DCV'D
    sourceName: 'wrathborn',
    desc: ['Wrathborn', 'Coup de Grâce'],
    items: ['Blast Battue', 'Royal Chase'],
    presentationNodes: ['Wild Hunt Suit'],
    extends: ['dcv'],
    isDCV: true,
  },

  {
    sourceName: 'battlegrounds',
    desc: ['Battlegrounds'],
    items: ['Brass Attacks', 'Threaded Needle'],
  },
  {
    // DCV'D
    sourceName: 'contact',
    desc: ['Contact'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: '30th',
    desc: ['Eternity', 'Grasp of Avarice', 'Magnum Opus', 'And Out Fly the Wolves'],
  },
  {
    sourceName: 'intothelight',
    desc: [
      'Into the Light',
      'Exotic Mission "The Whisper"',
      'Exotic Mission "Zero Hour"',
      "Source: Where's Archie?",
    ],
    originTrait: ['Indomitability'],
    alias: ['itl'],
  },
  {
    sourceName: 'brave',
    desc: ['Into the Light'],
    originTrait: ['Indomitability'],
  },
  {
    sourceName: 'rivenslair',
    desc: [
      'Source: Season of the Wish Activities',
      'Source: Season of the Wish Triumphs',
      'Source: "Starcrossed" Mission',
    ],
    alias: ['coil'],
    originTrait: ["Dragon's Vengeance"],
  },
  {
    sourceName: 'wellspring',
    desc: ['Wellspring', "All the Spring's Riches", 'Warden of the Spring'],
  },
  {
    sourceName: 'psiops',
    desc: ['PsiOps', 'Source: Season of the Risen'],
    excludes: ['Source: Season of the Risen Nightfall Grandmaster'],
    originTrait: ['Land Tank'],
  },
  {
    sourceName: 'evidenceboard',
    desc: ['Evidence Board', 'Investigator'],
    alias: ['enclave'],
  },
  // ==========================================================================
  //                               TOWER VENDORS
  // ==========================================================================
  {
    sourceName: 'crucible',
    desc: ['Shaxx', 'crucible', 'Reconnaissance by Fire', 'Battle Drills', 'Crucible'],
    items: [
      'Devil in the Details',
      'Disdain for Glitter',
      'Crucible Carmine',
      'Crucible Legacy',
      'Crucible Metallic',
      'Crucible Redjack',
      'Crucible Solemnity',
      'Made Shaxx Proud',
      'Punctuation Marks',
      'Rain of Ashes',
      "Victory's Wreath",
      'Rubicund Wrap (Ornament)',
    ],
    alias: ['shaxx'],
    originTrait: ['One Quiet Moment'],
  },
  {
    sourceName: 'do',
    desc: ['Arach Jalaal'],
    extends: ['dcv'],
    isDCV: true,
  },

  {
    sourceName: 'eververse',
    desc: ['Bright Engrams', 'Eververse'],
  },
  {
    sourceName: 'fwc',
    desc: ['Lakshmi-2'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'gambit',
    desc: [
      'from the Drifter',
      'Gambit quest',
      'Clean Getaway',
      "Keepin' On",
      'Gambit',
      'Source: Drifter Rank Up Reputation',
    ],
    items: [
      'Dance the Demons Away',
      'Gambit Blackguard',
      'Gambit Chrome',
      'Gambit Duds',
      'Gambit Leather',
      'Gambit Steel',
      'Gambit Suede',
      'Keep on Drifting',
      'Kit and Kaboodle',
      'Mistrust of Gifts',
      'Live for the Hustle',
      'Snakeskin Wrap (Ornament)',
    ],
    excludes: ['Prime'],
    alias: ['drifter'],
    originTrait: ['Gun and Run'],
  },
  {
    sourceName: 'gambitprime',
    desc: ['Gambit Prime matches'],
    items: [
      'Prime Palette',
      'The Collector',
      'The Invader',
      'The Reaper',
      'The Sentry',
      'Viper Strike',
    ],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'gunsmith',
    desc: ['Banshee-44', "Salvager's Salvo Armament Quest", 'Source: "A Sacred Fusion" Quest'],
    excludes: ['Vanguard', 'Crucible', 'Gambit'],
    alias: ['banshee'],
  },
  {
    sourceName: 'ikora',
    desc: ['ikora'],
  },
  {
    sourceName: 'ironbanner',
    desc: ['Iron Banner', 'Lord Saladin'],
    items: [
      'Grizzled Wolf',
      'Iron Bone',
      'Iron Gold',
      'Iron Ruby',
      'Iron Strength',
      'Rusted Iron',
      'The Golden Standard',
    ],
    originTrait: ['Skulking Wolf'],
  },
  {
    sourceName: 'nightfall',
    desc: ['nightfall'],
    items: ['After the Nightfall', 'Soldier On'],
    originTrait: ['Stunning Recovery'],
  },
  {
    sourceName: 'nm',
    desc: ['Executor Hideo'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'shipwright',
    desc: ['Amanda Holliday'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'strikes',
    desc: ['zavala', 'vanguard', 'First Watch', 'A Loud Racket', 'Strikes', 'strike', 'Vanguard'],
    items: [
      'Determination',
      'Disdain for Gold',
      'Vanguard Burnished Steel',
      'Vanguard Divide',
      'Vanguard Metallic',
      'Vanguard Steel',
      'Vanguard Unyielding',
      'Vanguard Veteran',
      'Consequence of Duty',
      'Balistraria Wrap (Ornament)',
    ],
    excludes: ['Nightfall'],
    alias: ['zavala'],
    originTrait: ["Vanguard's Vindication"],
    excludedItems: ['(Adept)'],
  },
  {
    sourceName: 'trials',
    desc: ['Trials', 'Saint-14', 'Source: Flawless Win with a "Flight of the Pigeon" Medal'],
    items: ['Hardened by Trial', 'Light for the Lost', 'Flawless Empyrean'],
    originTrait: ['Alacrity'],
  },
  {
    sourceName: 'events',
    desc: [
      'event',
      'Moments of Triumph',
      'Solstice',
      'Dawning',
      'Guardian Games',
      'Moment of Triumph',
      'Festival of the Lost',
      'Revelry',
      'Crimson Days',
      'Ages of Triumph',
    ],
    excludes: ['public', 'End-of-Season', 'promotional', 'Handed out'],
    items: ['Zephyr'],
    originTrait: ['Classy Contender', 'Search Party', 'Dream Work', 'Dawning Surprise'],
    searchString: ['dawning', 'crimsondays', 'solstice', 'fotl', 'revelry', 'games'],
  },
  {
    sourceName: 'cayde6',
    desc: ['Follow treasure maps.'],
    extends: ['dcv'],
    isDCV: true,
  },
  // ==========================================================================
  //                                   MISC
  // ==========================================================================
  {
    sourceName: 'haunted',
    desc: ['Season of the Haunted', 'The Derelict Leviathan'],
    originTrait: ['Extrovert'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'plunder',
    desc: ['Season of Plunder', 'Source: "A Rising Tide" Mission', 'Source: Cryptic Quatrains III'],
    originTrait: ['Right Hook'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'lost',
    desc: [
      'Source: Season of the Lost ritual playlists',
      'Source: Display of Supremacy, Weekly Challenge',
    ],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'legendaryengram',
    desc: ['Legendary engrams and'],
  },
  {
    sourceName: 'nightmare',
    desc: ['nightmare'],
  },
  {
    sourceName: 'prestige',
    desc: ['Prestige difficulty'],
    extends: ['dcv'],
    isDCV: true,
  },
  {
    sourceName: 'seasonpass',
    desc: ['season pass', 'Source: Season of', 'Season Pass Reward'],
    excludes: [
      'dungeon',
      'nightfall',
      'activities',
      'triumph',
      'challenges',
      'playlists',
      'quest',
      'the Splicer',
      'the Hunt',
      'Arrivals',
      'the Chosen',
      'the Worthy',
      'the Lost',
    ],
  },
  {
    sourceName: 'deluxe',
    desc: [
      'Annual Pass',
      'Limited Edition',
      'special offer',
      'Deluxe Edition',
      'charity',
      'pre-order bonus',
      'preorder',
      'Refer-a-Friend',
      'Handed out',
    ],
    alias: ['limited'],
  },
  {
    sourceName: 'campaign',
    desc: [
      'campaign',
      'Requires',
      'Unlocked by default.',
      'Source: Unlock your ',
      'Earned while leveling.',
      'A Spark of Hope',
      'Planetary faction chests',
      'Dismantle an item with this shader applied to it.',
      'Found in Legendary world engrams.',
      'Flashpoint',
      'Grimoire',
      'all factions',
      'heroic Public Event',
    ],
  },
  // ==========================================================================
  //                          SEASONALLY EARNED WEAPONS
  // ==========================================================================
  {
    sourceName: 'ritual-weapon',
    desc: [
      'Source: Earn Ranks in Vanguard, Crucible, or Gambit Playlists',
      'Source: Ranks in Vanguard Strikes, Crucible, or Gambit',
    ],
    items: [
      'Komodo-4FR',
      '805677041',
      'Edgewise',
      'Exit Strategy',
      'Python',
      '3535742959',
      '3434944005',
      'Adored',
      'Null Composure',
      "Felwinter's Lie",
      'Ecliptic Distaff',
      "Salvager's Salvo",
    ],
  },
  {
    sourceName: 'pinnacle-weapon',
    desc: [
      'Source: Glory Rank of "Fabled" in the Crucible.',
      'Source: Reach Glory Rank "Legend" in the Crucible.',
      'Source: Complete the "Breakneck" quest from the Drifter.',
      'Source: Complete the "Clean Getaway" quest.',
      'Source: Complete the "Loaded Question" quest from Zavala.',
      'Source: Complete the "A Loud Racket" quest.',
    ],
    items: ['Oxygen SR3', '21% Delirium', 'The Recluse', 'Hush', 'Revoker', '578459533'],
  },
  // ==========================================================================
  //                                   DCV
  //  DEPRECATED TO BE REMOVED WHEN EPISODE 2 TFS RELEASES
  //  ALONG WITH ALL: `extends: ['dcv']`
  // ==========================================================================
  {
    sourceName: 'dcv',
    desc: [],
    searchString: [
      'mercury',
      'mars',
      'titan',
      'io',
      'leviathan',
      'ep',
      'blackarmory',
      'menagerie',
      'eow',
      'sos',
      'scourge',
      'crownofsorrow',
    ],
  },
  // ==========================================================================
  //                                   IGNORES
  // ==========================================================================
  {
    sourceName: 'ignore',
    desc: [
      'Forging Your Own Path',
      'Exotic engrams; extremely rare world drops.',
      'An Exotic quest or challenge',
      'Season of Opulence Triumph',
      'Season of Arrivals',
      'Season of the Worthy',
      'Season of the Hunt',
      'Artifacts - IGNORE',
      'Ornaments - IGNORE',
      'Source: Seasonal Artifact',
      'Source: Season of the Chosen',
      'Source: Xûr',
      'Source: Season of the Lost',
      'Source: Acquired from Xûr',
      'Source: Exotic Archive at the Tower',
      'Source: Star Chart Reputation Reset',
      'Source: High-Difficulty Activities or Dismantled Exotic or Legendary Gear',
      'Source: Low chance to drop from defeating combatants or opening chests.',
      'Source: High-Difficulty Activities',
      'Source: Exchange for Synthcord at the Loom',
      'Source: Threader Bounties from Ada-1',
      'Source: Dismantle Exotic or Legendary Equipment',
      'Source: Defeat Combatants with Active Prime Attunement Buff',
      'Source: Defeat Combatants, Loot Chests, or Complete Activities',
      'Source: "Xenology" Quest from Xûr',
      'Source: Purchase from Suraya Hawthorne',
      'Source: Seasonal Challenges or Repeatable Bounties',
      'Source: Defeat Combatants or Open Chests',
      'Source: "Legendary Trifecta" Triumph',
      'Source: "We Stand Unbroken" Quest',
    ],
  },
];

export const renameTable: {
  hash: number[];
  newName: string;
}[] = [
  {
    hash: [3389857033],
    newName: 'Ornaments - IGNORE',
  },
  {
    hash: [1402439016, 2585665369],
    newName: 'Artifacts - IGNORE',
  },
  {
    hash: [2075569025],
    newName: 'PsiOps',
  },
  {
    hash: [1035822060],
    newName: 'Season of Witch - ARMOR',
  },
  {
    hash: [2671038131, 2959452483],
    newName: 'Season of the Deep - WEAPONS',
  },
];
