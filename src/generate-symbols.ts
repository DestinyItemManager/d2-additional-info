import { getAllDefs } from '@d2api/manifest-node';
import { FontGlyphs } from '../data/d2-font-glyphs.js';
import { writeFile } from './helpers.js';
import { warnLog } from './log.js';

const TAG = 'SYMBOLS';

/**
 * These glyphs are ordered in a "reasonable" way because this is the order UI might display them
 * (since the codepoints are somewhat arbitrary).
 * If Bungie-provided objectives end up with a new rich text replacement (like "[Headshot] Precision Kills"),
 * put the name in brackets here too so that DIM can replace the rich text stuff the same way.
 */
const data: [glyph: FontGlyphs, name?: string][] = [
  [FontGlyphs.void_shield, 'Banner Shield'],
  [FontGlyphs.void_titan_super, 'Sentinel Shield'],
  [FontGlyphs.void_blades, 'Spectral Blades'],
  [FontGlyphs.void_hunter_super, 'Shadowshot'],
  [FontGlyphs.nova_pulse, 'Nova Warp'],
  [FontGlyphs.nova_bomb, 'Nova Bomb'],

  [FontGlyphs.thermal_maul, 'Burning Maul'],
  [FontGlyphs.solar_tian_super, 'Hammer of Sol'],
  [FontGlyphs.thermal_knives, 'Blade Barrage'],
  [FontGlyphs.golden_gun, 'Golden Gun'],
  [FontGlyphs.healing_sword, 'Well of Radiance'],
  [FontGlyphs.warlock_blade, 'Daybreak'],

  [FontGlyphs.meteor_strike, 'Thundercrash'],
  [FontGlyphs.fist_of_havoc, 'Fists of Havoc'],
  [FontGlyphs.arc_staff, 'Whirlwind Guard'],
  [FontGlyphs.hunter_staff, 'Arc Staff'],
  [FontGlyphs.arc_hunter_super, 'Gathering Storm'],
  [FontGlyphs.arc_beam, 'Chaos Reach'],
  [FontGlyphs.arc_warlock_super, 'Stormtrance'],

  [FontGlyphs.strand_titan_berserker_super, 'Bladefury'],
  [FontGlyphs.strand_rope_dart_super, 'Silkstrike'],
  [FontGlyphs.strand_warlock_minion_super, 'Needlestorm'],

  [FontGlyphs.stasis_titan_super, 'Glacial Quake'],
  [FontGlyphs.stasis_hunter_super, 'Silence and Squall'],
  [FontGlyphs.stasis_warlock_super, "Winter's Wrath"],

  [FontGlyphs.melee, '[Melee]'],
  [FontGlyphs.grenade, '[Grenade]'],
  [FontGlyphs.hunter_smoke],
  [FontGlyphs.environment_hazard],

  [FontGlyphs.void_shield_throw, 'Shield Throw'],
  [FontGlyphs.hammer_throw_melee, 'Throwing Hammer'],
  [FontGlyphs.arc_titan_melee2, 'Thunderclap'],
  [FontGlyphs.stasis_titan_melee, 'Shiver Strike'],
  [FontGlyphs.solar_hammer_slam, 'Consecration'],

  [FontGlyphs.void_quickfall],
  [FontGlyphs.throwing_knife, 'Throwing Knife'],
  [FontGlyphs.solar_dynamite, 'Gunpowder Gamble'],
  [FontGlyphs.stasis_hunter_melee, 'Withering Blade'],

  [FontGlyphs.void_soul, 'Child of the Old Gods'],
  [FontGlyphs.void_ball, 'Pocket Singularity'],
  [FontGlyphs.solar_blast, 'Incinerator Snap'],
  [FontGlyphs.arc_drone, 'Arc Soul'],
  [FontGlyphs.arc_warlock_aspect, 'Lightning Surge'],
  [FontGlyphs.stasis_turret, 'Bleak Watcher'],
  [FontGlyphs.stasis_warlock_melee, 'Penumbral Blast'],

  [FontGlyphs.balloom, 'Volatile'],
  [FontGlyphs.arc_jolt, 'Jolted'],
  [FontGlyphs.stasis_grenade_bolt, 'Coldsnap Grenade'],
  [FontGlyphs.stasis_grenade_flare, 'Duskfield Grenade'],
  [FontGlyphs.stasis_grenade_wave, 'Glacier Grenade'],
  [FontGlyphs.stasis_encasement_shatter, 'Shatter'],
  [FontGlyphs.stasis_crystal_shatter, 'Shatter'],

  [FontGlyphs.strand_threadling, 'Threadling'],
  [FontGlyphs.strand_infest, 'Sever'],
  [FontGlyphs.strand_tangle, 'Tangle'],
  [FontGlyphs.strand_suspend_grenade, 'Shackle Grenade'],
  [FontGlyphs.strand_threadling_grenade, 'Threadling Grenade'],
  [FontGlyphs.strand_grappling_hook, 'Grapple'],
  [FontGlyphs.strand_severing_leap_melee, 'Frenzied Blade'],
  [FontGlyphs.strand_titan_suspend_brace, "Drengr's Lash"],
  [FontGlyphs.strand_titan_slide_melee, 'Flechette Storm'],
  [FontGlyphs.strand_rope_dart_melee, 'Threaded Spike'],
  [FontGlyphs.strand_hunter_quickfall, 'Ensnaring Slam'],
  [FontGlyphs.strand_hunter_clone, 'Threaded Specter'],
  [FontGlyphs.strand_hunter_buzzsaw, 'Whirling Maelstrom'],
  [FontGlyphs.strand_seize_melee, 'Arcane Needle'],
  [FontGlyphs.strand_warlock_suspend_tangle, 'The Wanderer'],

  [FontGlyphs.bow, '[Bow]'],
  [FontGlyphs.auto_rifle, '[Auto Rifle]'],
  [FontGlyphs.pulse_rifle, '[Pulse Rifle]'],
  [FontGlyphs.scout_rifle, '[Scout Rifle]'],
  [FontGlyphs.hand_cannon, '[Hand Cannon]'],
  [FontGlyphs.sidearm, '[Sidearm]'],
  [FontGlyphs.smg, '[SMG]'],

  [FontGlyphs.shotgun, '[Shotgun]'],
  [FontGlyphs.sniper_rifle, '[Sniper Rifle]'],
  [FontGlyphs.fusion_rifle, '[Fusion Rifle]'],
  [FontGlyphs.grenade_launcher_field_forged, '[Special Grenade Launcher]'],
  [FontGlyphs.glaive, '[Glaive]'],
  [FontGlyphs.beam_weapon, '[Trace Rifle]'],

  [FontGlyphs.rocket_launcher, '[Rocket Launcher]'],
  [FontGlyphs.grenade_launcher, '[Grenade Launcher]'],
  [FontGlyphs.wire_rifle, '[Linear Fusion Rifle]'],
  [FontGlyphs.sword_heavy, '[Sword]'],
  [FontGlyphs.machinegun, '[Machine Gun]'],

  [FontGlyphs.headshot, '[Headshot]'],

  // This is the Scorch Cannon, which appears in an objective
  // but for which Bungie.net doesn't have a [replacement]
  [FontGlyphs.spear_launcher],

  [FontGlyphs.arc, '[Arc]'],
  [FontGlyphs.void, '[Void]'],
  [FontGlyphs.thermal, '[Solar]'],
  [FontGlyphs.stasis, '[Stasis]'],
  [FontGlyphs.strand_kill, '[Strand]'],

  [FontGlyphs.combat_role_pierce, '[Shield-Piercing]'],
  [FontGlyphs.combat_role_stagger, '[Stagger]'],
  [FontGlyphs.combat_role_overload, '[Disruption]'],

  [FontGlyphs.lostsector, 'Lost Sector'],
  [FontGlyphs.gilded_title],
  [FontGlyphs.quest, '[Quest]'],
];

