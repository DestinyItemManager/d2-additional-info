## Seasons

| Season | Start Date | End Date  | DLC Name        | Season of The |
| :----: | ---------- | --------- | --------------- | ------------- |
|   1    | 06SEP2017  | 04DEC2017 | Red War         |               |
|   2    | 05DEC2017  | 07MAY2018 | Curse of Osiris |               |
|   3    | 08MAY2017  | 03SEP2018 | Warmind         |               |
|   4    | 04SEP2018  | 27NOV2018 | Forsaken        | Outlaw        |
|   5    | 28NOV2018  | 04MAR2019 | Black Armory    | Forge         |
|   6    | 05MAR2019  | SUMMER    | Joker's Wild    | Drifter       |
|   7    | SUMMER     | ????      | Penumbra        | ????          |

## Events

| Event | Start Date | End Date  | Event Name                  |
| :---: | ---------- | --------- | --------------------------- |
|   1   | 19DEC2017  | 09JAN2017 | Dawning (2017)              |
|   2   | 13FEB2018  | 20FEB2018 | Crimson Days (2018)         |
|   3   | 31JUL2017  | 29AUG2018 | Solstice of Heroes (2018)   |
|   4   | 16OCT2018  | 06NOV2018 | Festival of the Lost (2018) |
|   1   | 11DEC2018  | 01JAN2019 | Dawning (2018)              |
|   2   | 12FEB2019  | 19FEB2019 | Crimson Days (2019)         |

## Assumptions and Logic

Any item in database at end of season and not in a previous season belongs to that season.

Any item in database during event not part of current season and not classified belongs to that event.
Any item in contained in the event bright engram belongs to that event unless it is also contained in a standard bright engram.

## How to use:

- yarn install
- node getD2Manifest.js
- node generate-additional-info.js
