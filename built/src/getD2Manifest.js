#!/usr/bin/env node
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var node_1 = __importDefault(require('destiny2-manifest/node'));
node_1['default'].setApiKey(process.env.API_KEY);
node_1['default'].load();
