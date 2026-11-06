import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Harshit Gupta — The Workspace', template: '%s · Harshit Gupta' },
  description:
    'Step into my interactive workspace. Code, competitive programming, open-source contributions, and projects by Harshit Gupta.',
  openGraph: {
    title: 'Harshit Gupta — The Workspace',
    description: 'Developer. Builder. Problem solver. Explore my profiles and selected work.',
    images: [{ url: '/avatar.png', width: 460, height: 460, alt: 'Harshit Gupta' }],
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Harshit Gupta — The Workspace', images: ['/avatar.png'] },
  icons: { icon: '/avatar.png', apple: '/avatar.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
