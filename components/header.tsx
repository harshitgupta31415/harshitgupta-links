import Link from 'next/link';
import { Icon } from './icon';
export function Header({ guide = false }: { guide?: boolean }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Harshit Gupta home">
        <span className="wordmark-symbol">
          h<span>.</span>g
        </span>
        <span>
          HARSHIT GUPTA<small>THE PERSONAL NETWORK</small>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/workspace" aria-current={!guide ? 'page' : undefined}>
          The workspace
        </Link>
        <Link href="/platforms" aria-current={guide ? 'page' : undefined}>
          Platform guide <span className="nav-count">12</span>
        </Link>
      </nav>
      <a className="header-contact" href="mailto:harshitgupta3.1415@gmail.com">
        <Icon name="mail" size={17} />
        <span>Let’s talk</span>
      </a>
    </header>
  );
}
