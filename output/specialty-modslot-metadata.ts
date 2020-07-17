interface ModSocketMetadata {
  /** this allows us to sort mods chronologically for LO purposes */
  season: number;
  /** we use these two to match with search filters */
  tag: string;
  compatibleTags: string[];
  /** an item's socket's socketTypeHash is used to look up ModSocketMetadata */
  socketTypeHash: number;
  /**
   * mods don't inherently point back to their compatible slot,
   * they just have a plugCategoryHash.
   * a socket points to a socketType which refers to multiple plugCategoryHashes
   * so here is a more direct way, if you have a plugCategoryHash,
   * to find ModSocketMetadata without doing definition lookups and finds
   */
  plugCategoryHashes: number[];
  /**
   * hashes are used for faster lookups in loadout organizer,
   * they correspond directly to info found inside individual mod
   */
  compatiblePlugCategoryHashes: number[];
  /** this helps us look up the "empty socket" definition, for its icon/name */
  emptyModSocketHash: number;
}

const modSocketMetadata: ModSocketMetadata[] = [
  {
    season: 4,
    tag: 'outlaw',
    compatibleTags: ['outlaw', 'forge'],
    socketTypeHash: 1540673283,
    plugCategoryHashes: [2149155760, 13646368],
    compatiblePlugCategoryHashes: [13646368, 2149155760, 65589297],
    emptyModSocketHash: 3625698764,
  },
  {
    season: 5,
    tag: 'forge',
    compatibleTags: ['forge', 'outlaw'],
    socketTypeHash: 3873071636,
    plugCategoryHashes: [65589297],
    compatiblePlugCategoryHashes: [13646368, 2149155760, 65589297],
    emptyModSocketHash: 720857,
  },
  {
    season: 7,
    tag: 'opulent',
    compatibleTags: ['opulent', 'undying'],
    socketTypeHash: 1430586844,
    plugCategoryHashes: [1962317640, 2712224971, 1202876185],
    compatiblePlugCategoryHashes: [2712224971, 1081029832],
    emptyModSocketHash: 4106547009,
  },
  {
    season: 8,
    tag: 'undying',
    compatibleTags: ['undying', 'dawn', 'opulent'],
    socketTypeHash: 4127539203,
    plugCategoryHashes: [1081029832],
    compatiblePlugCategoryHashes: [2712224971, 1081029832, 457704685, 208760563],
    emptyModSocketHash: 2620967748,
  },
  {
    season: 9,
    tag: 'dawn',
    compatibleTags: ['dawn', 'worthy', 'undying'],
    socketTypeHash: 1936582325,
    plugCategoryHashes: [208760563],
    compatiblePlugCategoryHashes: [1081029832, 208760563, 426869514],
    emptyModSocketHash: 2357307006,
  },
  {
    season: 10,
    tag: 'worthy',
    compatibleTags: ['worthy', 'arrival', 'dawn'],
    socketTypeHash: 2836765131,
    plugCategoryHashes: [426869514],
    compatiblePlugCategoryHashes: [208760563, 426869514, 443647229],
    emptyModSocketHash: 2655746324,
  },
  {
    season: 11,
    tag: 'arrival',
    compatibleTags: ['arrival', 'dawn', 'worthy'],
    socketTypeHash: 3267328333,
    plugCategoryHashes: [443647229],
    compatiblePlugCategoryHashes: [208760563, 426869514, 443647229, 393461403],
    emptyModSocketHash: 4153634494,
  },
];

export default modSocketMetadata;
