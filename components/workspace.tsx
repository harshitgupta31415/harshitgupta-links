'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { profiles, projects, projectIndex, sourceUrl, type Station } from '@/lib/content';
import { Icon } from './icon';
import type { SceneApi } from './workspace-scene';

const primaryProfiles = [
  'github',
  'linkedin',
  'leetcode',
  'codeforces',
  'atcoder',
  'codeyes',
  'codechef',
  'unstop',
].map((id) => profiles.find((p) => p.id === id)!);
const Scene = dynamic(() => import('./workspace-scene'), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span className="loader-orbit" />
      <span>Preparing the workspace…</span>
    </div>
  ),
});

export function Workspace() {
  const api = useRef<SceneApi | null>(null);
  const [mode, setMode] = useState<'profiles' | 'projects'>('profiles');
  const [selected, setSelected] = useState<Station | null>(null);
  const [paused, setPaused] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [list, setList] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [help, setHelp] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const items = mode === 'profiles' ? primaryProfiles : projects;

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
    if (matchMedia('(max-width: 760px)').matches) setLowPower(true);
  }, []);

  useEffect(() => {
    api.current?.setStations(items);
    api.current?.reset();
    setSelected(null);
  }, [items, ready]);
  useEffect(() => {
    api.current?.setPaused(paused || list);
  }, [paused, list, ready]);
  useEffect(() => {
    api.current?.setLowPower(lowPower);
  }, [lowPower, ready]);
  useEffect(() => {
    if (!dialog.current) return;
    if (list && !dialog.current.open) dialog.current.showModal();
    else if (!list && dialog.current.open) dialog.current.close();
  }, [list]);

  function selectStation(station: Station) {
    setSelected(station);
    api.current?.focus(station.id);
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(location.origin);
      setNotice('Workspace link copied.');
    } catch {
      setNotice('Copy the workspace address from your browser to share it.');
    }
  }

  return (
    <div className="workspace-shell">
      <div className="world" aria-label="Interactive 3D developer workspace">
        {!error ? (
          <Scene
            apiRef={api}
            onReady={() => setReady(true)}
            onSelect={selectStation}
            onError={(message) => setError(message)}
          />
        ) : (
          <div className="scene-fallback">
            <Icon name="cube" size={54} />
            <h2>The links are still here.</h2>
            <p>{error}</p>
            <button className="primary-button" onClick={() => setList(true)}>
              Browse all links
            </button>
          </div>
        )}
      </div>

      <section className="identity-panel" aria-label="About Harshit">
        <p className="eyebrow">
          <span className="status-dot" /> PERSONAL WORKSPACE / 01
        </p>
        <div className="identity-title">
          <Image
            className="avatar"
            src="/avatar.png"
            alt="Harshit Gupta's black and gold profile emblem"
            width={56}
            height={56}
            preload
          />
          <span>
            NEW DELHI, INDIA<small>18 · Developer & builder</small>
          </span>
        </div>
        <h1>
          Harshit
          <br />
          <span>Gupta.</span>
        </h1>
        <p className="identity-bio">
          I build things that make
          <br className="desktop-break" /> a developer’s life easier.
        </p>
        <p className="identity-role">
          Full-stack developer. CTO at
          <br />
          <a href="https://www.vedonyx.com/" target="_blank" rel="noopener noreferrer">
            Vedonyx
          </a>{' '}
          & OnlyDigitalTeam.
        </p>
        <div className="identity-tags">
          <span>Open source</span>
          <span>Codeforces Expert</span>
        </div>
        <button className="explore-button" onClick={() => api.current?.enter()} disabled={!ready}>
          <Icon name="cube" size={18} />
          Enter the workspace<span>3D</span>
        </button>
        <p className="identity-hint">A small space. Everything I’m building.</p>
      </section>

      <div className="world-caption">
        <span className="tiny-cross">+</span> YOUR NEXT CONNECTION
        <br />
        <span>IS SOMEWHERE IN HERE.</span>
      </div>
      <div className="view-tools" aria-label="Workspace controls">
        <button
          title="Zoom in"
          aria-label="Zoom in"
          disabled={!ready}
          onClick={() => api.current?.zoom(0.8)}
        >
          <Icon name="plus" />
        </button>
        <button
          title="Zoom out"
          aria-label="Zoom out"
          disabled={!ready}
          onClick={() => api.current?.zoom(1.25)}
        >
          <Icon name="minus" />
        </button>
        <button
          title="Reset camera"
          aria-label="Reset camera"
          disabled={!ready}
          onClick={() => {
            api.current?.reset();
            setSelected(null);
          }}
        >
          <Icon name="reset" />
        </button>
        <span className="tool-divider" />
        <button
          title={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
          aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </button>
        <button
          title="Low-power mode"
          aria-label="Low-power mode"
          aria-pressed={lowPower}
          onClick={() => setLowPower((p) => !p)}
        >
          <Icon name="power" />
        </button>
        <button title="Copy workspace link" aria-label="Copy workspace link" onClick={share}>
          <Icon name="share" />
        </button>
      </div>

      {selected ? (
        <aside className="station-panel" aria-live="polite" aria-label="Selected station">
          <button
            className="close-panel"
            aria-label="Close station details"
            onClick={() => {
              setSelected(null);
              api.current?.reset();
            }}
          >
            <Icon name="close" size={18} />
          </button>
          <p className="eyebrow">{selected.label}</p>
          <span className="station-symbol" style={{ color: selected.color }}>
            {selected.symbol}
          </span>
          <h2>{selected.name}</h2>
          <p className="station-handle">{selected.handle}</p>
          <p className="station-description">{selected.description}</p>
          <a
            className="primary-button"
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open {selected.name}
            <Icon name="external" size={16} />
          </a>
        </aside>
      ) : null}

      <div className="interaction-note">
        <span className="mouse-icon" />
        <span>Drag to explore · Scroll to zoom · Select a station</span>
        <button
          aria-expanded={help}
          onClick={() => setHelp((v) => !v)}
          aria-label="Show keyboard and touch controls"
        >
          ?
        </button>
      </div>
      {help ? (
        <div className="controls-help">
          <strong>Make yourself at home.</strong>
          <p>Mouse: drag to orbit, scroll to zoom, click a labelled console.</p>
          <p>Touch: one finger to orbit; pinch to zoom.</p>
          <p>
            Keyboard: focus the 3D view and use arrow keys to orbit, + / − to zoom, and Home to
            reset. All stations are also buttons below.
          </p>
          <p>Prefer a quieter visit? Pause motion or switch on low-power mode.</p>
        </div>
      ) : null}

      <section className="station-dock" aria-label="Choose a workspace station">
        <div className="dock-header">
          <div className="mode-switch" aria-label="Station collection">
            <button aria-pressed={mode === 'profiles'} onClick={() => setMode('profiles')}>
              Profiles <span>08</span>
            </button>
            <button aria-pressed={mode === 'projects'} onClick={() => setMode('projects')}>
              Selected work <span>04</span>
            </button>
          </div>
          <button className="list-toggle" onClick={() => setList(true)}>
            <Icon name="list" size={17} />
            <span>All links</span>
          </button>
        </div>
        <div className="station-buttons">
          {items.map((item, index) => (
            <button
              className={selected?.id === item.id ? 'station-button selected' : 'station-button'}
              key={item.id}
              onClick={() => selectStation(item)}
              aria-pressed={selected?.id === item.id}
            >
              <span className="station-button-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="station-button-symbol" style={{ color: item.color }}>
                {item.symbol}
              </span>
              <span>{item.name}</span>
              <span className="station-button-dot" />
            </button>
          ))}
        </div>
      </section>

      <footer className="workspace-footer">
        <span>
          <span className="status-dot" />
          {error
            ? 'DIRECT LINKS AVAILABLE'
            : ready
              ? lowPower
                ? 'LOW POWER / 20 FPS CAP'
                : paused
                  ? 'AMBIENT MOTION PAUSED'
                  : 'WORKSPACE ONLINE / 30 FPS CAP'
              : 'LOADING ENVIRONMENT'}
        </span>
        <a
          href="https://quaternius.com/packs/modularscifimegakit.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Environment: Quaternius · CC0
        </a>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          View source
        </a>
      </footer>
      <p className="share-notice" role="status">
        {notice}
      </p>

      <dialog
        ref={dialog}
        className="links-dialog"
        aria-label="All profiles and selected projects"
        onCancel={() => setList(false)}
        onClose={() => setList(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setList(false);
        }}
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">NO DETOURS</p>
              <h2>Every link. One place.</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close all links"
              onClick={() => setList(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <h3>
            Find me online <span>{profiles.length}</span>
          </h3>
          <div className="direct-links">
            {profiles.map((p) => (
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
          <h3>
            Selected work <span>04</span>
          </h3>
          <div className="direct-links">
            {projects.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
                <span style={{ color: p.color }}>{p.symbol}</span>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.label}</small>
                </div>
                <Icon name="external" size={15} />
              </a>
            ))}
          </div>
          <div className="dialog-extra">
            <a href={projectIndex} target="_blank" rel="noopener noreferrer">
              Full project index
            </a>
            <a
              href="https://github.com/harshitgupta31415/harshitgupta31415#open-source-contributions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open-source record
            </a>
            <a href="mailto:harshitgupta3.1415@gmail.com">Email me</a>
            <Link href="/platforms" onClick={() => setList(false)}>
              Platform guide
            </Link>
          </div>
        </div>
      </dialog>
      <noscript>
        <section className="no-script-links">
          <h2>My profiles</h2>
          {profiles.map((p) => (
            <a key={p.id} href={p.url}>
              {p.name}
            </a>
          ))}
          <h2>Selected projects</h2>
          {projects.map((p) => (
            <a key={p.id} href={p.url}>
              {p.name}
            </a>
          ))}
        </section>
      </noscript>
    </div>
  );
}
