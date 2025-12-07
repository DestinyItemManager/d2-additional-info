<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# d2-additional-info

Destiny 2 data generation tool that produces JSON and TypeScript files used by [DIM (Destiny Item Manager)](https://github.com/DestinyItemManager/DIM). This project processes the Destiny 2 manifest to extract and organize game data that isn't readily available through the standard Bungie API.

## Prerequisites

- **Node.js** >= 22 (check with `node --version`)
- **pnpm** >= 10 (check with `pnpm --version`)
- **Bungie API Key** - Set as `API_KEY` environment variable ([Get one here](https://www.bungie.net/en/Application))

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate all data files
pnpm generate-data
```

## Usage

### Generate All Data

```bash
pnpm generate-data
```

This runs all `generate-*.ts` scripts in priority order, producing JSON and TypeScript files in the `output/` directory.

### Generate Specific Files (for debugging)

```bash
pnpm generate-data-sub {script-name} {script-name-2} ...
```

Example:
```bash
pnpm generate-data-sub season-info source-info
```

**Note:** Script names are without the `generate-` prefix or `.ts` extension.

### Other Commands

```bash
# Lint code
pnpm lint:eslint

# Format code
pnpm fix:prettier

# Build TypeScript
pnpm build
```

## Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide for contributing to this project
- **[EVENTS.md](EVENTS.md)** - Reference table of Destiny 2 events
- **[SEASONS.md](SEASONS.md)** - Reference table of Destiny 2 seasons
- **[CHANGELOG.md](CHANGELOG.md)** - API changes and deprecations

## Output Files

This project generates JSON and TypeScript data files in the `output/` directory. These files provide supplemental Destiny 2 data for use in applications like DIM.

Files marked **[DEPRECATED]** will be removed in a future version (see [CHANGELOG.md](CHANGELOG.md) for details).

| File | Description |
| ---- | ----------- |
| adept-weapon-hashes.json                           | Array of all Adept weapon hashes                                                                                                                       |
| bad-vendors.json                                   | Vendor hashes missing an associated token hash                                                                                         |
| bright-engram.json                                 | Season hash to Bright Engram hash mappings                                                                                                                        |
| catalyst-triumph-icons.json                        | Catalyst triumph hash to improved icon mappings                                                                                                                   |
| craftable-hashes.json                              | Array of all craftable weapon hashes                                                                                                                         |
| crafting-enhanced-intrinsics.ts                    | Set of all enhanced intrinsic perk hashes with labels                                                                                    |
| crafting-mementos.json                             | Memento source to memento hash array mappings                                                                                                    |
| d2-event-info.ts **[DEPRECATED]**                      | Event information mappings (see EVENTS.md)                                                                                                |
| d2-event-info-v2.ts                                | Event information mappings (see EVENTS.md)                                                                                                |
| d2-font-glyphs.ts                                  | Enum of Destiny 2 font glyphs                                                                                                                                      |
| d2-season-info.ts                                  | Season information and metadata                                                                                                               |
| d2-trials-objectives.json                          | Trials objective and passage hash mappings                                                                                                  |
| deprecated-mods.json                               | Array of all deprecated mod hashes                                                                                                                           |
| DestinySymbols.woff2                               | Web font containing Destiny glyphs (see d2-font-glyphs.ts for enum)                                                                                                       |
| dummy-catalyst-mapping.json                        | Dummy catalyst to actual catalyst hash mappings for older catalyst socket system (where catalysts auto-apply)          |
| empty-plug-hashes.ts                               | Set of "empty" plug hashes (e.g., No Shader, No Mod Inserted)                                                                                       |
| energy-mods-change.json                            | Armor 2.0 energy capacity mod lookup table for changing elements                                                                                      |
| energy-mods.json                                   | Armor 2.0 energy capacity mod lookup table for same element                                                                                        |
| engram-rarity-icons.json                           | Engram rarity to icon path mappings                                                                                                                                              |
| events.json                                        | Item hash to event hash mappings (see EVENTS.md)                                                                                                          |
| exotic-to-catalyst-record.json                     | Exotic weapon hash to catalyst record hash mappings                                                                                                                              |
| exotics-with-catalyst.ts                           | Array of exotic weapon hashes with catalysts                                                                                                    |
| extended-breaker.json                              | Item hash to breaker type hash mappings for items with breaker properties only identified by text                                                       |
| extended-ich.json                                  | Weapon hash to negative item category hash mappings (separates slug/pellet shotguns and breech/heavy grenade launchers)             |
| focusing-item-outputs.json                         | Fake vendor focusing item hash to output item hash mappings                                                                                             |
| generated-enums.ts                                 | General-purpose Destiny 2 enums                                                                                                                                             |
| ghost-perks.json                                   | Outdated ghost perk listing from before Ghost 2.0                                                                                                             |
| item-def-workaround-replacements.json **[DEPRECATED]** | Dummy postmaster weapon to actual hash mappings (last used in Dawn)                                                              |
| legacy-triumphs.json                               | Array of all legacy triumph hashes                                                                                                                                  |
| lightcap-to-season.json                            | Light cap to season number mappings                                                                                                                                   |
| masterworks-with-cond-stats.json                   | Array of masterwork plugs with conditional stats                                                                                       |
| missing-faction-tokens.json **[DEPRECATED]**           | Previously missing faction tokens                                                                                                   |
| missing-source-info.ts **[DEPRECATED]**                | Sources and item hashes that were missing source hash                                                                                                    |
| mods-with-bad-descriptions.json                    | Mods with inaccurate descriptions by category                                                           |
| mutually-exclusive-mods.json                       | Armor mod hash to mutual exclusion category mappings (for "Similar mod already applied" behavior)                                                                    |
| objective-richTexts.ts                             | Destiny rich text mappings                                                                                                                                        |
| powerful-rewards.json                              | Array of item hashes containing powerful rewards                                                                                                                   |
| pursuits.json                                      | Pursuit to completion criteria mappings                                                                                                            |
| raid-mod-plug-category-hashes.json                 | Array of raid mod plug category hashes                                                                                                                                    |
| reduced-mod-cost-hashes.ts                         | Artifact mod to reduced-cost variant mappings                                                       |
| season-tags.json                                   | Season name (short) to season number mappings                                                                                                                 |
| season-to-source.json **[DEPRECATED]**                 | Source to season mappings                                                                                                        |
| source-to-season-v2.json                           | Source to season mappings                                                                                                        |
| seasonal-challenges.json                           | Seasonal challenge to completion criteria mappings                                                                                                 |
| seasonal-armor-mods.json                           | Armor mods only available in certain seasons (in addition to reduced-cost versions)                              |
| seasons_backup.json **[DEPRECATED]**                   | 1:1 item hash to season mappings                                                                                                       |
| seasons.json                                       | Item hash to season mappings (excludes items with season deducible from watermarks or sources) |
| source-info.ts **[DEPRECATED]**                        | Tag to source mappings                                                                                                             |
| source-info-v2.ts                                  | Tag to source mappings                                                                                                             |
| sources.json                                       | Source hash to source description mappings                                                                                                                  |
| special-vendors-strings.json                       | Vendors with specific strings for asset finding, filtering, etc.                                                 |
| spider-mats.json                                   | Array of materials Spider (now Rahool) used to sell                                                                            |
| spider-purchaseables-to-mats.json                  | Vendor item hash to actual item hash mappings for Spider (now Rahool)                                                                                                        |
| subclass-plug-category-hashes.json                 | Array of subclass plug category hashes                                                                                                                               |
| symbol-name-sources.ts                             | Well-known Destiny 2 font symbols with localized name retrieval from definitions                                                       |
| trait-to-enhanced-trait.json                       | Normal trait to enhanced trait hash mappings                                                                                                                 |
| universal-ornament-plugsethashes.json              | Array of universal ornament PlugSet hashes (check canInsert instead of enabled for availability)                                             |
| universal-ornament-aux-sets.json                   | Class type to universal ornament set mappings where set grouping cannot be derived from collections                                                |
| unreferenced-collections-items.json                | Collection entry to additional covered item mappings                                                                                                      |
| voice-dim-valid-perks.json                         | Array of valid perk names for use in VoiceDIM                                                                                                                   |
| watermark-to-event.json                            | Watermark icon to event mappings (see EVENTS.md)                                                                                            |
| watermark-to-season.json                           | Watermark icon to season mappings                                                                                                           |
| weapon-from-quest.json                             | Weapon hash to initial quest step hash mappings                                                                                         |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/delphiactual"><img src="https://avatars.githubusercontent.com/u/4798491?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rob Jones</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/issues?q=author%3Adelphiactual" title="Bug reports">🐛</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=delphiactual" title="Code">💻</a> <a href="#data-delphiactual" title="Data">🔣</a> <a href="#ideas-delphiactual" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-delphiactual" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Adelphiactual" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/ryan-rushton"><img src="https://avatars.githubusercontent.com/u/7344652?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Rushton</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=ryan-rushton" title="Code">💻</a> <a href="#data-ryan-rushton" title="Data">🔣</a> <a href="#ideas-ryan-rushton" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-ryan-rushton" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Aryan-rushton" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/bhollis"><img src="https://avatars.githubusercontent.com/u/313208?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ben Hollis</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=bhollis" title="Code">💻</a> <a href="#data-bhollis" title="Data">🔣</a> <a href="#ideas-bhollis" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-bhollis" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Abhollis" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/robojumper"><img src="https://avatars.githubusercontent.com/u/14299449?v=4?s=100" width="100px;" alt=""/><br /><sub><b>robojumper</b></sub></a><br /><a href="https://github.com/DestinyItemManager/d2-additional-info/commits?author=robojumper" title="Code">💻</a> <a href="#data-robojumper" title="Data">🔣</a> <a href="#ideas-robojumper" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-robojumper" title="Maintenance">🚧</a> <a href="https://github.com/DestinyItemManager/d2-additional-info/pulls?q=is%3Apr+reviewed-by%3Arobojumper" title="Reviewed Pull Requests">👀</a></td>
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
