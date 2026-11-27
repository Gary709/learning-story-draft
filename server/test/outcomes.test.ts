import { describe, expect, it } from 'vitest';
import { SUBOUTCOMES, subOutcome } from '../src/eylf/outcomes.js';
import { PHRASES } from '../src/eylf/phrases.js';

const EXPECTED: Record<string, string> = {
  '1.1': 'Children feel safe, secure and supported',
  '1.2': 'Children develop their emerging autonomy, inter-dependence, resilience and agency',
  '1.3':
    'Children develop knowledgeable, confident self-identities and a positive sense of self-worth',
  '1.4': 'Children learn to interact in relation to others with care, empathy and respect',
  '2.1':
    'Children develop a sense of connectedness to groups and communities and an understanding of their reciprocal rights and responsibilities as active and informed citizens',
  '2.2': 'Children respond to diversity with respect',
  '2.3': 'Children become aware of fairness',
  '2.4': 'Children become socially responsible and show respect for the environment',
  '3.1': 'Children become strong in their social, emotional and mental wellbeing',
  '3.2': 'Children become strong in their physical learning and wellbeing',
  '3.3':
    'Children are aware of and develop strategies to support their own mental and physical health and personal safety',
  '4.1':
    'Children develop a growth mindset and learning dispositions such as curiosity, cooperation, confidence, creativity, commitment, enthusiasm, persistence, imagination and reflexivity',
  '4.2':
    'Children develop a range of learning and thinking skills and processes such as problem solving, inquiry, experimentation, hypothesising, researching and investigating',
  '4.3': 'Children transfer and adapt what they have learned from one context to another',
  '4.4':
    'Children resource their own learning through connecting with people, place, technologies and natural and processed materials',
  '5.1': 'Children interact verbally and non-verbally with others for a range of purposes',
  '5.2': 'Children engage with a range of texts and gain meaning from these texts',
  '5.3': 'Children express ideas and make meaning using a range of media',
  '5.4': 'Children begin to understand how symbols and pattern systems work',
  '5.5':
    'Children use digital technologies and media to access information, investigate ideas and represent their thinking',
};

describe('EYLF V2.0 wording', () => {
  it('keeps the official sub-outcome sentences', () => {
    expect(SUBOUTCOMES).toHaveLength(20);
    for (const [code, statement] of Object.entries(EXPECTED)) {
      expect(subOutcome(code)?.statement).toBe(statement);
    }
  });

  it('keeps the five outcome titles', () => {
    expect(subOutcome('1.1')?.outcome).toBe('Children have a strong sense of identity');
    expect(subOutcome('2.1')?.outcome).toBe(
      'Children are connected with and contribute to their world',
    );
    expect(subOutcome('3.1')?.outcome).toBe('Children have a strong sense of wellbeing');
    expect(subOutcome('4.1')?.outcome).toBe('Children are confident and involved learners');
    expect(subOutcome('5.1')?.outcome).toBe('Children are effective communicators');
  });

  it('has phrases for every sub-outcome and no extras', () => {
    expect(Object.keys(PHRASES).sort()).toEqual(SUBOUTCOMES.map((item) => item.code).sort());
  });
});
