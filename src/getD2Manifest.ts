#!/usr/bin/env node

import manifest from '@d2api/manifest-node';

manifest.setApiKey(process.env.API_KEY);
manifest.load();
