'use client';
import { useState } from 'react';
import { platforms, profiles } from '@/lib/content';
import { Icon } from './icon';
const categories = ['All', ...new Set(platforms.map((p) => p.category))];
export function PlatformDirectory() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const found = platforms.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section className="platform-directory" aria-label="Developer platforms">
      <div className="directory-toolbar">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Search developer platforms</span>
          <input
            type="search"
            placeholder="Find your next platform…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span aria-live="polite">{found.length} platforms</span>
      </div>
      <div className="filter-chips" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="directory-grid">
        {found.map((p, i) => (
          <a
            className="directory-card"
            key={p.id}
            href={profiles.find((account) => account.id === p.id)?.url ?? p.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="directory-card-top">
              <span className="index-number">
                {String(platforms.indexOf(p) + 1).padStart(2, '0')}
              </span>
              {profiles.some((account) => account.id === p.id) ? (
                <span className="tag tag-accent">My profile</span>
              ) : p.priority === 'Start here' ? (
                <span className="tag tag-accent">Start here</span>
              ) : (
                <span className="tag">{p.category}</span>
              )}
              <Icon name="external" size={16} />
            </div>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <span className="platform-domain">{new URL(p.url).hostname.replace('www.', '')}</span>
          </a>
        ))}
      </div>
      {found.length === 0 ? (
        <div className="empty-state">
          <h2>No matches yet.</h2>
          <p>Try another name or a different category.</p>
          <button
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </section>
  );
}
