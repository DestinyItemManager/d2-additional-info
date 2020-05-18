#!/usr/bin/env node

import fetch from 'node-fetch';
import { promises as fsPromises } from 'fs';
import { generateHttpClient } from 'destiny2-utils';
import { getDestinyManifest } from 'bungie-api-ts/destiny2';

const httpClient = generateHttpClient(fetch as any, process.env.API_KEY);

const optionalRequire = require('optional-require')(require);
let latest = optionalRequire('./latest.json') || '';

// do the thing
(async () => {
  const manifestMetadata = await getDestinyManifest(httpClient);

  if (!latest) {
    // we had no "last time" value so nothing to compare to. save current version as a new "last time"
    await fsPromises.writeFile('./latest.json', JSON.stringify(manifestMetadata.Response.version));
    return; // done for now i guess
  }
  if (latest === manifestMetadata.Response.version) {
    // nothing changed. no updates needed.
    return;
  }
  // if you are here, there's a new manifest
  console.log('new manifest!!!! aaaaaAAAAAAAAAAAaaaaaaaaaaaaa!!');

  let buildMessage = `new manifest build - ${manifestMetadata.Response.version}`;

  // if (!/^[.\w-]+$/.test(versionNumber)) { I AM NOT REALLY SURE THIS NEEDS DOING. }

  const buildOptions = {
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
  const travisFetch = await fetch(
    'https://api.travis-ci.org/repo/DestinyItemManager%2Fd2-additional-info/requests',
    buildOptions
  );

  if (!travisFetch.ok) {
    console.log('travis returned an error');
    console.log(travisFetch);
    process.exit(1);
  }
})().catch((e) => {
  console.log(e);
  process.exit(1);
});
