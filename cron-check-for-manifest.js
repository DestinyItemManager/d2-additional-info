#!/usr/bin/env node
const fs = require('fs');
const request = require('request');
const fsPromises = require('fs').promises;
const optionalRequire = require('optional-require')(require);
let latest = optionalRequire('./latest.json') || '';

request(
  {
    headers: {
      'X-API-Key': process.env.API_KEY
    },
    uri: 'http://www.bungie.net/platform/Destiny2/Manifest/',
    method: 'GET'
  },
  checkManifestVersion
);

function checkManifestVersion(error, response, body) {
  var parsedResponse, versionNumber;

  //// mechanics working check ////
  try {
    parsedResponse = JSON.parse(body);
  } catch (e) {}
  if (
    !(
      parsedResponse && //ensure it parsed
      (versionNumber = parsedResponse.Response.version) && // extract version number
      /^[.\w-]+$/.test(versionNumber)
    ) // verify it's safe to put into a git branch name
  ) {
    // what can i do here for cron logging?
    console.log('something went wrong');
    console.log(parsedResponse);
    console.log(versionNumber);
    process.exit(1);
  }

  //// no new manifest check ////
  if (latest === versionNumber) {
    // what can i do here for cron logging?
    console.log('no new manifest');
    process.exit(0);
  }

  //// we made it. there's a new manifest ////
  // what can i do here for cron logging?
  console.log('new manifest!!!! aaaaaAAAAAAAAAAAaaaaaaaaaaaaa!!');
  fs.writeFile('./latest.json', JSON.stringify(versionNumber), () => startBuild(versionNumber));
}

function startBuild(versionNumber) {
  const buildOptions = {
    url: 'https://api.travis-ci.com/repo/sundevour%2Fd2-additional-info/requests',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Travis-API-Version': '3',
      Authorization: 'token ' + process.env.TRAVIS_KEY
    },
    body: {
      request: {
        message: `new manifest build - ${versionNumber}`,
        branch: 'd2ai-plus-ci',
        config: {
          env: {
            MANIFEST_VERSION: versionNumber
          }
        }
      }
    },
    json: true,
    method: 'POST'
  };

  console.log(JSON.stringify(buildOptions, null, 2));

  request(buildOptions, buildSubmitResults);

  function buildSubmitResults(error, response, body) {
    // if logging maybe a date here??
    if (error) console.log(error);
    else if (response.statusCode < 200 || response.statusCode >= 300) {
      console.log(`${response.statusCode}
      ${JSON.stringify(body)}`);
    } else {
      console.log(body);
    }
  }
  console.log('reached startBuild');
}
