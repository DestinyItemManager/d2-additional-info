import { getAllDefs } from '@d2api/manifest-node';
import { FontGlyphs } from '../data/d2-font-glyphs.js';
import { DimCustomSymbols } from '../data/dim-custom-symbols.js';
import { writeFile } from './helpers.js';
import { warnLog } from './log.js';

const TAG = 'SYMBOLS';

/**
 * These glyphs are ordered in a "reasonable" way because this is the order UI might display them
 * (since the codepoints are somewhat arbitrary).
 * If Bungie-provided objectives end up with a new rich text replacement (like "[Headshot] Precision Kills"),
 * put the name in brackets here too so that DIM can replace the rich text stuff the same way.
 */
const data: [glyph: FontGlyphs | DimCustomSymbols, name?: string][] = [
  // Supers
  [DimCustomSymbols.supers, 'Supers'],
  // Arc
  [FontGlyphs.hunter_staff, 'Arc Staff'],
  [FontGlyphs.arc_staff, 'Whirlwind Guard'],
  [FontGlyphs.arc_hunter_super, 'Gathering Storm'],
  [FontGlyphs.fist_of_havoc, 'Fists of Havoc'],
  [FontGlyphs.meteor_strike, 'Thundercrash'],
  [FontGlyphs.arc_warlock_super, 'Stormtrance'],
  [FontGlyphs.arc_beam, 'Chaos Reach'],
  // Solar
  [FontGlyphs.golden_gun, 'Golden Gun - Deadshot'],
  [DimCustomSymbols.golden_gun_marksman, 'Golden Gun - Marksman'],
  [FontGlyphs.thermal_knives, 'Blade Barrage'],
  [FontGlyphs.solar_tian_super, 'Hammer of Sol'],
  [FontGlyphs.thermal_maul, 'Burning Maul'],
  [FontGlyphs.warlock_blade, 'Daybreak'],
  [DimCustomSymbols.daybreak, 'Daybreak'],
  [FontGlyphs.healing_sword, 'Well of Radiance'],
  // Void
  [FontGlyphs.void_hunter_super, 'Shadowshot: Deadfall'],
  [DimCustomSymbols.shadowshot_moebius_quiver, 'Shadowshot: Moebius Quiver'],
  [FontGlyphs.void_blades, 'Spectral Blades'],
  [FontGlyphs.void_titan_super, 'Sentinel Shield'],
  [FontGlyphs.void_shield, 'Banner Shield'],
  [DimCustomSymbols.ward_of_dawn, 'Ward of Dawn'],
  [FontGlyphs.nova_bomb, 'Nova Bomb'],
  [DimCustomSymbols.nova_bomb_cataclysm, 'Nova Bomb: Cataclysm'],
  [DimCustomSymbols.nova_bomb_vortex, 'Nova Bomb: Vortex'],
  [FontGlyphs.nova_pulse, 'Nova Warp'],
  // Stasis
  [FontGlyphs.stasis_hunter_super, 'Silence and Squall'],
  [FontGlyphs.stasis_titan_super, 'Glacial Quake'],
  [FontGlyphs.stasis_warlock_super, "Winter's Wrath"],
  // Strand
  [FontGlyphs.strand_rope_dart_super, 'Silkstrike'],
  [FontGlyphs.strand_titan_berserker_super, 'Bladefury'],
  [FontGlyphs.strand_warlock_minion_super, 'Needlestorm'],

  // Melees
  [FontGlyphs.melee, '[Melee]'],
  // Arc
  [DimCustomSymbols.combination_blow, 'Combination Blow'],
  [DimCustomSymbols.disorienting_blow, 'Disorienting Blow'],
  [DimCustomSymbols.seismic_strike, 'Seismic Strike'],
  [DimCustomSymbols.ballistic_slam, 'Ballistic Slam'],
  [FontGlyphs.arc_titan_melee2, 'Thunderclap'],
  [DimCustomSymbols.chain_lightning, 'Chain Lightning'],
  [DimCustomSymbols.ball_lightning, 'Ball Lightning'],
  // Solar
  [FontGlyphs.throwing_knife, 'Throwing Knife'],
  [DimCustomSymbols.knife_lightweight, 'Lightweight Knife'],
  [DimCustomSymbols.knife_proximity_explosive, 'Proximity Explosive Knife'],
  [DimCustomSymbols.knife_trick, 'Knife Trick'],
  [DimCustomSymbols.knife_weighted_throwing, 'Weighted Throwing Knife'],
  [DimCustomSymbols.hammer_strike, 'Hammer Strike'],
  [FontGlyphs.hammer_throw_melee, 'Throwing Hammer'],
  [DimCustomSymbols.celestial_fire, 'Celestial Fire'],
  [FontGlyphs.solar_blast, 'Incinerator Snap'],
  // Void
  [DimCustomSymbols.snare_bomb, 'Snare Bomb'],
  [FontGlyphs.hunter_smoke, 'Corrosive Smoke'],
  [DimCustomSymbols.shield_bash, 'Shield Bash'],
  [FontGlyphs.void_shield_throw, 'Shield Throw'],
  [FontGlyphs.void_ball, 'Pocket Singularity'],
  //Stasis
  [FontGlyphs.stasis_hunter_melee, 'Withering Blade'],
  [FontGlyphs.stasis_titan_melee, 'Shiver Strike'],
  [FontGlyphs.stasis_warlock_melee, 'Penumbral Blast'],
  // Strand
  [FontGlyphs.strand_rope_dart_melee, 'Threaded Spike'],
  [FontGlyphs.strand_severing_leap_melee, 'Frenzied Blade'],
  [FontGlyphs.strand_seize_melee, 'Arcane Needle'],

  // Grenades
  [FontGlyphs.grenade, '[Grenade]'],
  // Arc
  [DimCustomSymbols.grenade_arcbolt, 'Arcbolt Grenade'],
  [DimCustomSymbols.grenade_flashbang, 'Flashbang Grenade'],
  [DimCustomSymbols.grenade_flux, 'Flux Grenade'],
  [DimCustomSymbols.grenade_lightning, 'Lightning Grenade'],
  [DimCustomSymbols.grenade_pulse, 'Pulse Grenade'],
  [DimCustomSymbols.grenade_skip, 'Skip Grenade'],
  [DimCustomSymbols.grenade_storm, 'Storm Grenade'],
  // Solar
  [DimCustomSymbols.grenade_firebolt, 'Firebolt Grenade'],
  [DimCustomSymbols.grenade_fusion, 'Fusion Grenade'],
  [DimCustomSymbols.grenade_healing, 'Healing Grenade'],
  [DimCustomSymbols.grenade_incendiary, 'Incendiary Grenade'],
  [DimCustomSymbols.grenade_solar, 'Solar Grenade'],
  [DimCustomSymbols.grenade_swarm, 'Swarm Grenade'],
  [DimCustomSymbols.grenade_thermite, 'Thermite Grenade'],
  [DimCustomSymbols.grenade_tripmine, 'Tripmine Grenade'],
  // Void
  [DimCustomSymbols.grenade_axion_bolt, 'Axion Bolt'],
  [DimCustomSymbols.grenade_magnetic, 'Magnetic Grenade'],
  [DimCustomSymbols.grenade_scatter, 'Scatter Grenade'],
  [DimCustomSymbols.grenade_suppressor, 'Suppressor Grenade'],
  [DimCustomSymbols.grenade_void_spike, 'Void Spike'],
  [DimCustomSymbols.grenade_void_wall, 'Void Wall'],
  [DimCustomSymbols.grenade_vortex, 'Vortex Grenade'],
  // Stasis
  [FontGlyphs.stasis_grenade_bolt, 'Coldsnap Grenade'],
  [FontGlyphs.stasis_grenade_flare, 'Duskfield Grenade'],
  [FontGlyphs.stasis_grenade_wave, 'Glacier Grenade'],
  // Strand
  [FontGlyphs.strand_suspend_grenade, 'Shackle Grenade'],
  [FontGlyphs.strand_threadling_grenade, 'Threadling Grenade'],
  [FontGlyphs.strand_grappling_hook, 'Grapple'],

  // Class Abilities
  [DimCustomSymbols.class_abilities, 'Class Abilities'],
  // Hunter
  [DimCustomSymbols.dodge_gamblers, "Gambler's Dodge"],
  [DimCustomSymbols.dodge_marksmans, "Marksman's Dodge"],
  [DimCustomSymbols.dodge_acrobats, "Acrobat's Dodge"],
  // Titan
  [DimCustomSymbols.barricade_rally, 'Rally Barricade'],
  [DimCustomSymbols.barricade_towering, 'Towering Barricade'],
  [DimCustomSymbols.thruster, 'Thruster'],
  // Warlock
  [DimCustomSymbols.rift_empowering, 'Empowering Rift'],
  [DimCustomSymbols.rift_healing, 'Healing Rift'],
  [DimCustomSymbols.phoenix_dive, 'Phoenix Dive'],

  // Movement
  [DimCustomSymbols.movement, 'Movement'],
  // Hunter
  [DimCustomSymbols.jump_high, 'High Jump'],
  [DimCustomSymbols.jump_strafe, 'Strafe Jump'],
  [DimCustomSymbols.jump_triple, 'Triple Jump'],
  // Titan
  [DimCustomSymbols.lift_catapult, 'Catapult Lift'],
  [DimCustomSymbols.lift_high, 'High Lift'],
  [DimCustomSymbols.lift_strafe, 'Strafe Lift'],
  // Warlock
  [DimCustomSymbols.glide_balanced, 'Balanced Glide'],
  [DimCustomSymbols.glide_burst, 'Burst Glide'],
  [DimCustomSymbols.glide_strafe, 'Strafe Glide'],
  // Shared
  [DimCustomSymbols.blink, 'Blink'],

  // Aspects
  [DimCustomSymbols.aspects, 'Aspects'],
  [DimCustomSymbols.fragments, 'Fragments'],
  // Arc
  [DimCustomSymbols.flow_state, 'Flow State'],
  [DimCustomSymbols.lethal_current, 'Lethal Current'],
  [DimCustomSymbols.tempest_strike, 'Tempest Strike'],
  [DimCustomSymbols.juggernaut, 'Juggernaut'],
  [DimCustomSymbols.knockout, 'Knockout'],
  [DimCustomSymbols.touch_of_thunder, 'Touch of Thunder'],
  [DimCustomSymbols.arc_soul, 'Arc Soul'],
  [FontGlyphs.arc_drone, 'Arc Soul'],
  [DimCustomSymbols.electrostatic_mind, 'Electrostatic Mind'],
  [FontGlyphs.arc_warlock_aspect, 'Lightning Surge'],
  // Solar
  [FontGlyphs.solar_dynamite, 'Gunpowder Gamble'],
  [DimCustomSymbols.gunpowder_gamble, 'Gunpowder Gamble'],
  [DimCustomSymbols.knock_em_down, "Knock 'Em Down"],
  [DimCustomSymbols.on_your_mark, 'On Your Mark'],
  [FontGlyphs.solar_hammer_slam, 'Consecration'],
  [DimCustomSymbols.roaring_flames, 'Roaring Flames'],
  [DimCustomSymbols.sol_invictus, 'Sol Invictus'],
  [DimCustomSymbols.heat_rises, 'Heat Rises'],
  [DimCustomSymbols.icarus_dash, 'Icarus Dash'],
  [DimCustomSymbols.touch_of_flame, 'Touch of Flame'],
  // Void
  [DimCustomSymbols.stylish_executioner, 'Stylish Executioner'],
  [DimCustomSymbols.trappers_ambush, "Trapper's Ambush"],
  [FontGlyphs.void_quickfall],
  [DimCustomSymbols.vanishing_step, 'Vanishing Step'],
  [DimCustomSymbols.bastion, 'Bastion'],
  [FontGlyphs.balloom, 'Controlled Demolition'],
  [DimCustomSymbols.offensive_bulwark, 'Offensive Bulwark'],
  [DimCustomSymbols.chaos_accelerant, 'Chaos Accelerant'],
  [FontGlyphs.void_soul, 'Child of the Old Gods'],
  [DimCustomSymbols.feed_the_void, 'Feed the Void'],
  // Stasis
  [DimCustomSymbols.grim_harvest, 'Grim Harvest'],
  [DimCustomSymbols.shatterdive, 'Shatterdive'],
  [DimCustomSymbols.touch_of_winter, 'Touch of Winter'],
  [DimCustomSymbols.winters_shroud, "Winter's Shroud"],
  [DimCustomSymbols.cryoclasm, 'Cryoclasm'],
  [DimCustomSymbols.diamond_lance, 'Diamond Lance'],
  [FontGlyphs.stasis_titan_spear, 'Diamond Lance'],
  [DimCustomSymbols.diamond_lance_throw, 'Diamond Lance'],
  [DimCustomSymbols.stasis_titan_spear_slam, 'Diamond Lance'],
  [DimCustomSymbols.howl_of_the_storm, 'Howl of the Storm'],
  [DimCustomSymbols.tectonic_harvest, 'Tectonic Harvest'],
  [FontGlyphs.stasis_turret, 'Bleak Watcher'],
  [DimCustomSymbols.frostpulse, 'Frostpulse'],
  [DimCustomSymbols.glacial_harvest, 'Glacial Harvest'],
  [DimCustomSymbols.iceflare_bolts, 'Iceflare Bolts'],
  // Strand
  [FontGlyphs.strand_hunter_quickfall, 'Ensnaring Slam'],
  [DimCustomSymbols.widows_silk, "Widow's Silk"],
  [FontGlyphs.strand_titan_suspend_brace, "Drengr's Lash"],
  [DimCustomSymbols.into_the_fray, 'Into the Fray'],
  [DimCustomSymbols.mindspun_invocation, 'Mindspun Invocation'],
  [DimCustomSymbols.weavers_call, "Weaver's Call"],

  // Keywords
  [DimCustomSymbols.abilities, 'Abilities'],
  // Arc
  [DimCustomSymbols.amplified, 'Amplified'],
  [DimCustomSymbols.blind, 'Blind'],
  [DimCustomSymbols.ionic_trace, 'Ionic Trace'],
  [FontGlyphs.arc_jolt, 'Jolted'],
  // Solar
  [DimCustomSymbols.cure, 'Cure'],
  [DimCustomSymbols.firesprite, 'Firesprite'],
  [DimCustomSymbols.ignition, 'Ignition'],
  [DimCustomSymbols.radiant, 'Radiant'],
  [DimCustomSymbols.restoration, 'Restoration'],
  [DimCustomSymbols.scorch, 'Scorch'],
  // Void
  [DimCustomSymbols.devour, 'Devour'],
  [DimCustomSymbols.invisibility, 'Invisibility'],
  [DimCustomSymbols.overshield, 'Overshield'],
  [DimCustomSymbols.suppression, 'Suppression'],
  [DimCustomSymbols.void_breach, 'Void Breach'],
  [FontGlyphs.balloom, 'Volatile'],
  [DimCustomSymbols.weaken, 'Weaken'],
  // Stasis
  [FontGlyphs.stasis_encasement_shatter, 'Shatter'],
  [DimCustomSymbols.shatter, 'Shatter'],
  [DimCustomSymbols.slow, 'Slow'],
  [DimCustomSymbols.stasis_crystal, 'Stasis Crystal'],
  [FontGlyphs.stasis_crystal_shatter, 'Shatter'],
  [DimCustomSymbols.stasis_shard, 'Stasis Shard'],
  // Strand
  [FontGlyphs.strand_infest, 'Sever'],
  [DimCustomSymbols.suspend, 'Suspend'],
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
  [FontGlyphs.strand_threadling, 'Threadling'],
  [DimCustomSymbols.unravel, 'Unravel'],
  [DimCustomSymbols.into_the_fray, 'Woven Mail'],

  // Weapons
  // Primary
  [FontGlyphs.bow, '[Bow]'],
  [FontGlyphs.auto_rifle, '[Auto Rifle]'],
  [FontGlyphs.pulse_rifle, '[Pulse Rifle]'],
  [FontGlyphs.scout_rifle, '[Scout Rifle]'],
  [FontGlyphs.hand_cannon, '[Hand Cannon]'],
  [FontGlyphs.sidearm, '[Sidearm]'],
  [FontGlyphs.smg, '[SMG]'],
  // Special
  [FontGlyphs.shotgun, '[Shotgun]'],
  [FontGlyphs.sniper_rifle, '[Sniper Rifle]'],
  [FontGlyphs.fusion_rifle, '[Fusion Rifle]'],
  [FontGlyphs.grenade_launcher_field_forged, '[Special Grenade Launcher]'],
  [FontGlyphs.glaive, '[Glaive]'],
  [FontGlyphs.beam_weapon, '[Trace Rifle]'],
  [DimCustomSymbols.trace_rifle, '[Trace Rifle]'],
  // Heavy
  [FontGlyphs.rocket_launcher, '[Rocket Launcher]'],
  [FontGlyphs.grenade_launcher, '[Grenade Launcher]'],
  [FontGlyphs.wire_rifle, '[Linear Fusion Rifle]'],
  [FontGlyphs.sword_heavy, '[Sword]'],
  [FontGlyphs.machinegun, '[Machine Gun]'],
  // Other
  [FontGlyphs.headshot, '[Headshot]'],
  [FontGlyphs.spear_launcher], // Scorch Cannon
  [DimCustomSymbols.hive_relic], // Hive Sword

  // Damage Types
  [FontGlyphs.arc, '[Arc]'],
  [FontGlyphs.void, '[Void]'],
  [FontGlyphs.thermal, '[Solar]'],
  [FontGlyphs.stasis, '[Stasis]'],
  [FontGlyphs.strand_kill, '[Strand]'],
  [FontGlyphs.environment_hazard],
  [DimCustomSymbols.damage_kinetic, 'Kinetic'],

  // Weapon Stats
  [DimCustomSymbols.accuracy, 'Accuracy'],
  [DimCustomSymbols.blast_radius, 'Blast Radius'],
  [DimCustomSymbols.charge_time, 'Charge Time'],
  [DimCustomSymbols.draw_time, 'Draw Time'],
  [DimCustomSymbols.handling, 'Handling'],
  [DimCustomSymbols.impact, 'Impact'],
  [DimCustomSymbols.range, 'Range'],
  [DimCustomSymbols.reload_speed, 'Reload Speed'],
  [DimCustomSymbols.shield_duration, 'Shield Duration'],
  [DimCustomSymbols.stability, 'Stability'],
  [DimCustomSymbols.velocity, 'Velocity'],

  // Armor Stats
  [DimCustomSymbols.mobility, 'Mobility'],
  [DimCustomSymbols.resilience, 'Resilience'],
  [DimCustomSymbols.recovery, 'Recovery'],
  [DimCustomSymbols.discipline, 'Discipline'],
  [DimCustomSymbols.intellect, 'Intellect'],
  [DimCustomSymbols.strength, 'Strength'],

  // Armor Slots
  [DimCustomSymbols.helmet, 'Helmet'],
  [DimCustomSymbols.gloves, 'Gauntlets'],
  [DimCustomSymbols.chest, 'Chest Armor'],
  [DimCustomSymbols.boots, 'Leg Armor'],
  [DimCustomSymbols.class, 'Class Items'],

  // Breaker Types
  [FontGlyphs.combat_role_pierce, '[Shield-Piercing]'],
  [FontGlyphs.combat_role_stagger, '[Stagger]'],
  [FontGlyphs.combat_role_overload, '[Disruption]'],

  // Classes
  [DimCustomSymbols.class_hunter, 'Hunter'],
  [DimCustomSymbols.class_titan, 'Titan'],
  [DimCustomSymbols.class_warlock, 'Warlock'],

  // Enemies
  [DimCustomSymbols.cabal_unknown, 'Cabal'],
  [DimCustomSymbols.hive, 'Hive'],
  [DimCustomSymbols.fallen_dusk, 'Fallen'],
  [DimCustomSymbols.vex, 'Vex'],
  [DimCustomSymbols.forsaken, 'Scorn'],
  [DimCustomSymbols.taken, 'Taken'],

  // Factions & Activities
  [DimCustomSymbols.gunsmith, 'Gunsmith'],
  [DimCustomSymbols.faction_vanguard, 'Vanguard Tactical'],
  [DimCustomSymbols.strike, 'Strike'],
  [DimCustomSymbols.gambit_small, 'Gambit'],
  [DimCustomSymbols.faction_crucible, 'Crucible'],
  [DimCustomSymbols.faction_ironbanner, 'Iron Banner'],
  [DimCustomSymbols.trials_of_osiris, 'Trials of Osiris'],
  [DimCustomSymbols.raid, 'Raid'],
  [DimCustomSymbols.dungeon, 'Dungeon'],
  [FontGlyphs.lostsector, 'Lost Sector'],
  [FontGlyphs.quest, '[Quest]'],

  // Other
  [FontGlyphs.gilded_title],
  [FontGlyphs.light, '[Light Level]'],
  [DimCustomSymbols.modifications, 'Modifications'],
  [DimCustomSymbols.resonance, 'Deepsight Resonance'],
  [DimCustomSymbols.ornament, 'Ornaments'],
  [DimCustomSymbols.harmonic],
  [DimCustomSymbols.respawn_restricted],
  [DimCustomSymbols.orb, 'Orbs of Power'],
];

