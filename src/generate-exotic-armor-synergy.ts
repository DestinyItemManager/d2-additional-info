import { get, getAll, loadLocal } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

loadLocal();

const debug = false;
const inventoryItems = getAll('DestinyInventoryItemDefinition');
const exoticSynergy = {} as Record<number, string[]>;

// Keywords
const keywordsArc =
  /fists of havoc|thundercrash|stormtrance|chaos reach|arc (staff|melee|bolt|ability|grenade|soul)|skip grenade|whirlwind guard|thunderclap melee|seismic strike|ionic traces|blind(s)?|jolt/;
const keywordsSolar =
  /golden gun|blade barrage|dawnblade|well of radiance|(tripmine|fusion) grenade(s)?|sunspot|solar (abilities|grenades)|hammer strike|sol invictus|daybreak|kni(v|f)e(s)?|scorch(es)?/;
const keywordsVoid =
  /spectral blades|moebius quiver|deadfall|ward of dawn|sentinel shield|shield throw|void melee energy|shield bash|(nova|smoke) bomb|void-damage|(scatter|void) grenade|devour|invisible|blink|suppresses/;
const keywordsStasis = /stasis subclass|duskfield|coldsnap grenades|slows/;
const keywordsStrand = /strand/; // Naive attempt to catch new exotics on LightFall release

// Exclusions
const exclusionArc = /sentinel shield/; // sentinel shield blinds ...

if (debug) {
  // Build Markdown Table
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
          keywordsArc.test(intrinsicTraitDescription) &&
          !exclusionArc.test(intrinsicTraitDescription)
        ) {
          synergy.push('arc');
        }
        if (keywordsSolar.test(intrinsicTraitDescription)) {
          synergy.push('solar');
        }
        if (keywordsStasis.test(intrinsicTraitDescription)) {
          synergy.push('stasis');
        }
        if (keywordsVoid.test(intrinsicTraitDescription)) {
          synergy.push('void');
        }
        if (keywordsStrand.test(intrinsicTraitDescription)) {
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
