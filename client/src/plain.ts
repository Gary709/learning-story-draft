import type { StoryDraft } from './types';

export function draftToText(story: StoryDraft): string {
  const lines = [
    'DRAFT. Not saved. Not sent to Storypark.',
    '',
    'What happened',
    story.whatHappened,
    '',
    'What this learning shows',
    story.learning,
    '',
    'EYLF V2.0',
  ];
  if (story.links.length === 0) {
    lines.push('No clear link.');
  }
  for (const link of story.links) {
    const flag = link.confidence === 'low' ? 'Low confidence. ' : '';
    lines.push(`${flag}${link.code} ${link.statement}`);
    lines.push(`Outcome ${link.outcomeCode}: ${link.outcome}`);
  }
  lines.push('', 'Possible next steps', ...story.nextSteps.map((step) => `- ${step}`));
  if (story.mandarin) {
    lines.push(
      '',
      '给家人的中文草稿',
      story.mandarin.translationNote,
      '',
      '发生了什么',
      story.mandarin.whatHappened,
      '',
      '这说明了什么学习',
      story.mandarin.learning,
      '',
      '可以怎么往下做',
      ...story.mandarin.nextSteps.map((step) => `- ${step}`),
    );
  }
  lines.push('', 'Review before using', ...story.review.map((item) => `- ${item}`));
  return lines.join('\n');
}
