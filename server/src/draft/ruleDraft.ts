import { LEARNING, NEXT_STEPS, NO_LINK, REVIEW, REVIEW_ZH } from './copy.js';
import { mandarinLearning, mandarinNextSteps, mandarinWhatHappened } from './mandarin.js';
import { tidyNotes } from './notes.js';
import { primaryLink, rankLinks, selectLinks } from '../eylf/mapper.js';
import type { StoryDraft, StoryLink } from '../types.js';

export function linksFromNotes(notes: string): StoryLink[] {
  return selectLinks(rankLinks(notes)).map((link) => ({
    code: link.code,
    outcomeCode: link.outcomeCode,
    outcome: link.outcome,
    statement: link.statement,
    confidence: link.confidence,
    matched: link.matched.slice(0, 4),
  }));
}

export function learningFromLinks(links: StoryLink[]): string {
  if (links.length === 0) return NO_LINK;
  return links
    .map((link) => {
      const line = LEARNING[link.code] ?? '';
      const flag =
        link.confidence === 'low'
          ? ' This link is a weak match. I would check it before using it.'
          : '';
      return `${link.code}: ${line}${flag}`;
    })
    .join(' ');
}

export function nextStepsFromLinks(links: StoryLink[]): string[] {
  const steps: string[] = [];
  for (const link of links) {
    for (const step of NEXT_STEPS[link.code] ?? []) {
      if (steps.length >= 4) return steps;
      if (!steps.includes(step)) steps.push(step);
    }
  }
  if (steps.length === 0) {
    steps.push('Add a line about what the child did and what they said, then draft again.');
  }
  return steps.slice(0, 4);
}

export function ruleStory(notes: string, mandarin: boolean): StoryDraft {
  const links = linksFromNotes(notes);
  const lowConfidence = links.length === 0 || links.some((link) => link.confidence === 'low');
  const mandarinDraft = mandarin
    ? {
        ...(() => {
          const happened = mandarinWhatHappened(notes);
          return {
            whatHappened: happened.text,
            learning: mandarinLearning(links),
            nextSteps: mandarinNextSteps(links),
            translationNote: happened.note,
          };
        })(),
      }
    : null;

  return {
    draft: true,
    stored: false,
    source: 'rules',
    modelFellBack: false,
    whatHappened: tidyNotes(notes),
    learning: learningFromLinks(links),
    links,
    nextSteps: nextStepsFromLinks(links),
    lowConfidence,
    mandarin: mandarinDraft,
    review: [...REVIEW],
    reviewMandarin: mandarin ? [...REVIEW_ZH] : [],
  };
}

export function predictedCode(notes: string): string | null {
  return primaryLink(rankLinks(notes))?.code ?? null;
}
