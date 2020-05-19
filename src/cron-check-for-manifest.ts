#!/usr/bin/env node

import fetch from 'node-fetch';
import { generateHttpClient } from 'destiny2-utils';
import { getDestinyManifest } from 'bungie-api-ts/destiny2';
import GistClient from 'gist-client';
import btoa from 'btoa';

const httpClient = generateHttpClient(fetch as any, process.env.API_KEY);
const filename = 'latest.json';

const gistID = process.env.GIST_ID || urlToSlug(process.env.GIST_URL || '');
const gistClient = new GistClient();
gistClient.setToken(process.env.GIST_TOKEN);

// do the thing
(async () => {
  const manifestMetadata = await getDestinyManifest(httpClient);

  const latest = await gistClient.getOneById(gistID).then((response: any) => {
    return JSON.parse(response.files[filename].content);
  });

  if (!latest) {
    // we had no "last time" value so nothing to compare to. save current version as a new "last time"
    await gistClient.update(gistID, {
      files: {
        filename: {
          content: manifestMetadata.Response.version,
          filename: filename
        }
      }
    });
    return; // done for now i guess
  }
  if (latest === manifestMetadata.Response.version) {
    // nothing changed. no updates needed.
    return;
  }
  // if you are here, there's a new manifest
  console.log('new manifest!!!! aaaaaAAAAAAAAAAAaaaaaaaaaaaaa!!');

  const buildMessage = `new manifest build - ${manifestMetadata.Response.version}`;

  // if (!/^[.\w-]+$/.test(versionNumber)) { I AM NOT REALLY SURE THIS NEEDS DOING. }

  const buildOptions = {
    url: 'https://api.github.com/repos/DestinyItemManager/d2-additional-info/dispatches',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Basic ' + btoa(process.env.PAT || ''),
      'User-Agent': 'd2-additional-info'
    },
    body: JSON.stringify({
      event_type: 'new-manifest-detected',
      client_payload: {
        message: buildMessage,
        branch: 'master',
        config: {
          env: {
            MANIFEST_VERSION: manifestMetadata.Response.version
          }
        }
      }
    }),
    json: true,
    method: 'POST'
  };
  const githubFetch = await fetch(buildOptions.url, buildOptions);

  if (!githubFetch.ok) {
    console.log('Github returned an error');
    console.log(githubFetch);
    process.exit(1);
  }
})().catch((e) => {
  console.log(e);
  process.exit(1);
});

function urlToSlug(url: string) {
  // converts https://gist.github.com/{{username}}/{{gistID}} into {{gistID}}
  return url.substring(url.lastIndexOf('/') + 1);
}
