'use strict';
var _a;
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
var inventoryItems = node_1.getAll('DestinyInventoryItemDefinition');
// this is keyed with record hashes, and the values are catalyst inventoryItem icons
// (more interesting than the all-identical icons on catalyst triumphs)
var triumphIcons = {};
// loop the catalyst section of triumphs
(_a = node_1.get('DestinyPresentationNodeDefinition', 1111248994)) === null || _a === void 0
  ? void 0
  : _a.children.presentationNodes.forEach(function (p) {
      var _a;
      return (_a = node_1.get('DestinyPresentationNodeDefinition', p.presentationNodeHash)) ===
        null || _a === void 0
        ? void 0
        : _a.children.records.forEach(function (r) {
            var _a, _b;
            var recordName =
              (_a = node_1.get('DestinyRecordDefinition', r.recordHash)) === null || _a === void 0
                ? void 0
                : _a.displayProperties.name;
            // look for an inventoryItem with the same name, and tierType 6 (should find the catalyst for that gun)
            var itemWithSameName = inventoryItems.find(function (i) {
              return i.displayProperties.name === recordName && i.inventory.tierType === 6;
            });
            // and get its icon image
            var icon =
              (_b =
                itemWithSameName === null || itemWithSameName === void 0
                  ? void 0
                  : itemWithSameName.displayProperties) === null || _b === void 0
                ? void 0
                : _b.icon;
            // this "if" check is because of classified data situations
            if (icon) triumphIcons[r.recordHash] = icon;
            else console.log('no catalyst image found for ' + r.recordHash + ' ' + recordName);
          });
    });
helpers_1.writeFile('./output/catalyst-triumph-icons.json', triumphIcons);
