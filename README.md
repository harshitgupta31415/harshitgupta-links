# Harshit Gupta · The Workspace

An interactive 3D link hub for my developer profiles, selected projects, and a curated developer-platform guide. Built with Next.js, React, TypeScript, and Three.js.

## Explore

- Orbit a small sci-fi workspace made from authored, textured environment meshes.
- Select computer stations to inspect a profile or project, then open its real link.
- Follow a five-chapter cinematic journey with scroll-controlled camera travel through an authored tech environment.
- Freely explore eight featured profile stations and four project stations at `/workspace`.
- Open all thirteen verified public profiles from either view.
- Enter the room, zoom, reset the camera, pause ambient motion, or enable low-power mode.
- Use the searchable [platform guide](./PROFILE-DIRECTORY.md) for twelve additional places to practise, publish, and connect.
- Browse every link in an accessible dialog without interacting with the 3D scene.

## Run locally

Requires Node.js 22.13+ (Node.js 24 LTS recommended).

```bash
npm ci
npm run dev
```

Open the local address printed by Next.js. No environment variables, API keys, database, or login are required.

```bash
npm run check:links
npm run typecheck
npm run build
```

## Project structure

| Path                             | Purpose                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `data/content.json`              | Verified profile URLs, selected projects, and recommended platforms                    |
| `components/workspace.tsx`       | Station navigation, detail panels, accessible direct links, and controls               |
| `components/experience.tsx`      | The cinematic home page, scroll progress, chapter navigation, and direct profile links |
| `components/workspace-scene.tsx` | WebGL scene, authored room assembly, raycasting, camera movement, resource cleanup     |
| `app/platforms/page.tsx`         | Searchable platform directory                                                          |
| `public/models/`                 | Optimized, self-hosted environment assets and original licence                         |
| `scripts/prepare-assets.mjs`     | Reproducible preparation of the official source assets                                 |

## Performance choices

The environment asset download is under 1 MB, with shared textures reduced to at most 512px. The 3D bundle loads separately from the main interface. The renderer caps resolution at 1.5× device pixels and frames at 30 fps; low-power mode uses 1× and 20 fps. Phones start in low-power mode. Rendering skips hidden/off-screen views, and the scene pauses behind the direct-links dialog. There are no real-time shadows, bloom, SSAO, physics, video backgrounds, or automatic camera spinning. Reduced-motion preferences pause ambient motion. These are budgets, not a promise of identical performance on every device.

The graphics renderer is optional: loading failures and unavailable WebGL show direct links. A no-JavaScript profile list is also provided. Browser navigation, project links, and directory filters do not require a backend.

## Deployment

Import this public GitHub repository through the Vercel dashboard. Choose **Next.js**, keep the root directory at the repository root, and use the default build settings. No environment configuration is necessary. Git pushes to the repository's production branch trigger subsequent deployments.

## Asset credits

The room uses a selected subset of **Quaternius — Modular Sci-Fi MegaKit (Standard)** under **CC0 1.0**. Models were rearranged into a custom workspace; textures were resized and converted to WebP. The original licence is included at [public/models/LICENSE.txt](./public/models/LICENSE.txt).

- [Original pack and author](https://quaternius.com/packs/modularscifimegakit.html)
- [CC0 licence](https://creativecommons.org/publicdomain/zero/1.0/)
- [Third-party notices](./THIRD-PARTY-NOTICES.md)

To recreate optimized assets, download the free Standard pack from its official page, extract it, then run:

```bash
node scripts/prepare-assets.mjs "/path/to/Modular SciFi MegaKit[Standard]"
```

The profile emblem belongs to Harshit Gupta. Platform names identify their respective services; no affiliation is implied. Project code is MIT licensed. Third-party assets retain their own licences.
