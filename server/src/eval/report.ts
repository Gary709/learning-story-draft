import { rankLinks, selectLinks } from '../eylf/mapper.js';
import { loadSyntheticNotes, type SyntheticNote } from '../samples.js';

export type Confusion = {
  intended: string;
  predicted: string;
  count: number;
  label: string;
};

export type NoteResult = {
  id: string;
  intended: string;
  predicted: string | null;
  confidence: 'clearer' | 'low' | 'none';
  top3: string[];
  shown: string[];
};

export type EvalReport = {
  total: number;
  exact: number;
  outcome: number;
  top3: number;
  exactLowConfidence: number;
  none: number;
  confusions: Confusion[];
  notes: NoteResult[];
};

export function buildReport(notes: SyntheticNote[] = loadSyntheticNotes()): EvalReport {
  const results: NoteResult[] = notes.map((note) => {
    const ranked = rankLinks(note.notes);
    const primary = ranked[0] && ranked[0].score >= 3 ? ranked[0] : null;
    return {
      id: note.id,
      intended: note.intended,
      predicted: primary?.code ?? null,
      confidence: primary ? primary.confidence : 'none',
      top3: ranked.slice(0, 3).map((link) => link.code),
      shown: selectLinks(ranked).map((link) => link.code),
    };
  });

  const exactRows = results.filter((row) => row.predicted === row.intended);
  const confusions = new Map<string, Confusion>();
  for (const row of results) {
    if (row.predicted === row.intended) continue;
    const predicted = row.predicted ?? 'none';
    const label = `${row.intended} -> ${predicted}`;
    const existing = confusions.get(label);
    if (existing) existing.count += 1;
    else confusions.set(label, { intended: row.intended, predicted, count: 1, label });
  }

  return {
    total: results.length,
    exact: exactRows.length,
    outcome: results.filter(
      (row) => row.predicted !== null && row.predicted.split('.')[0] === row.intended.split('.')[0],
    ).length,
    top3: results.filter((row) => row.top3.includes(row.intended)).length,
    exactLowConfidence: exactRows.filter((row) => row.confidence === 'low').length,
    none: results.filter((row) => row.predicted === null).length,
    confusions: [...confusions.values()].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label),
    ),
    notes: results,
  };
}

export function formatReport(report: EvalReport): string {
  const pct = (count: number) =>
    `${count}/${report.total} (${Math.round((count / report.total) * 100)}%)`;
  const lines = [
    `Synthetic notes: ${report.total}`,
    'Labels: written by the author with the notes. Not a validated assessment.',
    'The samples in the app are part of this set. There is no held-out set.',
    '',
    `Exact sub-outcome: ${pct(report.exact)}`,
    `Outcome (1-5): ${pct(report.outcome)}`,
    `Intended code in the top 3 scores: ${pct(report.top3)}`,
    `Exact matches that were still low confidence: ${report.exactLowConfidence}/${report.exact}`,
    `No link scored high enough: ${report.none}/${report.total}`,
    '',
    'Confusions (intended -> predicted):',
  ];
  if (report.confusions.length === 0) {
    lines.push('  none');
  } else {
    for (const row of report.confusions) {
      lines.push(`  ${row.label} (${row.count})`);
    }
  }
  lines.push('', 'Notes:');
  for (const row of report.notes) {
    lines.push(
      `  ${row.id}  ${row.intended} -> ${row.predicted ?? 'none'}  ${row.confidence}  top3 ${row.top3.join(', ') || '-'}  shown ${row.shown.join(', ') || '-'}`,
    );
  }
  return lines.join('\n');
}
