import { loadDotEnv, readConfig } from './config.js';
import { start } from './app.js';

loadDotEnv();
start(readConfig());
