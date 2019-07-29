#!/usr/bin/env node
const { writeFilePretty } = require('./helpers.js');
const argv = require('minimist')(process.argv.slice(2));
const optionalRequire = require('optional-require')(require);
const fs = require('fs');
const request = require('request');
const mkdirp = require('mkdirp');
let latest = optionalRequire('./latest.json') || '';
let filename;

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

function onManifestRequest(error, response, body) {
  var parsedResponse;

  if (error) {
    console.log(error);
    process.exit(1);
  } else if (response.statusCode < 200 || response.statusCode >= 300) {
    console.log(`${response.statusCode}
    ${JSON.stringify(body)}`);
    process.exit(1);
  }

  try {
    parsedResponse = JSON.parse(body);
  } catch (e) {}
  if (!parsedResponse) {
    console.log(`response recieved but couldn't parse`);
    process.exit(1);
  }

  const languages = Object.keys(
    parsedResponse.Response && parsedResponse.Response.jsonWorldContentPaths
  );
  const lc = languages.includes(argv.lc) ? argv.lc : 'en'; // specify language to download by --lc {lc} on command line "en" is default
  var currVersion = parsedResponse.Response && parsedResponse.Response.jsonWorldContentPaths[lc];
  filename = currVersion.split('/');
  filename = filename[filename.length - 1];
  if (parsedResponse.Response && latest !== currVersion) {
    var manifest = fs.createWriteStream(filename);
    request
      .get(`https://www.bungie.net${parsedResponse.Response.jsonWorldContentPaths[lc]}`)
      .pipe(manifest)
      .on('close', storeManifest);
    writeFilePretty('./latest.json', currVersion);
    console.log('New manifest saved!');
  } else {
    console.log('Manifest is already current or currently rate-limited!');
    process.exit(1);
  }
}

function storeManifest() {
  var todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const today = todayDate.toISOString().slice(0, 10);

  mkdirp.sync(`./manifests/${today}`, function(err) {
    if (err) console.error(err);
  });

  fs.rename(`./${filename}`, `./manifests/${today}/${filename}`, (err) => {
    if (err) throw err;
  });
}
