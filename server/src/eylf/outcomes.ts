/**
 * Outcome titles and sub-outcome statements copied from the official PDF.
 *
 * Australian Government Department of Education [AGDE] (2022). Belonging, Being
 * and Becoming: The Early Years Learning Framework for Australia (V2.0).
 * Australian Government Department of Education for the Ministerial Council.
 * https://www.acecqa.gov.au/sites/default/files/2023-01/EYLF-2022-V2.0.pdf
 *
 * The PDF lists each sub-outcome as a bullet. `code` is that order, which is
 * how educators cite them (1.1, 4.2). The number is not printed in the PDF.
 * Wording was checked against that file. Do not paraphrase these strings.
 */

export const FRAMEWORK_CITATION =
  'Australian Government Department of Education [AGDE] (2022). Belonging, Being and Becoming: The Early Years Learning Framework for Australia (V2.0). Australian Government Department of Education for the Ministerial Council.';

export const FRAMEWORK_URL =
  'https://www.acecqa.gov.au/sites/default/files/2023-01/EYLF-2022-V2.0.pdf';

export const NUMBERING_NOTE =
  'The framework lists these as bullet points. The numbers follow that order.';

export type SubOutcome = {
  code: string;
  outcomeCode: string;
  outcome: string;
  statement: string;
};

export const SUBOUTCOMES: readonly SubOutcome[] = [
  {
    code: '1.1',
    outcomeCode: '1',
    outcome: 'Children have a strong sense of identity',
    statement: 'Children feel safe, secure and supported',
  },
  {
    code: '1.2',
    outcomeCode: '1',
    outcome: 'Children have a strong sense of identity',
    statement: 'Children develop their emerging autonomy, inter-dependence, resilience and agency',
  },
  {
    code: '1.3',
    outcomeCode: '1',
    outcome: 'Children have a strong sense of identity',
    statement:
      'Children develop knowledgeable, confident self-identities and a positive sense of self-worth',
  },
  {
    code: '1.4',
    outcomeCode: '1',
    outcome: 'Children have a strong sense of identity',
    statement: 'Children learn to interact in relation to others with care, empathy and respect',
  },
  {
    code: '2.1',
    outcomeCode: '2',
    outcome: 'Children are connected with and contribute to their world',
    statement:
      'Children develop a sense of connectedness to groups and communities and an understanding of their reciprocal rights and responsibilities as active and informed citizens',
  },
  {
    code: '2.2',
    outcomeCode: '2',
    outcome: 'Children are connected with and contribute to their world',
    statement: 'Children respond to diversity with respect',
  },
  {
    code: '2.3',
    outcomeCode: '2',
    outcome: 'Children are connected with and contribute to their world',
    statement: 'Children become aware of fairness',
  },
  {
    code: '2.4',
    outcomeCode: '2',
    outcome: 'Children are connected with and contribute to their world',
    statement: 'Children become socially responsible and show respect for the environment',
  },
  {
    code: '3.1',
    outcomeCode: '3',
    outcome: 'Children have a strong sense of wellbeing',
    statement: 'Children become strong in their social, emotional and mental wellbeing',
  },
  {
    code: '3.2',
    outcomeCode: '3',
    outcome: 'Children have a strong sense of wellbeing',
    statement: 'Children become strong in their physical learning and wellbeing',
  },
  {
    code: '3.3',
    outcomeCode: '3',
    outcome: 'Children have a strong sense of wellbeing',
    statement:
      'Children are aware of and develop strategies to support their own mental and physical health and personal safety',
  },
  {
    code: '4.1',
    outcomeCode: '4',
    outcome: 'Children are confident and involved learners',
    statement:
      'Children develop a growth mindset and learning dispositions such as curiosity, cooperation, confidence, creativity, commitment, enthusiasm, persistence, imagination and reflexivity',
  },
  {
    code: '4.2',
    outcomeCode: '4',
    outcome: 'Children are confident and involved learners',
    statement:
      'Children develop a range of learning and thinking skills and processes such as problem solving, inquiry, experimentation, hypothesising, researching and investigating',
  },
  {
    code: '4.3',
    outcomeCode: '4',
    outcome: 'Children are confident and involved learners',
    statement: 'Children transfer and adapt what they have learned from one context to another',
  },
  {
    code: '4.4',
    outcomeCode: '4',
    outcome: 'Children are confident and involved learners',
    statement:
      'Children resource their own learning through connecting with people, place, technologies and natural and processed materials',
  },
  {
    code: '5.1',
    outcomeCode: '5',
    outcome: 'Children are effective communicators',
    statement: 'Children interact verbally and non-verbally with others for a range of purposes',
  },
  {
    code: '5.2',
    outcomeCode: '5',
    outcome: 'Children are effective communicators',
    statement: 'Children engage with a range of texts and gain meaning from these texts',
  },
  {
    code: '5.3',
    outcomeCode: '5',
    outcome: 'Children are effective communicators',
    statement: 'Children express ideas and make meaning using a range of media',
  },
  {
    code: '5.4',
    outcomeCode: '5',
    outcome: 'Children are effective communicators',
    statement: 'Children begin to understand how symbols and pattern systems work',
  },
  {
    code: '5.5',
    outcomeCode: '5',
    outcome: 'Children are effective communicators',
    statement:
      'Children use digital technologies and media to access information, investigate ideas and represent their thinking',
  },
] as const;

const byCode = new Map(SUBOUTCOMES.map((item) => [item.code, item]));

export function subOutcome(code: string): SubOutcome | undefined {
  return byCode.get(code);
}

export function outcomeTitle(outcomeCode: string): string | undefined {
  return SUBOUTCOMES.find((item) => item.outcomeCode === outcomeCode)?.outcome;
}
