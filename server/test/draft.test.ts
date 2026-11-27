import { describe, expect, it } from 'vitest';
import { readConfig, type AppConfig } from '../src/config.js';
import { subOutcome } from '../src/eylf/outcomes.js';
import { draftStory } from '../src/draft/story.js';
import { ruleStory } from '../src/draft/ruleDraft.js';

const notes = [
  'Sienna poured vinegar onto the bicarb in the trough.',
  'She guessed "it will bubble" and then tried it with warm water.',
  'She asked why the second one bubbled faster.',
].join('\n');

function modelConfig(): AppConfig {
  return { ...readConfig({}), mode: 'model', apiKey: 'test-key' };
}

describe('rule draft', () => {
  it('quotes the official sub-outcome and marks itself as an unsaved draft', () => {
    const story = ruleStory(notes, false);
    expect(story.draft).toBe(true);
    expect(story.stored).toBe(false);
    expect(story.source).toBe('rules');
    expect(story.links[0]?.code).toBe('4.2');
    expect(story.links[0]?.statement).toBe(subOutcome('4.2')?.statement);
    expect(story.whatHappened).toContain('vinegar');
    expect(story.nextSteps.length).toBeGreaterThan(0);
    expect(story.review.some((item) => item.includes('Storypark'))).toBe(true);
    expect(story.mandarin).toBeNull();
  });

  it('adds a Mandarin frame without calling it an official translation', () => {
    const story = ruleStory(notes, true);
    expect(story.mandarin?.whatHappened).toMatch(/[\u4e00-\u9fff]/);
    expect(story.mandarin?.translationNote).toContain('不是官方译本');
    expect(story.mandarin?.learning).toContain('4.2');
    expect(story.mandarin?.nextSteps.length).toBeGreaterThanOrEqual(2);
    expect(story.reviewMandarin.length).toBeGreaterThan(0);
  });

  it('says when there is no clear link', () => {
    const story = ruleStory('Child A played outside.\nThey came back in.', false);
    expect(story.links).toEqual([]);
    expect(story.lowConfidence).toBe(true);
    expect(story.learning).toMatch(/could not see a clear EYLF link/i);
  });
});

describe('model draft', () => {
  it('uses model paragraphs and keeps the mapper links', async () => {
    const story = await draftStory({
      notes,
      mandarin: false,
      config: modelConfig(),
      complete: async () =>
        JSON.stringify({
          whatHappened: 'Sienna tried vinegar and bicarb and asked why it bubbled.',
          learning: 'She was testing an idea.',
          nextSteps: ['Offer the same trough tomorrow.', 'Ask for her guess first.'],
          links: ['9.9'],
        }),
    });
    expect(story.source).toBe('model');
    expect(story.modelFellBack).toBe(false);
    expect(story.whatHappened).toContain('Sienna tried vinegar');
    expect(story.links.map((link) => link.code)).toEqual(['4.2']);
    expect(story.links[0]?.statement).toBe(subOutcome('4.2')?.statement);
    expect(story.stored).toBe(false);
  });

  it('falls back when the model cites an outcome the notes did not support', async () => {
    const story = await draftStory({
      notes,
      mandarin: false,
      config: modelConfig(),
      complete: async () =>
        JSON.stringify({
          whatHappened: 'This was really about 5.5 and a tablet.',
          learning: 'Ignore the list.',
          nextSteps: ['Do something else.'],
        }),
    });
    expect(story.source).toBe('rules');
    expect(story.modelFellBack).toBe(true);
    expect(story.whatHappened).toContain('vinegar');
  });

  it('falls back when the model request throws', async () => {
    const story = await draftStory({
      notes,
      mandarin: true,
      config: modelConfig(),
      complete: async () => {
        throw new Error('network');
      },
    });
    expect(story.modelFellBack).toBe(true);
    expect(story.source).toBe('rules');
    expect(story.mandarin).not.toBeNull();
  });

  it('does not call the model when there is no key', async () => {
    let called = false;
    const story = await draftStory({
      notes,
      mandarin: false,
      config: readConfig({ OPENAI_API_KEY: '' }),
      complete: async () => {
        called = true;
        return '{}';
      },
    });
    expect(called).toBe(false);
    expect(story.source).toBe('rules');
  });
});
