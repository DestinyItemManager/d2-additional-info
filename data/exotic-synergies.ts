import { getAllDefs, getDef } from '@d2api/manifest-node';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { getComposedRegex } from '../src/helpers.js';
import { ItemCategoryHashes, PlugCategoryHashes, SocketCategoryHashes } from './generated-enums.js';

const inventoryItems = getAllDefs('InventoryItem');

export const synergies = {
  arc: {
    super: getSuperNamesAndHashes(DamageType.Arc),
    damageType: DamageType.Arc,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedArcGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanArcMelee,
      PlugCategoryHashes.HunterArcMelee,
      PlugCategoryHashes.WarlockArcMelee,
    ]),
    verbs: /blind(s)?\b|jolt(s)?/,
    misc: /arc (bolt|ability|soul)|ionic traces/,
    keywords: {
      exclude: /sentinel shield/,
    },
  },
  solar: {
    super: getSuperNamesAndHashes(DamageType.Thermal),
    damageType: DamageType.Thermal,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedSolarGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanSolarMelee,
      PlugCategoryHashes.HunterSolarMelee,
      PlugCategoryHashes.WarlockSolarMelee,
    ]),
    verbs: /scorch(es)?/,
    misc: /sunspot|solar abilities|sol invictus|kni(v|f)e(s)?|helion/,
    keywords: {
      excludes: /solar final blows/,
    },
  },
  void: {
    super: getSuperNamesAndHashes(DamageType.Void),
    damageType: DamageType.Void,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedVoidGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanVoidMelee,
      PlugCategoryHashes.HunterVoidMelee,
      PlugCategoryHashes.WarlockVoidMelee,
    ]),
    verbs: /suppress(es)?/,
    misc: /void subclass|smoke bomb|void-damage|devour|invisible|blink|void soul(s)?/,
    keywords: {},
  },
  stasis: {
    super: getSuperNamesAndHashes(DamageType.Stasis),
    damageType: DamageType.Stasis,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedStasisGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanStasisMelee,
      PlugCategoryHashes.HunterStasisMelee,
      PlugCategoryHashes.WarlockStasisMelee,
    ]),
    verbs: /slows/,
    misc: /stasis subclass|frost armor/,
    keywords: {},
  },
  strand: {
    super: getSuperNamesAndHashes(DamageType.Strand),
    damageType: DamageType.Strand,
    grenades: getRegexByPCH([PlugCategoryHashes.SharedStrandGrenades]),
    melees: getRegexByPCH([
      PlugCategoryHashes.TitanStrandMelee,
      PlugCategoryHashes.HunterStrandMelee,
      PlugCategoryHashes.WarlockStrandMelee,
    ]),
    verbs: /sever(s)?\b|!(while you're midair )suspend(s)?|unravel(s)?/,
    misc: /strand subclass|woven mail/,
    keywords: {},
  },
} as Record<
  string,
  {
    super: { name: string; hash: number; regex: RegExp }[];
    superRegex?: RegExp;
    damageType: number;
    grenades: RegExp;
    melees: RegExp;
    verbs: RegExp;
    misc: RegExp;
    keywords: {
      include?: RegExp;
      exclude?: RegExp;
    };
  }
>;

export const burns = ['arc', 'solar', 'void', 'stasis', 'strand'];

for (const burn of burns) {
  synergies[burn].superRegex = getSuperRegex(synergies[burn].super);
  synergies[burn].keywords.include = getBurnKeywords(burn);
}

function getSuperNamesAndHashes(damageType: number) {
  const supers = inventoryItems.filter(
    (item) =>
      item.itemCategoryHashes?.includes(ItemCategoryHashes.Subclasses) &&
      item.sockets?.socketCategories.some(
        (sockets) => sockets.socketCategoryHash === SocketCategoryHashes.Super,
      ) &&
      item.talentGrid?.hudDamageType === damageType,
  );

  const superInfo: { name: string; hash: number; regex: RegExp }[] = [];

  supers.find((item) => {
    const socket = item.sockets?.socketCategories.find(
      (sockets) => sockets.socketCategoryHash === SocketCategoryHashes.Super,
    );
    const plugSet = getDef(
      'PlugSet',
      item.sockets?.socketEntries[socket!.socketIndexes[0]].reusablePlugSetHash,
    );
    let name = '';
    if (plugSet) {
      for (const plug of plugSet.reusablePlugItems) {
        name =
          getDef('InventoryItem', plug.plugItemHash)
            ?.displayProperties.name.toLowerCase()
            .replace(/ - /g, '|')
            .replace(/: /g, '|') ?? '';

        // Add extra names to name if needed eg dawnblade
        if (name === 'daybreak' || name === 'well of radiance') {
          // Tome of Dawn references dawnblade
          name += '|dawnblade';
        }
        if (name === 'arc staff') {
          name += '|whirlwind guard';
        }
        superInfo.push({
          name,
          hash: plug.plugItemHash,
          regex: new RegExp(name),
        });
      }
    } else {
      // Stasis does not have a reusablePlug
      name =
        getDef(
          'InventoryItem',
          item.sockets?.socketEntries[socket!.socketIndexes[0]].singleInitialItemHash,
        )
          ?.displayProperties.name.toLowerCase()
          .replace(/ - /g, '|')
          .replace(/: /g, '|') ?? '';
      superInfo.push({
        name,
        hash: item.sockets!.socketEntries[socket!.socketIndexes[0]].singleInitialItemHash,
        regex: new RegExp(name),
      });
    }
  });

  return superInfo;
}

function getRegexByPCH(plugHashes: PlugCategoryHashes[]) {
  const items = inventoryItems.filter((item) =>
    plugHashes.includes(item.plug?.plugCategoryHash ?? 0),
  );
  const itemTypeDisplayName = items.flatMap((i) => i.itemTypeDisplayName.toLowerCase())[0];
  return RegExp(
    `${items
      .map((i) => i.displayProperties.name.toLowerCase())
      .join('|')}|${itemTypeDisplayName}(s)?`,
  );
}

function getSuperRegex(obj: { name: string; hash: number; regex: RegExp }[]) {
  const regex = [] as RegExp[];
  for (const [, value] of Object.entries(obj)) {
    regex.push(Object(value).regex);
  }
  return getComposedRegex(...regex);
}

function getBurnKeywords(burn: string) {
  if (synergies[burn].superRegex) {
    return getComposedRegex(
      synergies[burn].superRegex!,
      synergies[burn].grenades,
      synergies[burn].melees,
      synergies[burn].verbs,
      synergies[burn].misc,
    );
  }
}
