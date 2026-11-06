export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
      </>
    ),
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7Z" />,
    list: (
      <>
        <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    share: (
      <>
        <path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    cube: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8Zm0 9 9-4M3 8l9 4v10" />
      </>
    ),
    power: (
      <>
        <path d="M12 2v10M6 5a9 9 0 1 0 12 0" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.cube}
    </svg>
  );
}
