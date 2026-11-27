import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoRoot } from '../src/config.js';
import { subOutcome } from '../src/eylf/outcomes.js';
import { buildReport } from '../src/eval/report.js';
import { observationLines } from '../src/draft/notes.js';
import { loadSyntheticNotes } from '../src/samples.js';

describe('synthetic set', () => {
  it('is labelled synthetic and uses real sub-outcome codes', () => {
    const notes = loadSyntheticNotes();
    expect(notes.length).toBe(22);
    for (const note of notes) {
      expect(note.synthetic).toBe(true);
      expect(subOutcome(note.intended)).toBeDefined();
      const lines = observationLines(note.notes);
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines.length).toBeLessThanOrEqual(6);
      expect(note.notes).not.toMatch(/\b(surname|date of birth|address)\b/i);
    }
    const shown = notes.filter((note) => note.showInApp);
    expect(shown.length).toBeGreaterThanOrEqual(4);
  });

  it('matches the figures written in the README', () => {
    const report = buildReport();
    const readme = fs.readFileSync(path.join(repoRoot(), 'README.md'), 'utf8');
    expect(readme).toContain(`Exact sub-outcome: ${report.exact}/${report.total}`);
    expect(readme).toContain(`Outcome (1-5): ${report.outcome}/${report.total}`);
    expect(readme).toContain(`In the top 3 scores: ${report.top3}/${report.total}`);
    expect(readme).toContain(`${report.exactLowConfidence} of ${report.exact}`);
    if (report.confusions.length === 0) {
      expect(readme.toLowerCase()).toContain('no confusion');
    }
    for (const row of report.confusions) {
      expect(readme).toContain(`${row.label} (${row.count})`);
    }
  });
});
