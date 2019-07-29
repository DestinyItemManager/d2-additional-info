[![Build Status](https://travis-ci.org/DestinyItemManager/d2-additional-info.svg?branch=master)](https://travis-ci.org/DestinyItemManager/d2-additional-info)

## Seasons

| Season | Start Date | End Date    | DLC Name        | Season of   |
| :----: | ---------- | ----------- | --------------- | ----------- |
|   1    | 06SEP2017  | 04DEC2017   | Red War         |             |
|   2    | 05DEC2017  | 07MAY2018   | Curse of Osiris |             |
|   3    | 08MAY2018  | 03SEP2018   | Warmind         |             |
|   4    | 04SEP2018  | 27NOV2018   | Forsaken        | the Outlaw  |
|   5    | 28NOV2018  | 04MAR2019   | Black Armory    | the Forge   |
|   6    | 05MAR2019  | 03JUN2019   | Joker's Wild    | the Drifter |
|   7    | 04JUN2019  | 16SEP2019   | Penumbra        | Opulence    |
|   8    | 17SEP2019  | 16DEC2019\* | Shadowkeep      | the Undying |

- \*denotes best guess dates

## Events

| Event | Event Name           | Event Dates                                   |
| :---: | -------------------- | --------------------------------------------- |
|   1   | Dawning              | 19DEC2017 - 09JAN2018, 11DEC2018 - 01JAN2019  | 
|   2   | Crimson Days         | 13FEB2018 - 20FEB2018, 12FEB2019 - 19FEB2019  |
|   3   | Solstice of Heroes   | 31JUL2018 - 29AUG2018, 30JUL2019 - 27AUG2019  |
|   4   | Festival of the Lost | 16OCT2018 - 06NOV2018 |
|   5   | The Revelry          | 16APR2019 - 06MAY2019 |

## Assumptions and Logic

Any item in database at end of season and not in a previous season belongs to that season.

Any item in contained in the event bright engram belongs to that event unless it is also contained in a standard bright engram.

## How to use:

- yarn install
- node getD2Manifest.js
- node generate-season-event-info.js
- node generate-source-info.js
