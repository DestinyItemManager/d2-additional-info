import { getAll, loadLocal } from 'destiny2-manifest/node';

import { writeFile } from './helpers';

loadLocal();
const inventoryItems = getAll('DestinyInventoryItemDefinition');

const ghostPerks: Record<
  string,
  {
    location: string | boolean;
    type: {
      xp: boolean;
      resource: boolean;
      cache: boolean;
      scanner: boolean;
      glimmer: boolean;
      telemetry: {
        arc: boolean;
        void: boolean;
        solar: boolean;
      };
      improved: boolean;
    };
  }
> = {};

const ghostPerkCategoryHash = 4176831154;
const ghostPerkHashBlacklist = [2328497849]; // "Random Mod"

inventoryItems.forEach((inventoryItem) => {
  const { hash, itemTypeDisplayName } = inventoryItem;
  const { description, name } = inventoryItem.displayProperties;
  const categoryHashes = inventoryItem.itemCategoryHashes || [];

  if (categoryHashes.includes(ghostPerkCategoryHash) && !ghostPerkHashBlacklist.includes(hash)) {
    ghostPerks[hash] = {
      location: getLocation(description),
      type: getType(description.toLowerCase(), name.toLowerCase())
    };
  }
});

writeFile('./output/ghost-perks.json', ghostPerks);

function getLocation(description: string) {
  const lc_description = description.toLowerCase();
  if (lc_description.includes('edz')) {
    return 'edz';
  } else if (lc_description.includes('titan')) {
    return 'titan';
  } else if (lc_description.includes('nessus')) {
    return 'nessus';
  } else if (description.includes('Io')) {
    return 'io';
  } else if (lc_description.includes('mercury')) {
    return 'mercury';
  } else if (lc_description.includes('hellas basin')) {
    return 'mars';
  } else if (lc_description.includes('tangled shore')) {
    return 'tangled';
  } else if (lc_description.includes('dreaming city')) {
    return 'dreaming';
  } else if (lc_description.includes('vanguard') || lc_description.includes('strike')) {
    return 'strikes';
  } else if (lc_description.includes('crucible')) {
    return 'crucible';
  } else if (lc_description.includes('gambit')) {
    return 'gambit';
  } else if (lc_description.includes('leviathan')) {
    return 'leviathan';
  } else if (lc_description.includes('moon')) {
    return 'moon';
  } else {
    return false;
  }
}

function getType(description: string, name: string) {
  const typeTemplate = {
    xp: false,
    resource: false,
    cache: false,
    scanner: false,
    glimmer: false,
    telemetry: {
      arc: false,
      void: false,
      solar: false
    },
    improved: getImproved(description, name)
  };

  if (description.includes('xp')) {
    typeTemplate.xp = true;
  }
  if (description.includes('caches')) {
    typeTemplate.cache = true;
  }
  if (description.includes('resources')) {
    typeTemplate.resource = true;
  }
  if (description.includes('chance to obtain additional')) {
    typeTemplate.scanner = true;
  }
  if (description.includes('glimmer')) {
    typeTemplate.glimmer = true;
  }
  if (description.includes('generate gunsmith telemetry')) {
    if (description.includes('arc weapon kills')) {
      typeTemplate.telemetry.arc = true;
    } else if (description.includes('void weapon kills')) {
      typeTemplate.telemetry.void = true;
    } else if (description.includes('solar weapon kills')) {
      typeTemplate.telemetry.solar = true;
    } else if (description.includes('any elemental weapon kills')) {
      typeTemplate.telemetry.arc = true;
      typeTemplate.telemetry.void = true;
      typeTemplate.telemetry.solar = true;
    }
  }
  return typeTemplate;
}

function getImproved(description: string, name: string) {
  if (name.includes('improved') || description.includes('at an increased rate')) {
    return true;
  }
  return false;
}
