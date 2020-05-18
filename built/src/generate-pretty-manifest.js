'use strict';
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
exports.__esModule = true;
var node_1 = require('destiny2-manifest/node');
var helpers_1 = require('./helpers');
node_1.loadLocal();
Object.entries(node_1.allManifest).forEach(function (_a) {
  var _b = __read(_a, 2),
    table = _b[0],
    tableData = _b[1];
  var shortName = table.match(/^Destiny(\w+)Definition$/)[1];
  helpers_1.writeFile('./manifest_tables/' + shortName + '.json', tableData);
});
helpers_1.writeFile('./manifest_tables/all.json', node_1.allManifest);
