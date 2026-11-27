import { LEARNING_ZH, MANDARIN_NOTE, NEXT_STEPS_ZH, NO_LINK_ZH } from './copy.js';
import { leadName, tidyNotes } from './notes.js';
import type { StoryLink } from '../types.js';

const CLAUSES: { pattern: RegExp; zh: string }[] = [
  {
    pattern: /arrived|stayed close|morning routine|photo on the locker|settled/i,
    zh: '到园后先靠近老师，跟着早上的常规，并找到柜子上自己的照片',
  },
  { pattern: /on his own|on her own|on their own|i'll do it|chose/i, zh: '自己做了选择并继续做' },
  { pattern: /at home we speak|grandma|her family|his family/i, zh: '讲起家里的语言和家人' },
  { pattern: /upset|sat with|knelt beside|crying|hurt/i, zh: '走近难过或受伤的同伴' },
  { pattern: /voted|\bvote\b/i, zh: '和小组一起投票' },
  { pattern: /both ways|different way|different countries/i, zh: '谈到两种不同的做法' },
  { pattern: /take turns|that's fair|sand timer/i, zh: '提出轮流，并用沙漏' },
  { pattern: /worm farm|food scraps/i, zh: '把剩菜放进蚯蚓箱' },
  { pattern: /watered|vegetable garden/i, zh: '给菜园浇水' },
  { pattern: /calm-down|i feel|breaths/i, zh: '说出自己的情绪，并让自己平静下来' },
  { pattern: /balance beam/i, zh: '走平衡木' },
  { pattern: /\bclimb/i, zh: '攀爬' },
  {
    pattern: /wash(?:ed)? (?:her|his|their) hands|germs|\bhat\b|helmet/i,
    zh: '洗手、戴帽子或拿头盔，并说到健康和安全',
  },
  { pattern: /puzzle|keep trying|try another way|for a long time/i, zh: '留在难的任务上继续试' },
  { pattern: /vinegar|bicarb|guessed/i, zh: '做了一个小实验，并先猜了结果' },
  { pattern: /yesterday|same plan/i, zh: '把昨天的想法换到了另一个地方' },
  { pattern: /gathered|magnifying glass|on the ground/i, zh: '自己去找工具和地上的材料' },
  { pattern: /went back and forth|listened|talked/i, zh: '和同伴来回商量' },
  { pattern: /picture book|what does that say|rhyme/i, zh: '看书，并问页面上的字' },
  { pattern: /painted|painting/i, zh: '用画说出自己的想法' },
  { pattern: /pattern|counted|big, small/i, zh: '数数，并排规律' },
  { pattern: /tablet|look up|screen|scrolled/i, zh: '用平板查找图片' },
];

export function mandarinWhatHappened(notes: string): { text: string; note: string } {
  const hits = [
    ...new Set(CLAUSES.filter((item) => item.pattern.test(notes)).map((item) => item.zh)),
  ];
  const who = leadName(notes) ?? '孩子';
  const english = tidyNotes(notes);
  if (hits.length === 0) {
    return {
      text: `今天的记录我没有套进现成的中文短句。英文笔记：${english}`,
      note: MANDARIN_NOTE,
    };
  }
  return {
    text: `今天看到${who}：${hits.join('；')}。\n\n英文笔记：${english}`,
    note: MANDARIN_NOTE,
  };
}

export function mandarinLearning(links: StoryLink[]): string {
  if (links.length === 0) return NO_LINK_ZH;
  return links
    .map((link) => {
      const line = LEARNING_ZH[link.code] ?? '';
      const flag = link.confidence === 'low' ? ' 这一条把握不大，用之前请再看一遍。' : '';
      return `${link.code} ${line}${flag}`.trim();
    })
    .join('\n');
}

export function mandarinNextSteps(links: StoryLink[]): string[] {
  const steps: string[] = [];
  for (const link of links) {
    for (const step of NEXT_STEPS_ZH[link.code] ?? []) {
      if (steps.length >= 4) return steps;
      if (!steps.includes(step)) steps.push(step);
    }
  }
  if (steps.length === 0) {
    steps.push('先把笔记写具体，再决定下一步。');
  }
  return steps;
}
