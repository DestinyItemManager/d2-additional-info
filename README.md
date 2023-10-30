<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

## How to use:

- yarn install
- yarn build
- yarn manifest:get
- yarn generate-data

## What's included?

| filename                              | contents                                                                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adept-weapon-hashes.json              | an array containing all adept(type) weapon hashes                                                                                                                       |
| bad-vendors.json                      | an array containing all vendor hashes that are missing an associated token hash                                                                                         |
| bright-engram.json                    | a mapping from season hash to bright engram hash                                                                                                                        |
| catalyst-triumph-icons.json           | a mapping from catalyst triumph hash to a better icon                                                                                                                   |
| craftable-hashes.json                 | an array containing all craftable weapon hashes                                                                                                                         |
| crafting-enhanced-intrinsics.ts       | a set containing all enhanced intrinsic perk hashes along with a comment labeling it                                                                                    |
| crafting-mementos.json                | a mapping from memento source (string) to an array of memento hashes                                                                                                    |
| d2-event-info.ts                      | a mapping containing information about event information (see EVENTS.md)                                                                                                |
| d2-font-glyphs.ts                     | an enum listing of the font glyphs                                                                                                                                      |
| d2-season-info.ts                     | a mapping containing useful information about the seasons                                                                                                               |
| d2-trials-objectives.json             | a mapping containing trials objective hashes and trials passage hashes                                                                                                  |
| deprecated-mods.json                  | an array containing all deprecated mod hashes                                                                                                                           |
| DestinySymbols.woff2                  | woff containing Destiny Glyphs, refer to d2-font-glyphs for enums                                                                                                       |
| empty-plug-hashes.ts                  | a set containing a listing of all "empty" plugs (e.g. No Shader, No Mod Inserted)                                                                                       |
| energy-mods-change.json               | table for looking up energy capacity mods for Armor 2.0 to change between elements                                                                                      |
| energy-mods.json                      | table for looking up energy capacity mods for Armor 2.0 staying the same element                                                                                        |
| engram-rarity-icons.json              | engram rarity to icon path                                                                                                                                              |
| events.json                           | a mapping between item hashes and event hashes (see EVENTS.md)                                                                                                          |
| exotic-to-catalyst-record.json        | exotic weapon hash to catalyst record hash                                                                                                                              |
| exotics-with-catalyst.ts              | a listing of all exotic weapon hashes that currently hash a catalyst                                                                                                    |
| extended-breaker.json                 | a listing between item hash and breaker type hash, for items that have breaker properties only identified by text                                                       |
| extended-ich.json                     | a listing between weapon hash and a negative item category hash. this allows for separation between slug/pellet shotguns and breech/heavy grenade launchers             |
| focusing-item-outputs.json            | a mapping from fake vendor focusing item hashes to their output item hashes                                                                                             |
| generated-enums.ts                    | general use destiny 2 enums                                                                                                                                             |
| ghost-perks.json                      | an outdated listing of a ghost perks, from before ghost 2.0                                                                                                             |
| item-def-workaround-replacements.json | deprecated mapping from dummy weapons in postmaster to their actual hashes when pulled (last used in Dawn)                                                              |
| legacy-triumphs.json                  | a listing of all legacy triumph hashes                                                                                                                                  |
| lightcap-to-season.json               | a mapping between lightcap and season                                                                                                                                   |
| masterworks-with-cond-stats.json      | an array containing a listing of all masterwork plugs that have conditional stats                                                                                       |
| missing-faction-tokens.json           | a deprecated listing of faction tokens that were missing at one point                                                                                                   |
| missing-source-info.ts                | a listing of sources and item hashes that were missing a source hash                                                                                                    |
| mods-with-bad-descriptions.json       | a mapping of all mods under specific catagories that have descriptions that don't match the effect accurately                                                           |
| mutually-exclusive-mods.json          | mapping from armor mod hash -> mutual exclusion category, for "Similar mod already applied" behavior                                                                    |
| objective-richTexts.ts                | a mapping for Destiny Rich Texts                                                                                                                                        |
| powerful-rewards.json                 | an array of item hashes that contain powerful rewards                                                                                                                   |
| pursuits.json                         | a mapping between pursuits and the criteria to complete them                                                                                                            |
| raid-mod-plug-category-hashes.json    | an array of raid mod category hashes                                                                                                                                    |
| reduced-mod-cost-hashes.ts            | artifact mods make separate, reduced-cost copies of mods available. this contains mappings between these variants                                                       |
| season-tags.json                      | a mapping between season name (short) and season number                                                                                                                 |
| season-to-source.json                 | a mapping between sources and the season they were introduced in                                                                                                        |
| seasonal-challenges.json              | a mapping between seasonal challenges and the criteria to complete them                                                                                                 |
| seasonal-armor-mods.json              | a list of armor mods that might only be available in certain seasons (in addition to the reduced-cost versions in reduced-mod-cost-hashes)                              |
| seasons_backup.json                   | a 1:1 listing of every item hash and the season it was introduced                                                                                                       |
| seasons.json                          | a listing of item hashes to season, this does not include items that the season can be deduced another way (e.g. displayVersionWatermarkIcons or sources with a season) |
| source-info.ts                        | a listing between tags and the sources associated with them                                                                                                             |
| sources.json                          | a listing containing source hash to source description                                                                                                                  |
| spider-mats.json                      | an array of item hashes containing materials Spider (now Rahool) used to posses for purchase                                                                            |
| spider-purchaseables-to-mats.json     | Vendor item hashes to actual item hashes for Spider (now Rahool)                                                                                                        |
| subclass-plug-category-hashes.json    | an array of subclass plug category hashes                                                                                                                               |
| symbol-name-sources.ts                | well-known and useful Destiny 2 font symbols together with a way to retrieve localized names from the definitions                                                       |
| trait-to-enhanced-trait.json          | a mapping between normal trait and its enhanced variant                                                                                                                 |
| universal-ornament-plugsethashes.json | an array of hashes for univeral ornament PlugSets, because you need to check canInsert instead of enabled for availability                                              |
| universal-ornament-aux-sets.json      | a mapping from classType -> universal ornament sets for sets where where set grouping cannot be derived from collections                                                |
| unreferenced-collections-items.json   | a map of collections entries to additional items they should cover                                                                                                      |
| voice-dim-valid-perks.json            | a listing of all valid perk names for use in voiceDIM                                                                                                                   |
| watermark-to-event.json               | a mapping between watermark icon and the event it belongs to (see EVENTS.md)                                                                                            |
| watermark-to-season.json              | a mapping between watermark icon and the season it belongs to                                                                                                           |
| weapon-from-quest.json                | a mapping between weapon hashes and the initial quest step hash that rewards it                                                                                         |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/delphiactual"><img src="https://avatars.githubusercontent.com/u/4798491?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rob Jones</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/issues?q=author%3Adelphiactual" title="Bug reports">🐛</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=delphiactual" title="Code">💻</a> <a href="#data-delphiactual" title="Data">🔣</a> <a href="#ideas-delphiactual" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-delphiactual" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Adelphiactual" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/ryan-rushton"><img src="https://avatars.githubusercontent.com/u/7344652?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Rushton</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=ryan-rushton" title="Code">💻</a> <a href="#data-ryan-rushton" title="Data">🔣</a> <a href="#ideas-ryan-rushton" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-ryan-rushton" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Aryan-rushton" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://vivekh.nz"><img src="https://avatars.githubusercontent.com/u/17512262?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vivek Hari</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=vivekhnz" title="Code">💻</a> <a href="#data-vivekhnz" title="Data">🔣</a> <a href="#ideas-vivekhnz" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://thomchap.com.au"><img src="https://avatars.githubusercontent.com/u/156681?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tom Chapman</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=justrealmilk" title="Code">💻</a> <a href="#data-justrealmilk" title="Data">🔣</a></td>
    <td align="center"><a href="https://github.com/Jakosaur"><img src="https://avatars.githubusercontent.com/u/20144356?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jakosaur</b></sub></a><br /><a href="#data-Jakosaur" title="Data">🔣</a></td>
    <td align="center"><a href="https://www.asinusi.com"><img src="https://avatars.githubusercontent.com/u/39223510?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Abdul Sinusi</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=asinusi" title="Code">💻</a> <a href="#data-asinusi" title="Data">🔣</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
