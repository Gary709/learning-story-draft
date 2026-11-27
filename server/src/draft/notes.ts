const NAME_STOP = new Set([
  'The',
  'At',
  'After',
  'Before',
  'When',
  'She',
  'He',
  'They',
  'Two',
  'Three',
  'Later',
  'Then',
  'During',
  'Today',
  'Yesterday',
  'Without',
  'This',
  'That',
  'There',
  'And',
  'Child',
  'Her',
  'His',
  'Our',
]);

export function observationLines(notes: string): string[] {
  return notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function tidyNotes(notes: string): string {
  return observationLines(notes)
    .map((line) => {
      const cased = line.charAt(0).toUpperCase() + line.slice(1);
      return /[.!?]$/.test(cased) ? cased : `${cased}.`;
    })
    .join(' ');
}

export function leadName(notes: string): string | null {
  const child = notes.match(/\bChild [A-Z]\b/);
  if (child) return child[0];
  const names = notes.match(/\b[A-Z][a-z]+\b/g) ?? [];
  return names.find((name) => !NAME_STOP.has(name)) ?? null;
}

export function readDraftRequest(
  body: unknown,
): { notes: string; mandarin: boolean } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Send the notes as text.' };
  const notes = (body as { notes?: unknown }).notes;
  const mandarin = (body as { mandarin?: unknown }).mandarin;
  if (typeof notes !== 'string') return { error: 'Send the notes as text.' };
  if (mandarin !== undefined && typeof mandarin !== 'boolean') {
    return { error: 'Mandarin should be yes or no.' };
  }
  const lines = observationLines(notes);
  if (lines.length < 2 || lines.length > 6) {
    return { error: 'Use 2 to 6 lines. Put each thing you saw on its own line.' };
  }
  if (lines.some((line) => line.length > 400) || notes.length > 2500) {
    return { error: 'That is too long for this draft. Keep it to a few short lines.' };
  }
  return { notes, mandarin: Boolean(mandarin) };
}
