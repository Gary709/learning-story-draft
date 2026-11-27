import { PHRASES } from './phrases.js';
import { SUBOUTCOMES, type SubOutcome } from './outcomes.js';

export type Confidence = 'clearer' | 'low';

export type RankedLink = SubOutcome & {
  score: number;
  matched: string[];
  confidence: Confidence;
};

const MIN_SCORE = 3;
const CLEAR_SCORE = 6;

export function normaliseNotes(notes: string): string {
  return notes.toLowerCase().replace(/[’‘]/g, "'");
}

export function hasPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u');
  return re.test(text);
}

export function rankLinks(notes: string): RankedLink[] {
  const text = normaliseNotes(notes);
  const scored = SUBOUTCOMES.map((item) => {
    const hits = (PHRASES[item.code] ?? []).filter((entry) => hasPhrase(text, entry.phrase));
    const score = hits.reduce((sum, entry) => sum + entry.weight, 0);
    return {
      ...item,
      score,
      matched: hits.map((entry) => entry.phrase),
    };
  })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.code.localeCompare(b.code, undefined, { numeric: true }),
    );

  const top = scored[0]?.score ?? 0;
  const second = scored[1]?.score ?? 0;
  return scored.map((item) => ({
    ...item,
    confidence: confidenceFor(item.score, top, second, item.score === top),
  }));
}

function confidenceFor(score: number, top: number, second: number, isTop: boolean): Confidence {
  if (score < CLEAR_SCORE) return 'low';
  if (isTop && top - second <= 2) return 'low';
  if (!isTop && top - score <= 2) return 'low';
  return 'clearer';
}

/** Links to show an educator. Empty when nothing clears a small bar. */
export function selectLinks(ranked: RankedLink[]): RankedLink[] {
  const top = ranked[0];
  if (!top || top.score < MIN_SCORE) return [];
  // Keep a second link when it is close, so a low-confidence flag has something to point at.
  return ranked
    .filter((item) => item.score >= MIN_SCORE && item.score >= top.score * 0.66)
    .slice(0, 3);
}

export function primaryLink(ranked: RankedLink[]): RankedLink | null {
  const top = ranked[0];
  if (!top || top.score < MIN_SCORE) return null;
  return top;
}
