import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 / OUTSIDE THE WORKSPACE</p>
      <h1>Let’s head back.</h1>
      <p>This room doesn’t exist, but the workspace does.</p>
      <Link className="primary-button" href="/">
        Open the workspace
      </Link>
    </main>
  );
}
