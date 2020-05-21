#!/usr/bin/env node

import manifest from 'destiny2-manifest/node';

manifest.setApiKey(process.env.API_KEY);
manifest.load();
