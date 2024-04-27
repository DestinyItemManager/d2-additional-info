# DEPRECATION WARNING

- All [DEPRECATED] files will be removed at the beginning of Episode 2 of The Final Shape.

## v2.0.0

- [DEPRECATED] d2-event-info.ts in favor of d2-event-info-v2.ts
  - [REMOVED] type D2EventIndex
  - [REMOVED] const D2EventPredicateLookup
  - [REMOVED] const D2SourcesToEvent
  - [ADDED] D2EventEnum as index for D2EventInfo
- [DEPRECATED] source-info.ts in favor of source-info-v2.ts
  - [REMOVED] duplicated data for aliases in favor of a property listing the aliases
  - [ADDED] all properties are now optional and only included when they have information
  - [REMOVED] searchString property (unused)
- [DEPRECATED] seasons_backup.json in favor of more strict season detection
- [CHANGED] seasons.json only contains itemHashes to do not have overlays that correspond to known seasons
- [DEPRECATED] season-to-source.json in favor source-to-season-v2.json
  - [REMOVED] top-level `sources` property and is now only a record of source -> season
  - [REMOVED] only seasonal sources that cannot be deduced another way are kept track of
