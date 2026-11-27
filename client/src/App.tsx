import { useEffect, useState } from 'react';
import { draftStory, fetchHealth, fetchSamples } from './api';
import { draftToText } from './plain';
import type { Health, SampleNote, StoryDraft } from './types';

function lineCount(notes: string): number {
  return notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;
}

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [samples, setSamples] = useState<SampleNote[]>([]);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [mandarin, setMandarin] = useState(false);
  const [story, setStory] = useState<StoryDraft | null>(null);
  const [draftedNotes, setDraftedNotes] = useState('');
  const [checked, setChecked] = useState<boolean[]>([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [copyNote, setCopyNote] = useState('');

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    fetchSamples()
      .then(setSamples)
      .catch(() => setSamples([]));
  }, []);

  const lines = lineCount(notes);
  const lineOk = lines >= 2 && lines <= 6;
  const stale = story !== null && draftedNotes !== notes;

  async function onDraft() {
    setError('');
    setCopyNote('');
    setPending(true);
    try {
      const next = await draftStory(notes, mandarin);
      setStory(next);
      setDraftedNotes(notes);
      setChecked(next.review.map(() => false));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The draft did not come back.');
    } finally {
      setPending(false);
    }
  }

  function onClear() {
    setNotes('');
    setActiveSample(null);
    setStory(null);
    setDraftedNotes('');
    setChecked([]);
    setError('');
    setCopyNote('');
  }

  function pickSample(sample: SampleNote) {
    setNotes(sample.notes);
    setActiveSample(sample.id);
    setError('');
    setCopyNote('');
  }

  async function onCopy() {
    if (!story) return;
    try {
      await navigator.clipboard.writeText(draftToText(story));
      setCopyNote('Copied. It is still only on this page.');
    } catch {
      setCopyNote('Copy failed. Select the draft and copy it yourself.');
    }
  }

  const modeLabel =
    health?.mode === 'model'
      ? 'Model is writing the paragraphs. Links still come from the word list.'
      : 'No API key. Wording and links come from the word list.';

  return (
    <div className="app">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <p className="eyebrow">Preschool, Canberra</p>
            <h1>Learning story draft</h1>
          </div>
          <p className="lede">
            A first draft from a few lines of what I saw. I still edit it before a family reads it.
          </p>
          <p className={health?.mode === 'model' ? 'mode' : 'mode mode-offline'}>{modeLabel}</p>
          <div>
            <p className="aside-label">Synthetic samples</p>
            <div className="samples">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className={activeSample === sample.id ? 'is-selected' : ''}
                  onClick={() => pickSample(sample)}
                >
                  <span>{sample.title}</span>
                  <small>Synthetic</small>
                </button>
              ))}
            </div>
          </div>
          <p className="demo-note">
            Made-up notes only. Do not paste surnames, dates of birth, photos, addresses, or
            anything else that identifies a child or a family. Nothing typed here is saved.
          </p>
        </aside>

        <main className="work">
          <section className="notes-pane">
            <header>
              <h2>Observation notes</h2>
              <p>2 to 6 lines. One thing you saw on each line.</p>
            </header>
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setActiveSample(null);
              }}
              rows={8}
              placeholder={
                'Maya arrived and stayed close to me.\nShe found her photo on the locker and joined the morning routine.'
              }
              aria-label="Observation notes"
            />
            <p className={lineOk || lines === 0 ? 'count' : 'count is-bad'}>
              {lines === 0 ? 'No lines yet' : `${lines} ${lines === 1 ? 'line' : 'lines'}`}
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={mandarin}
                onChange={(event) => setMandarin(event.target.checked)}
              />
              Also draft a Mandarin version for families
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="actions">
              <button
                type="button"
                className="primary"
                disabled={!lineOk || pending}
                onClick={onDraft}
              >
                {pending ? 'Drafting…' : 'Draft the story'}
              </button>
              <button type="button" className="ghost" onClick={onClear}>
                Clear
              </button>
            </div>
          </section>

          <section className="story-pane" aria-live="polite">
            {!story ? (
              <div className="empty">
                <h2>The draft shows up here</h2>
                <p>
                  What happened, what the learning looks like, an EYLF V2.0 link, and a next step.
                </p>
                <p>It stays on this page. It is not posted to Storypark.</p>
              </div>
            ) : (
              <article className="story">
                <p className="banner">Draft. Not saved. Not sent to Storypark.</p>
                {story.lowConfidence ? (
                  <p className="warn">
                    At least one link is a weak match. Check it before you use it.
                  </p>
                ) : null}
                {stale ? (
                  <p className="warn">The notes have changed. Draft again before you use this.</p>
                ) : null}
                <p className="source">
                  {story.source === 'model'
                    ? 'Wording from the model. Links from the word list.'
                    : story.modelFellBack
                      ? 'The model did not return a usable draft. This wording is from the word list.'
                      : 'Wording and links from the word list.'}
                </p>

                <h3>What happened</h3>
                <p className="prose">{story.whatHappened}</p>

                <h3>What this learning shows</h3>
                <p className="prose">{story.learning}</p>

                <h3>EYLF V2.0</h3>
                {story.links.length === 0 ? (
                  <p className="prose">
                    No clear link. I would add more detail before attaching an outcome.
                  </p>
                ) : (
                  <ul className="links">
                    {story.links.map((link) => (
                      <li key={link.code}>
                        <header>
                          <strong>{link.code}</strong>
                          <span className={link.confidence === 'low' ? 'pill is-low' : 'pill'}>
                            {link.confidence === 'low' ? 'Low confidence' : 'Clearer match'}
                          </span>
                        </header>
                        <p>{link.statement}</p>
                        <p className="outcome">
                          Outcome {link.outcomeCode}: {link.outcome}
                        </p>
                        {link.matched.length > 0 ? (
                          <p className="matched">Words that led here: {link.matched.join(', ')}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}

                <h3>Possible next steps</h3>
                <ul className="steps">
                  {story.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>

                {story.mandarin ? (
                  <div className="zh" lang="zh-Hans">
                    <h3>给家人的中文草稿</h3>
                    <p className="note">{story.mandarin.translationNote}</p>
                    <h4>发生了什么</h4>
                    <p className="prose">{story.mandarin.whatHappened}</p>
                    <h4>这说明了什么学习</h4>
                    <p className="prose">{story.mandarin.learning}</p>
                    <h4>可以怎么往下做</h4>
                    <ul className="steps">
                      {story.mandarin.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <fieldset className="review">
                  <legend>Review before using</legend>
                  {story.review.map((item, index) => (
                    <label key={item}>
                      <input
                        type="checkbox"
                        checked={checked[index] ?? false}
                        onChange={() =>
                          setChecked((current) => {
                            const next = story.review.map((_, i) => current[i] ?? false);
                            next[index] = !next[index];
                            return next;
                          })
                        }
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                  {story.reviewMandarin.map((item) => (
                    <p key={item} className="zh-review" lang="zh-Hans">
                      {item}
                    </p>
                  ))}
                </fieldset>

                <div className="actions">
                  <button type="button" className="ghost" onClick={onCopy}>
                    Copy draft
                  </button>
                  {copyNote ? <p className="count">{copyNote}</p> : null}
                </div>
              </article>
            )}
          </section>
        </main>
      </div>
      <p className="footer">
        Outcome sentences from{' '}
        <a href="https://www.acecqa.gov.au/sites/default/files/2023-01/EYLF-2022-V2.0.pdf">
          Belonging, Being and Becoming: The Early Years Learning Framework for Australia (V2.0)
        </a>
        , 2022. The numbers follow the order of the bullet points in that document.
      </p>
    </div>
  );
}
