import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { repoRoot, type AppConfig } from './config.js';
import { FRAMEWORK_CITATION, FRAMEWORK_URL, NUMBERING_NOTE, SUBOUTCOMES } from './eylf/outcomes.js';
import { readDraftRequest } from './draft/notes.js';
import { draftStory } from './draft/story.js';
import { appSamples } from './samples.js';
import type { Completer } from './types.js';

export type AppOptions = {
  config: AppConfig;
  complete?: Completer;
};

const jsonError: ErrorRequestHandler = (err, _req, res, next) => {
  if (!err) {
    next();
    return;
  }
  const type = (err as { type?: string }).type;
  if (type === 'entity.parse.failed' || type === 'entity.too.large') {
    res.status(400).json({ error: 'Send a short note as text.' });
    return;
  }
  res.status(500).json({ error: 'The draft failed. Nothing was saved.' });
};

export function createApp({ config, complete }: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '8kb' }));
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ mode: config.mode, storesNotes: false, postsToStorypark: false });
  });

  app.get('/api/samples', (_req, res) => {
    res.json({
      synthetic: true,
      samples: appSamples(),
    });
  });

  app.get('/api/framework', (_req, res) => {
    res.json({
      citation: FRAMEWORK_CITATION,
      url: FRAMEWORK_URL,
      numberingNote: NUMBERING_NOTE,
      outcomes: SUBOUTCOMES.map((item) => ({
        code: item.code,
        outcomeCode: item.outcomeCode,
        outcome: item.outcome,
        statement: item.statement,
      })),
    });
  });

  app.post('/api/draft', async (req, res) => {
    const parsed = readDraftRequest(req.body);
    if ('error' in parsed) {
      res.status(400).json(parsed);
      return;
    }
    const story = await draftStory({
      notes: parsed.notes,
      mandarin: parsed.mandarin,
      config,
      complete,
    });
    res.json(story);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  const clientDist = path.join(repoRoot(), 'client', 'dist');
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(jsonError);
  return app;
}

export function start(config: AppConfig): void {
  const app = createApp({ config });
  app.listen(config.port, () => {
    console.log(`Learning story draft listening on ${config.port} (${config.mode})`);
  });
}
