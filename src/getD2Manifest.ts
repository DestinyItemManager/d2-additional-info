#!/usr/bin/env node

import { load, setApiKey } from '@d2api/manifest-node';

setApiKey(process.env.API_KEY);
load();
