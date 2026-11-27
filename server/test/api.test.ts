import fs from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';

async function withServer(fn: (base: string) => Promise<void>): Promise<void> {
  const app = createApp({ config: readConfig({ OPENAI_API_KEY: '' }) });
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

describe('draft API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects a single line and accepts a short note without storing it', async () => {
    await withServer(async (base) => {
      const tooShort = await fetch(`${base}/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Only one line about the blocks.', mandarin: false }),
      });
      expect(tooShort.status).toBe(400);

      const notes = 'Child A counted the stones.\nShe said the pattern was big, small, big, small.';
      const ok = await fetch(`${base}/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, mandarin: false }),
      });
      expect(ok.status).toBe(200);
      const body = (await ok.json()) as {
        stored: boolean;
        links: { code: string }[];
        draft: boolean;
      };
      expect(body.draft).toBe(true);
      expect(body.stored).toBe(false);
      expect(body.links[0]?.code).toBe('5.4');

      const missing = await fetch(`${base}/api/drafts`);
      expect(missing.status).toBe(404);
    });
  });

  it('does not write the notes to disk or the log', async () => {
    const secret = 'Zara-secret-note counted the bottle tops.\nShe made a pattern.';
    const write = vi.spyOn(fs, 'writeFileSync');
    const append = vi.spyOn(fs, 'appendFileSync');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await withServer(async (base) => {
      const response = await fetch(`${base}/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: secret, mandarin: true }),
      });
      expect(response.status).toBe(200);
    });
    const dumped = JSON.stringify([
      write.mock.calls,
      append.mock.calls,
      log.mock.calls,
      info.mock.calls,
      error.mock.calls,
    ]);
    expect(dumped).not.toContain('Zara-secret-note');
  });

  it('serves synthetic samples without the intended labels', async () => {
    await withServer(async (base) => {
      const response = await fetch(`${base}/api/samples`);
      const body = (await response.json()) as {
        synthetic: boolean;
        samples: { synthetic: boolean; notes: string; intended?: string }[];
      };
      expect(body.synthetic).toBe(true);
      expect(body.samples.length).toBeGreaterThan(0);
      for (const sample of body.samples) {
        expect(sample.synthetic).toBe(true);
        expect(sample.intended).toBeUndefined();
        expect(sample.notes.split('\n').length).toBeGreaterThanOrEqual(2);
      }
      const health = await fetch(`${base}/api/health`);
      expect(await health.json()).toEqual({
        mode: 'rules',
        storesNotes: false,
        postsToStorypark: false,
      });
    });
  });
});
