export type Confidence = 'clearer' | 'low';

export type StoryLink = {
  code: string;
  outcomeCode: string;
  outcome: string;
  statement: string;
  confidence: Confidence;
  matched: string[];
};

export type MandarinDraft = {
  whatHappened: string;
  learning: string;
  nextSteps: string[];
  translationNote: string;
};

export type StoryDraft = {
  draft: true;
  stored: false;
  source: 'rules' | 'model';
  modelFellBack: boolean;
  whatHappened: string;
  learning: string;
  links: StoryLink[];
  nextSteps: string[];
  lowConfidence: boolean;
  mandarin: MandarinDraft | null;
  review: string[];
  reviewMandarin: string[];
};

export type SampleNote = {
  id: string;
  title: string;
  notes: string;
  synthetic: true;
};

export type Health = {
  mode: 'rules' | 'model';
  storesNotes: false;
  postsToStorypark: false;
};
