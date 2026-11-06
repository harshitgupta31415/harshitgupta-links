'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { profiles, projects, sourceUrl, type Station } from '@/lib/content';
import type { SceneApi } from './workspace-scene';
import { Icon } from './icon';

const Scene = dynamic(() => import('./workspace-scene'), { ssr: false });
const chapters = [
  'The introduction',
  'The open source',
  'The problem solving',
  'The things I build',
  'The next connection',
];

export function Experience() {
  const api = useRef<SceneApi | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [low, setLow] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  useEffect(() => {
    if (matchMedia('(max-width: 760px)').matches) setLow(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);
  useEffect(() => {
    api.current?.setLowPower(low);
  }, [low, ready]);
  useEffect(() => {
    api.current?.setPaused(paused || links);
  }, [paused, links, ready]);
  useEffect(() => {
    if (links) dialog.current?.showModal();
    else dialog.current?.close();
  }, [links]);
  useEffect(() => {
    let scheduled = 0;
    function update() {
      const journey = document.querySelector('.experience-journey');
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const value = Math.max(0, Math.min(1, -rect.top / (journey.clientHeight - innerHeight)));
      api.current?.setJourney(value);
      setProgress(value);
      setChapter(Math.min(4, Math.floor(value * 4 + 0.42)));
      scheduled = 0;
    }
    function onScroll() {
      if (!scheduled) scheduled = requestAnimationFrame(update);
    }
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(scheduled);
    };
  }, [ready]);
  function jump(index: number) {
    document
      .getElementById(`chapter-${index}`)
      ?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  }

  return (
    <div className="experience-journey">
      <div className="experience-stage" aria-hidden="true">
        <Scene
          guided
          apiRef={api}
          onReady={() => setReady(true)}
          onError={setError}
          onSelect={(station) => {
            setSelected(station);
            setLinks(true);
          }}
        />
        <div className="experience-shade" />
      </div>
      <header className="experience-header">
        <Link href="/" className="experience-brand">
          <Image src="/avatar.png" alt="Harshit Gupta" width={39} height={39} preload />
          <span>
            HARSHIT GUPTA<small>DEVELOPER & BUILDER</small>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/workspace">Explore in 3D</Link>
          <Link href="/platforms">Platform guide</Link>
          <button
            onClick={() => {
              setSelected(null);
              setLinks(true);
            }}
          >
            All links <Icon name="list" size={16} />
          </button>
        </nav>
      </header>

      <main id="main" className="journey-chapters">
        <section id="chapter-0" className="journey-chapter chapter-intro">
          <div className="chapter-copy">
            <p className="eyebrow">
              <span className="status-dot" /> A PERSONAL NETWORK, REIMAGINED
            </p>
            <h1>
              Harshit Gupta.
              <br />
              <em>Always building.</em>
            </h1>
            <p className="chapter-lead">
              From the first line of code
              <br />
              to something worth putting into the world.
            </p>
            <p className="chapter-detail">
              18. Full-stack developer. Open-source contributor.
              <br />
              CTO at Vedonyx & OnlyDigitalTeam.
            </p>
            <button className="journey-cta" onClick={() => jump(1)}>
              Step into my world <span>SCROLL TO EXPLORE</span>
            </button>
          </div>
          <div className="chapter-side-note">
            NEW DELHI, INDIA
            <br />
            CODE / CURIOSITY / CRAFT
          </div>
        </section>
        <section id="chapter-1" className="journey-chapter">
          <div className="chapter-copy">
            <p className="eyebrow">01 / THE OPEN SOURCE</p>
            <h2>
              Better code.
              <br />
              <em>Built together.</em>
            </h2>
            <p className="chapter-lead">
              The most useful work starts
              <br />
              with a real problem.
            </p>
            <p className="chapter-detail">
              Developer tools, fixes, and contributions.
              <br />
              The code is public. So is the learning.
            </p>
            <a
              className="journey-text-link"
              href={profiles[0].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Find me on GitHub <Icon name="external" size={16} />
            </a>
            <a
              className="subtle-link"
              href="https://github.com/harshitgupta31415/harshitgupta31415#open-source-contributions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the open-source record
            </a>
          </div>
        </section>
        <section id="chapter-2" className="journey-chapter">
          <div className="chapter-copy">
            <p className="eyebrow">02 / THE PROBLEM SOLVING</p>
            <h2>
              Think deeper.
              <br />
              <em>Keep trying.</em>
            </h2>
            <p className="chapter-lead">
              A better solution is usually
              <br />
              one more question away.
            </p>
            <p className="chapter-detail">
              Codeforces Expert. Algorithms on LeetCode.
              <br />
              Python in my toolkit. C++ in progress.
            </p>
            <div className="journey-link-row">
              {profiles
                .filter((p) => ['codeforces', 'leetcode', 'atcoder'].includes(p.id))
                .map((p) => (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.name}
                    <Icon name="external" size={14} />
                  </a>
                ))}
            </div>
          </div>
        </section>
        <section id="chapter-3" className="journey-chapter">
          <div className="chapter-copy">
            <p className="eyebrow">03 / THE THINGS I BUILD</p>
            <h2>
              Less friction.
              <br />
              <em>More possibility.</em>
            </h2>
            <p className="chapter-lead">
              Tools for the moments
              <br />
              when building gets difficult.
            </p>
            <div className="journey-projects">
              {projects.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
                  <span style={{ color: p.color }}>{p.symbol}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.label}</small>
                  </div>
                  <Icon name="external" size={14} />
                </a>
              ))}
            </div>
          </div>
        </section>
        <section id="chapter-4" className="journey-chapter chapter-connect">
          <div className="chapter-copy">
            <p className="eyebrow">04 / THE NEXT CONNECTION</p>
            <h2>
              Good things
              <br />
              <em>start with hello.</em>
            </h2>
            <p className="chapter-lead">
              An interesting problem.
              <br />A new idea. Something to build together.
            </p>
            <div className="journey-link-row">
              <a href="mailto:harshitgupta3.1415@gmail.com">
                Say hello
                <Icon name="mail" size={16} />
              </a>
              <a href={profiles[1].url} target="_blank" rel="noopener noreferrer">
                LinkedIn
                <Icon name="external" size={14} />
              </a>
            </div>
            <button
              className="subtle-link"
              onClick={() => {
                setSelected(null);
                setLinks(true);
              }}
            >
              Find all {profiles.length} profiles
            </button>
            <div className="journey-final-nav">
              <Link href="/workspace">
                <Icon name="cube" size={17} />
                Explore the workspace freely
              </Link>
              <Link href="/platforms">Discover more platforms</Link>
            </div>
          </div>
        </section>
      </main>
      <noscript>
        <section className="no-script-links">
          <h2>My profiles</h2>
          {profiles.map((p) => (
            <a key={p.id} href={p.url}>
              {p.name}
            </a>
          ))}
        </section>
      </noscript>

      <aside className="journey-progress" aria-label="Journey chapters">
        {chapters.map((name, i) => (
          <button
            key={name}
            aria-label={`Go to ${name}`}
            aria-current={chapter === i ? 'step' : undefined}
            onClick={() => jump(i)}
          >
            <span>{String(i).padStart(2, '0')}</span>
            <i />
          </button>
        ))}
      </aside>
      <footer className="experience-controls">
        <span className="experience-status">
          <span className="status-dot" />
          {error
            ? 'DIRECT LINKS READY'
            : ready
              ? `${String(chapter).padStart(2, '0')} / ${chapters[chapter].toUpperCase()}`
              : 'PREPARING YOUR WORKSPACE'}
        </span>
        <div className="experience-control-buttons">
          <button
            aria-label="Low-power mode"
            aria-pressed={low}
            title="Low-power mode"
            onClick={() => setLow((v) => !v)}
          >
            <Icon name="power" size={16} />
            <span>{low ? 'LOW POWER' : 'ECO'}</span>
          </button>
          <button
            aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
            aria-pressed={paused}
            onClick={() => setPaused((v) => !v)}
          >
            <Icon name={paused ? 'play' : 'pause'} size={16} />
          </button>
          <button
            onClick={() => jump(Math.min(chapter + 1, 4))}
            aria-label="Next chapter"
            disabled={chapter === 4}
          >
            <span>CONTINUE</span>
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="journey-progress-line" style={{ transform: `scaleX(${progress})` }} />
      </footer>
      <dialog
        ref={dialog}
        className="links-dialog"
        aria-label="Harshit Gupta's public links"
        onCancel={() => setLinks(false)}
        onClose={() => setLinks(false)}
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">THE PERSONAL NETWORK</p>
              <h2>{selected ? selected.name : 'Every link. One place.'}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close links"
              onClick={() => setLinks(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          {selected ? <p className="chapter-detail">{selected.description}</p> : null}
          <div className="direct-links">
            {(selected ? [selected] : [...profiles, ...projects]).map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
                <span style={{ color: p.color }}>{p.symbol}</span>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.handle}</small>
                </div>
                <Icon name="external" size={15} />
              </a>
            ))}
          </div>
          <div className="dialog-extra">
            <a href="mailto:harshitgupta3.1415@gmail.com">Email</a>
            <Link href="/platforms">Platform guide</Link>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              Source code
            </a>
            <a
              href="https://quaternius.com/packs/modularscifimegakit.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Environment: Quaternius · CC0
            </a>
          </div>
        </div>
      </dialog>
    </div>
  );
}
