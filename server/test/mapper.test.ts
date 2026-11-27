import { describe, expect, it } from 'vitest';
import { hasPhrase, primaryLink, rankLinks, selectLinks } from '../src/eylf/mapper.js';

describe('word matcher', () => {
  it('does not treat a word as part of a longer word', () => {
    const text = 'she painted that hat and then voted'.toLowerCase();
    expect(hasPhrase(text, 'paint')).toBe(false);
    expect(hasPhrase(text, 'painted')).toBe(true);
    expect(hasPhrase(text, 'hat')).toBe(true);
    expect(hasPhrase(text, 'vote')).toBe(false);
    expect(hasPhrase(text, 'voted')).toBe(true);
  });

  it('maps a clear arrival note to 1.1', () => {
    const notes = [
      'Maya arrived and stayed close to me.',
      'She joined the morning routine and found her photo on the locker.',
      'She was settled and looked for me.',
    ].join('\n');
    const chosen = selectLinks(rankLinks(notes));
    expect(chosen[0]?.code).toBe('1.1');
    expect(chosen[0]?.statement).toBe('Children feel safe, secure and supported');
    expect(chosen[0]?.confidence).toBe('clearer');
  });

  it('maps an experiment to 4.2 and quotes the official sentence', () => {
    const notes = [
      'Sienna poured vinegar onto the bicarb.',
      'She guessed it would bubble.',
      'She asked why the second one was faster.',
    ].join('\n');
    const top = primaryLink(rankLinks(notes));
    expect(top?.code).toBe('4.2');
    expect(top?.statement).toContain('hypothesising');
  });

  it('flags a thin or close match as low confidence', () => {
    const notes = 'Leo started the sun again on his own.\nHe used red paint.';
    const top = primaryLink(rankLinks(notes));
    expect(top?.code).toBe('1.2');
    expect(top?.confidence).toBe('low');
  });

  it('does not force a link when the notes are too thin', () => {
    const notes = 'Child A played outside with a friend.\nThey came back inside and seemed happy.';
    expect(selectLinks(rankLinks(notes))).toEqual([]);
    expect(primaryLink(rankLinks(notes))).toBeNull();
  });

  it('is deterministic', () => {
    const notes = 'The group voted on a song.\nPriya gave a vote.';
    expect(rankLinks(notes)).toEqual(rankLinks(notes));
  });
});
