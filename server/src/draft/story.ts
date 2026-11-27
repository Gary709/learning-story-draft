import type { AppConfig } from '../config.js';
import { MANDARIN_NOTE } from './copy.js';
import { openAiCompleter, buildMessages, parseModelStory } from './llmDraft.js';
import { ruleStory } from './ruleDraft.js';
import type { Completer, StoryDraft } from '../types.js';

export async function draftStory(input: {
  notes: string;
  mandarin: boolean;
  config: AppConfig;
  complete?: Completer;
}): Promise<StoryDraft> {
  const rules = ruleStory(input.notes, input.mandarin);
  if (input.config.mode !== 'model') return rules;

  const complete = input.complete ?? openAiCompleter(input.config);
  try {
    const text = await complete({
      messages: buildMessages(input.notes, rules.links, input.mandarin),
      signal: AbortSignal.timeout(20_000),
    });
    const allowed = new Set(rules.links.map((link) => link.code));
    const parsed = parseModelStory(text, allowed, input.mandarin);
    if (!parsed) return { ...rules, modelFellBack: true };
    return {
      ...rules,
      source: 'model',
      modelFellBack: false,
      whatHappened: parsed.whatHappened,
      learning: parsed.learning,
      nextSteps: parsed.nextSteps,
      mandarin: input.mandarin
        ? {
            whatHappened: parsed.mandarin?.whatHappened ?? rules.mandarin?.whatHappened ?? '',
            learning: parsed.mandarin?.learning ?? rules.mandarin?.learning ?? '',
            nextSteps: parsed.mandarin?.nextSteps ?? rules.mandarin?.nextSteps ?? [],
            translationNote: MANDARIN_NOTE,
          }
        : null,
    };
  } catch {
    return { ...rules, modelFellBack: true };
  }
}
