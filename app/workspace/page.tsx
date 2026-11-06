import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Workspace } from '@/components/workspace';
export const metadata: Metadata = { title: 'Explore the workspace' };
export default function Explore() {
  return (
    <>
      <Header />
      <main id="main">
        <Workspace />
      </main>
    </>
  );
}