const output: {
  codepoint: number;
  glyph: string;
  source?: Source;
}[] = [];

const translateManually = [];
const failedToFindSource = [];

interface Source {
  tableName: 'Trait' | 'InventoryItem' | 'SandboxPerk' | 'ActivityMode' | 'Objective';
  fromRichText: boolean;
  hash: number;
}

const traits = getAllDefs('Trait');
const items = getAllDefs('InventoryItem');
const perks = getAllDefs('SandboxPerk');
const activities = getAllDefs('ActivityMode');
const objectives = getAllDefs('Objective');

// First, index all rich text data from the defs
type fromRichTextManifestSourceData = Record<
  string,
  [tableName: 'Objective' | 'SandboxPerk', hash: number, used: boolean]
>;
const fromRichTexts: fromRichTextManifestSourceData = {};
const iconFinder = /(\[[^\]]+\])/g;

objectives.forEach((objective) => {
  const match = objective.progressDescription?.match(iconFinder);
  if (match?.length === 1 && !fromRichTexts[match[0]]) {
    fromRichTexts[match[0]] = ['Objective', objective.hash, false];
  }
});

perks.forEach((perk) => {
  const match = perk.displayProperties.description?.match(iconFinder);
  if (match?.length === 1 && !fromRichTexts[match[0]]) {
    fromRichTexts[match[0]] = ['SandboxPerk', perk.hash, false];
  }
});

