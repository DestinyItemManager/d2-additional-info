[![Build Status](https://travis-ci.org/DestinyItemManager/d2-additional-info.svg?branch=master)](https://travis-ci.org/DestinyItemManager/d2-additional-info)

## Seasons

| Season | Start Date | End Date  | DLC Name        | Season of   |
| :----: | ---------- | --------- | --------------- | ----------- |
|   1    | 06SEP2017  | 04DEC2017 | Red War         |             |
|   2    | 05DEC2017  | 07MAY2018 | Curse of Osiris |             |
|   3    | 08MAY2018  | 03SEP2018 | Warmind         |             |
|   4    | 04SEP2018  | 27NOV2018 | Forsaken        | the Outlaw  |
|   5    | 28NOV2018  | 04MAR2019 | Black Armory    | the Forge   |
|   6    | 05MAR2019  | 03JUN2019 | Joker's Wild    | the Drifter |
|   7    | 04JUN2019  | 30SEP2019 | Penumbra        | Opulence    |
|   8    | 01OCT2019  | 09DEC2019 | Shadowkeep      | the Undying |
|   9    | 10DEC2019  | 09MAR2020 |                 | Dawn        |
|   10   | 10MAR2020  | 09JUN2020 |                 | the Worthy  |

- \*denotes best guess dates

## Events

| Event | Event Name           | 2017          | 2018          | 2019          | 2020          |
| :---: | -------------------- | ------------- | ------------- | ------------- | ------------- |
|   1   | Dawning              | 19DEC - 09JAN | 11DEC - 01JAN | 17DEC - 14JAN |               |
|   2   | Crimson Days         |               | 13FEB - 20FEB | 12FEB - 19FEB | 11FEB - 18FEB |
|   3   | Solstice of Heroes   |               | 31JUL - 29AUG | 30JUL - 27AUG |               |
|   4   | Festival of the Lost |               | 16OCT - 06NOV | 29OCT - 19NOV |               |
|   5   | The Revelry          |               |               | 16APR - 06MAY |               |
|   6   | Guardian Games       |               |               |               | 21APR - 11MAY |

## Assumptions and Logic

Any item in database at end of season and not in a previous season belongs to that season.

## How to use:

- yarn install
- yarn manifest:get
- yarn generate-data
