import type { Health, SampleNote, StoryDraft } from './types';

export async function fetchHealth(): Promise<Health> {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error('Health check failed');
  return (await response.json()) as Health;
}

export async function fetchSamples(): Promise<SampleNote[]> {
  const response = await fetch('/api/samples');
  if (!response.ok) throw new Error('Samples failed');
  const body = (await response.json()) as { samples: SampleNote[] };
  return body.samples;
}

export async function draftStory(notes: string, mandarin: boolean): Promise<StoryDraft> {
  const response = await fetch('/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, mandarin }),
  });
  const body = (await response.json()) as StoryDraft | { error?: string };
  if (!response.ok || !('draft' in body)) {
    const message = 'error' in body && body.error ? body.error : 'The draft did not come back.';
    throw new Error(message);
  }
  return body;
}
