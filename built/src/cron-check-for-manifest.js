#!/usr/bin/env node
'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var node_fetch_1 = __importDefault(require('node-fetch'));
var fs_1 = require('fs');
var destiny2_utils_1 = require('destiny2-utils');
var destiny2_1 = require('bungie-api-ts/destiny2');
var httpClient = destiny2_utils_1.generateHttpClient(node_fetch_1['default'], process.env.API_KEY);
var optionalRequire = require('optional-require')(require);
var latest = optionalRequire('./latest.json') || '';
// do the thing
(function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var manifestMetadata, buildMessage, buildOptions, travisFetch;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, destiny2_1.getDestinyManifest(httpClient)];
        case 1:
          manifestMetadata = _a.sent();
          if (!!latest) return [3 /*break*/, 3];
          // we had no "last time" value so nothing to compare to. save current version as a new "last time"
          return [
            4 /*yield*/,
            fs_1.promises.writeFile(
              './latest.json',
              JSON.stringify(manifestMetadata.Response.version)
            ),
          ];
        case 2:
          // we had no "last time" value so nothing to compare to. save current version as a new "last time"
          _a.sent();
          return [2 /*return*/]; // done for now i guess
        case 3:
          if (latest === manifestMetadata.Response.version) {
            // nothing changed. no updates needed.
            return [2 /*return*/];
          }
          // if you are here, there's a new manifest
          console.log('new manifest!!!! aaaaaAAAAAAAAAAAaaaaaaaaaaaaa!!');
          buildMessage = 'new manifest build - ' + manifestMetadata.Response.version;
          buildOptions = {
            url: 'https://api.travis-ci.org/repo/DestinyItemManager%2Fd2-additional-info/requests',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Travis-API-Version': '3',
              Authorization: 'token ' + process.env.TRAVIS_KEY,
            },
            body: JSON.stringify({
              request: {
                message: buildMessage,
                branch: 'master',
                config: {
                  env: {
                    MANIFEST_VERSION: manifestMetadata.Response.version,
                  },
                },
              },
            }),
            json: true,
            method: 'POST',
          };
          return [
            4 /*yield*/,
            node_fetch_1['default'](
              'https://api.travis-ci.org/repo/DestinyItemManager%2Fd2-additional-info/requests',
              buildOptions
            ),
          ];
        case 4:
          travisFetch = _a.sent();
          if (!travisFetch.ok) {
            console.log('travis returned an error');
            console.log(travisFetch);
            process.exit(1);
          }
          return [2 /*return*/];
      }
    });
  });
})()['catch'](function (e) {
  console.log(e);
  process.exit(1);
});
