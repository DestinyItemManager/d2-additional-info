import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const debug = true;
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const exoticSynergy = {} as Record<number, string[]>;

if (debug) {
  console.log('|Exotic Armor|Synergies|');
  console.log('|------------|---------|');
}

inventoryItems.filter(
  (item) =>
    item.equippingBlock?.uniqueLabel === 'exotic_armor' &&
    item.sockets?.socketEntries.find((socket) => {
      if ([965959289].includes(socket.socketTypeHash)) {
        let synergy = [];
        const itemName = item.displayProperties.name;
        const hash = item.hash;
        const intrinsicTraitDescription =
          get(
            'DestinyInventoryItemDefinition',
            socket.singleInitialItemHash
          )?.displayProperties.description.toLowerCase() ?? '';
        if (
          /chaos reach|arc staff|skip grenade|arc melee|arc bolt|whirlwind guard|blind(s)?|fists of havoc|thunderclap melee|thundercrash|seismic strike|ionic traces|arc ability|jolt|stormtrance|arc grenade|arc soul/.test(
            intrinsicTraitDescription
          ) &&
          !/sentinel shield/.test(intrinsicTraitDescription) // sentinel shield blinds ...
        ) {
          synergy.push('arc');
        }
        if (
          /golden gun|tripmine grenade|blade barrage|scorch(es)?|sunspot|fusion grenades|solar abilities|hammer strike|sol invictus|solar grenades|dawnblade|well of radiance|daybreak|kni(v|f)e(s)?/.test(
            intrinsicTraitDescription
          )
        ) {
          synergy.push('solar');
        }
        if (/stasis subclass|duskfield|slows|coldsnap grenades/.test(intrinsicTraitDescription)) {
          synergy.push('stasis');
        }
        if (
          /spectral blades|moebius quiver|deadfall|suppresses|ward of dawn|sentinel shield|shield throw|void melee energy|shield bash|nova bomb|void-damage|scatter grenade|void grenade|devour|invisible|smoke bomb|blink/.test(
            intrinsicTraitDescription
          )
        ) {
          synergy.push('void');
        }
        if (
          // Naive attempt to catch new exotics on LightFall release
          /strand/.test(intrinsicTraitDescription)
        ) {
          synergy.push('strand');
        }
        exoticSynergy[hash] = synergy;
        if (debug) {
          console.log(`|${itemName}|${synergy}|`);
        }
      }
    })
);

writeFile('./output/exotic-synergy.json', exoticSynergy);