const output: {
  codepoint: number;
  glyph: string;
  source?: Source;
}[] = [];

const translateManually = [];
const failedToFindSource = [];

interface Source {
  tableName:
    | 'Trait'
    | 'InventoryItem'
    | 'SandboxPerk'
    | 'ActivityMode'
    | 'Objective'
    | 'ItemCategory'
    | 'InventoryBucket'
    | 'Faction'
    | 'Stat'
    | 'DamageType';
  fromRichText: boolean;
  hash: number;
}

const traits = getAllDefs('Trait');
const items = getAllDefs('InventoryItem');
const perks = getAllDefs('SandboxPerk');
const activities = getAllDefs('ActivityMode');
const objectives = getAllDefs('Objective');
const categories = getAllDefs('ItemCategory');
const buckets = getAllDefs('InventoryBucket');
const factions = getAllDefs('Faction');
const stats = getAllDefs('Stat');
const damages = getAllDefs('DamageType');

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
  const objective = objectives.find((t) => t.progressDescription === name);
  if (objective) {
    return { tableName: 'Objective', hash: objective.hash, fromRichText: false };
  }
  const category = categories.find((t) => t.displayProperties?.name === name);
  if (category) {
    return { tableName: 'ItemCategory', hash: category.hash, fromRichText: false };
  }
  const bucket = buckets.find((t) => t.displayProperties?.name === name);
  if (bucket) {
    return { tableName: 'InventoryBucket', hash: bucket.hash, fromRichText: false };
  }
  const faction = factions.find((t) => t.displayProperties?.name === name);
  if (faction) {
    return { tableName: 'Faction', hash: faction.hash, fromRichText: false };
  }
  const stat = stats.find((t) => t.displayProperties?.name === name);
  if (stat) {
    return { tableName: 'Stat', hash: stat.hash, fromRichText: false };
  }
  const damage = damages.find((t) => t.displayProperties?.name === name);
  if (damage) {
    return { tableName: 'DamageType', hash: damage.hash, fromRichText: false };
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
  "export const symbolData: {codepoint: number; glyph: string, source?: {tableName: 'Trait' | 'InventoryItem' | 'SandboxPerk' | 'ActivityMode' | 'Objective'| 'ItemCategory' | 'InventoryBucket' | 'Faction' | 'Stat' | 'DamageType', hash: number, fromRichText: boolean }}[] =" +
  JSON.stringify(output, null, 2) +
  ';\nconst translateManually = ' +
  JSON.stringify(translateManually, null, 2) +
  'as const;\n' +
  'export type TranslateManually = typeof translateManually[number];\n\n' +
  '/*\n * Could not find a source for (did the definitions disappear?): \n' +
  failedToFindSource.map((name) => ` * ${name}`).join('\n') +
  '\n\n' +
  ' * Unused rich text replacements (these should only be input actions replaced with the mapped buttons by the game): \n' +
  Object.entries(fromRichTexts)
    .filter(([_name, [_t, _h, used]]) => !used)
    .map(([name]) => ` * ${name}`)
    .join('\n') +
  '\n */';

writeFile('./output/symbol-name-sources.ts', outString);
