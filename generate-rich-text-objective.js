const { writeFile, getMostRecentManifest, sortObject } = require('./helpers.js');

const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

const objectives = mostRecentManifestLoaded.DestinyObjectiveDefinition;
const perks = mostRecentManifestLoaded.DestinySandboxPerkDefinition;

const iconFinder = /(\[[^\]]+\]|[\uE000-\uF8FF])/g;

const richTexts = {};

Object.values(objectives).forEach(function(objective) {
  const match = objective.progressDescription && objective.progressDescription.match(iconFinder);
  if (match && match.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = objective.hash;
  }
});

Object.values(perks).forEach(function(perk) {
  const match =
    perk.displayProperties.description && perk.displayProperties.description.match(iconFinder);
  if (match && match.length === 1 && !richTexts[match[0]]) {
    richTexts[match[0]] = perk.hash;
  }
});

writeFile('./output/objective-richTexts.json', sortObject(richTexts));
