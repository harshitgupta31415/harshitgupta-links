import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/header';
import { profiles } from '@/lib/content';
import { PlatformDirectory } from '@/components/platform-directory';
export const metadata: Metadata = {
  title: 'Developer platform guide',
  description:
    'A curated guide to coding practice, hackathons, technical writing, and developer communities.',
};
export default function Platforms() {
  return (
    <>
      <Header guide />
      <main id="main" className="directory-page">
        <div className="directory-intro">
          <p className="eyebrow">
            <span className="status-dot" /> KEEP EXPLORING
          </p>
          <h1>
            More places.
            <br />
            <em>More possibilities.</em>
          </h1>
          <p>
            A useful profile shows work. These are places to practise, share projects, and meet
            other builders.
          </p>
          <div className="editor-note">
            <span>01 / A LITTLE FOCUS GOES FURTHER</span>Start with CodEyes, Peerlist, and a
            hackathon portfolio. Pick one writing platform when you have a lesson to share.
          </div>
        </div>
        <PlatformDirectory />
        <p className="directory-disclaimer">
          This guide includes existing platforms and places to explore. My {profiles.length}{' '}
          verified public profiles are in <Link href="/">the workspace</Link>. Links and
          descriptions checked in November 2026.
        </p>
      </main>
      <footer className="site-footer">
        <span>Harshit Gupta · Build with intention.</span>
        <Link href="/">Back to the workspace</Link>
      </footer>
    </>
  );
}
