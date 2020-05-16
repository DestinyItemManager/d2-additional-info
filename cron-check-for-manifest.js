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
  let buildOptions;
  if (process.env.TRAVIS) {
    buildOptions = {
      url: 'https://api.travis-ci.org/repo/DestinyItemManager%2Fd2-additional-info/requests',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Travis-API-Version': '3',
        Authorization: 'token ' + process.env.TRAVIS_KEY
      },
      body: {
        request: {
          message: `new manifest build - ${versionNumber}`,
          branch: 'master',
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
  } else if (process.env.GITHUB_ACTIONS) {
    // https://github.community/t5/GitHub-Actions/Trigger-an-action-upon-completion-of-another-action/td-p/46885
    const pat = btoa(process.env.PAT);
    buildOptions = {
      url: 'https://api.github.com/repos/DestinyItemManager/d2-additional-info/dispatches',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Basic {0}' + pat
      },
      body: {
        event_type: 'repository-dispatch',
        request: {
          message: `new manifest build - ${versionNumber}`,
          branch: 'master',
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
  } else {
    process.exit(1);
  }

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