const findSource: (name: string) => Source | undefined = (name: string) => {
  const fromRichText = fromRichTexts[name];
  if (fromRichText) {
    fromRichText[2] = true;
    return { tableName: fromRichText[0], hash: fromRichText[1], fromRichText: true };
  }
  const trait = traits.find((t) => t.displayProperties?.name === name);
  if (trait) {
    return { tableName: 'Trait', hash: trait.hash, fromRichText: false };
  }
  const item = items.find((t) => t.displayProperties?.name === name);
  if (item) {
    return { tableName: 'InventoryItem', hash: item.hash, fromRichText: false };
  }
  const perk = perks.find((t) => t.displayProperties?.name === name);
  if (perk) {
    return { tableName: 'SandboxPerk', hash: perk.hash, fromRichText: false };
  }
  const activity = activities.find((t) => t.displayProperties?.name === name);
  if (activity) {
    return { tableName: 'ActivityMode', hash: activity.hash, fromRichText: false };
  }
};

for (const [glyph, name] of data) {
  if (name) {
    const source = findSource(name);
    output.push({ codepoint: glyph, glyph: String.fromCodePoint(glyph), source });
    if (!source) {
      warnLog(TAG, `symbol names: no corresponding def for name ${name}`);
      failedToFindSource.push(name);
    }
  } else {
    output.push({ codepoint: glyph, glyph: String.fromCodePoint(glyph) });
    translateManually.push(glyph);
  }
}

const outString =
  "export const symbolData: {codepoint: number; glyph: string, source?: {tableName: 'Trait' | 'InventoryItem' | 'SandboxPerk' | 'ActivityMode' | 'Objective', hash: number, fromRichText: boolean }}[] =" +
  JSON.stringify(output, null, 2) +
  ';\nconst translateManually = ' +
  JSON.stringify(translateManually, null, 2) +
  'as const;\n' +
  'export type TranslateManually = typeof translateManually[number];\n\n' +
  '/*\n * Could not find a source for (did the definitions disappear?):\n' +
  failedToFindSource.map((name) => ` * ${name}`).join('\n') +
  '\n\n' +
  ' * Unused rich text replacements (these should only be input actions replaced with the mapped buttons by the game):\n' +
  Object.entries(fromRichTexts)
    .filter(([_name, [_t, _h, used]]) => !used)
    .map(([name]) => ` * ${name}`)
    .join('\n') +
  '\n */';

writeFile('./output/symbol-name-sources.ts', outString);
