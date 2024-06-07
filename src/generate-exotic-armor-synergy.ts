import { getDef, getAllDefs } from '@d2api/manifest-node';
import { burns, synergies } from '../data/exotic-synergies.js';
import { writeFile, sortWithoutArticles } from './helpers.js';
import { DamageType } from 'bungie-api-ts/destiny2/interfaces.js';
import { infoLog } from './log.js';
const DEBUG = false;

const inventoryItems = getAllDefs('InventoryItem');
const exoticSynergy = {} as Record<number, { subclass?: number[]; damageType?: number[] }>;
const exoticSocketTypeHash = 965959289;

const debugArc: string[] = [];
const debugSolar: string[] = [];
const debugVoid: string[] = [];
const debugStasis: string[] = [];
const debugStrand: string[] = [];
const debugNeutral: string[] = [];

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if (socket.socketTypeHash === exoticSocketTypeHash) {
        const synergy = [] as string[];
        const damageType = [] as number[];
        const subclass = [] as number[];
        const intrinsicTraitDescription =
          getDef(
            'InventoryItem',
            socket.singleInitialItemHash,
          )?.displayProperties.description.toLowerCase() ?? '';

        for (const burn of burns) {
          if (
            synergies[burn].keywords.include?.test(intrinsicTraitDescription) &&
            !synergies[burn].keywords.exclude?.test(intrinsicTraitDescription)
          ) {
            damageType.push(synergies[burn].damageType);
            if (DEBUG) {
              synergy.push(
                synergyDebugInfo(
                  `${item.displayProperties.name}: ${intrinsicTraitDescription.replace(/\n/g, '')}`,
                  synergies[burn].damageType,
                ),
              );
            }
            for (const sooper of synergies[burn].super) {
              if (sooper.regex.test(intrinsicTraitDescription)) {
                subclass.push(sooper.hash);
                if (DEBUG) {
                  synergy.push(sooper.name);
                }
              }
            }
            subclass.sort();
          }
        }

        // if an exotic matches all subclass damageTypes it is a neutral exotic
        if (damageType.length === 5) {
          damageType.length = 0;
          if (DEBUG) {
            debugArc.pop();
            debugSolar.pop();
            debugVoid.pop();
            debugStasis.pop();
            debugStrand.pop();
          }
        }

        if (damageType.length > 0) {
          if (!exoticSynergy[item.hash]) {
            exoticSynergy[item.hash] = {};
          }
          exoticSynergy[item.hash].damageType = damageType;
        }

        if (subclass.length > 0) {
          if (!exoticSynergy[item.hash]) {
            exoticSynergy[item.hash] = {};
          }
          exoticSynergy[item.hash].subclass = subclass;
        }

        if (DEBUG) {
          if (damageType.length === 0 && subclass.length === 0) {
            debugNeutral.push(
              `${item.displayProperties.name}: ${intrinsicTraitDescription.replace(/\n/g, '')}`,
            );
          }
        }
      }
    }),
);

if (DEBUG) {
  infoLog('', synergies);
  // Generate MarkDown for easy pasting into Github
  infoLog(
    '',
    `# ${debugArc.length} Arc Exotics\n \`\`\`\n`,
    debugArc.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
  infoLog(
    '',
    `# ${debugSolar.length} Solar Exotics\n \`\`\`\n`,
    debugSolar.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
  infoLog(
    '',
    `# ${debugVoid.length} Void Exotics\n \`\`\`\n`,
    debugVoid.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
  infoLog(
    '',
    `# ${debugStasis.length} Stasis Exotics\n \`\`\`\n`,
    debugStasis.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
  infoLog(
    '',
    `# ${debugStrand.length} Strand Exotics\n \`\`\`\n`,
    debugStrand.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
  infoLog(
    '',
    `# ${debugNeutral.length} Neutral Exotics\n \`\`\`\n`,
    debugNeutral.sort(sortWithoutArticles),
    `\n\`\`\``,
  );
}

writeFile('./output/exotic-synergy.json', exoticSynergy);

function synergyDebugInfo(name: string, damageType: number) {
  switch (damageType) {
    case DamageType.Arc:
      debugArc.push(name);
      return 'arc';
    case DamageType.Thermal:
      debugSolar.push(name);
      return 'solar';
    case DamageType.Void:
      debugVoid.push(name);
      return 'void';
    case DamageType.Stasis:
      debugStasis.push(name);
      return 'stasis';
    case DamageType.Strand:
      debugStrand.push(name);
      return 'strand';
    default:
      return '';
  }
}
