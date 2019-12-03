const { writeFile, getMostRecentManifest } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const inventoryItems = mostRecentManifestLoaded.DestinyInventoryItemDefinition;
const perks = mostRecentManifestLoaded.DestinySandboxPerkDefinition;

const DEBUG = false;

const mods = {};
const failureMessages = {};

Object.values(inventoryItems).forEach((item) => {
  if (
    item.itemCategoryHashes &&
    item.itemCategoryHashes.includes(59) &&
    item.plug &&
    item.perks.length
  ) {
    const name = item.displayProperties.name;
    const description = perks[item.perks[0].perkHash].displayProperties.description || '';
    const hash = item.hash;
    const enhanced = getEnhanced(name);
    const stacks = getStacks(description);
    const affinity = (item.plug.energyCost && item.plug.energyCost.energyType) || false;

    getFailureMessages(item);

    mods[hash] = {};

    enhanced ? (mods[hash].enhanced = enhanced) : false;
    affinity ? (mods[hash].affinity = affinity) : false;
    stacks ? (mods[hash].stacks = stacks) : false;

    // Remove empty object from mods
    if (Object.entries(mods[hash]).length === 0 && mods[hash].constructor === Object) {
      delete mods[hash];
    }
  }
});

writeFile('./output/mod-data.json', mods);
writeFile('./output/mod-data-failure-messages.json', failureMessages);

function getEnhanced(name) {
  if (name.includes('Enhanced')) {
    return 1;
  } else if (name.includes('Supreme')) {
    return 2;
  } else {
    return false;
  }
}

function getStacks(description) {
  if (DEBUG && description.includes('stack')) {
    console.log(description);
  }

  if (description.includes('Multiple copies of this mod stack to increase this benefit.')) {
    return true;
  } else if (description.includes('does not stack') || description.includes('cannot stack')) {
    return false;
  } else {
    return false;
  }
}

function getFailureMessages(item) {
  for (i = 0; i < item.plug.insertionRules.length; i++) {
    if (
      failureMessages[item.plug.insertionRules[i].failureMessage] &&
      failureMessages[item.plug.insertionRules[i].failureMessage][i]
    ) {
      failureMessages[item.plug.insertionRules[i].failureMessage][i].push(item.hash);
    } else if (!failureMessages[item.plug.insertionRules[i].failureMessage]) {
      failureMessages[item.plug.insertionRules[i].failureMessage] = {};
      failureMessages[item.plug.insertionRules[i].failureMessage][i] = [item.hash];
    } else {
      failureMessages[item.plug.insertionRules[i].failureMessage][i] = [item.hash];
    }
  }
}
