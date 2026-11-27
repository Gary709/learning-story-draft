import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from './config.js';
import type { SampleNote } from './types.js';

export type SyntheticNote = {
  id: string;
  title: string;
  notes: string;
  intended: string;
  showInApp: boolean;
  synthetic: true;
};

let cached: SyntheticNote[] | null = null;

export function loadSyntheticNotes(): SyntheticNote[] {
  if (cached) return cached;
  const file = path.join(repoRoot(), 'eval', 'synthetic-notes.json');
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) throw new Error('Synthetic notes file is not a list');
  cached = parsed.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Synthetic note is not an object');
    const note = item as Partial<SyntheticNote>;
    if (note.synthetic !== true) throw new Error(`Note ${note.id ?? '?'} is not marked synthetic`);
    if (!note.id || !note.title || !note.notes || !note.intended) {
      throw new Error('Synthetic note is missing a field');
    }
    return {
      id: note.id,
      title: note.title,
      notes: note.notes,
      intended: note.intended,
      showInApp: Boolean(note.showInApp),
      synthetic: true,
    };
  });
  return cached;
}

export function appSamples(): SampleNote[] {
  return loadSyntheticNotes()
    .filter((note) => note.showInApp)
    .map((note) => ({
      id: note.id,
      title: note.title,
      notes: note.notes,
      synthetic: true,
    }));
}
