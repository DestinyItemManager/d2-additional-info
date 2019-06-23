#!/usr/bin/env node
const { writeFile, storeManifest } = require('./helpers.js');
const optionalRequire = require('optional-require')(require);
const fs = require('fs');
const request = require('request');
let latest = optionalRequire('./latest.json') || '';
let filename;

function onManifestRequest(error, response, body) {
  var parsedResponse = JSON.parse(body);
  var currVersion = parsedResponse.Response && parsedResponse.Response.jsonWorldContentPaths.en;
  filename = currVersion.split('/');
  filename = filename[filename.length - 1];
  if (parsedResponse.Response && latest !== currVersion) {
    var manifest = fs.createWriteStream(filename);
    request
      .get(`https://www.bungie.net${parsedResponse.Response.jsonWorldContentPaths.en}`)
      .pipe(manifest)
      .on('close', storeManifest);
    writeFile(currVersion, './latest.json');
    console.log('New manifest saved!');
  } else {
    console.log('Manifest is already current or currently rate-limited!');
    process.exit(1);
  }
}

request(
  {
    headers: {
      'X-API-Key': process.env.API_KEY
    },
    uri: 'http://www.bungie.net/platform/Destiny2/Manifest/',
    method: 'GET'
  },
  onManifestRequest
);
