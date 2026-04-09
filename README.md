# William Pelrine Blog

An Astro-powered personal site for writing, selected projects, and a small photography archive.

## Stack

- Astro
- TypeScript
- Markdown content collections
- GitHub Pages via GitHub Actions

## Local Development

Use Node 22 for the smoothest local setup.

```bash
npm install
npm run dev
```

## Build

For a production-like GitHub Pages build, pass the temporary Pages URL and base path:

```bash
SITE_URL=https://fuiste.github.io/blog/ BASE_PATH=/blog npm run build
```

For a local build without the project-site prefix:

```bash
npm run build
```

## Content Authoring

### Blog posts

Add a file under `src/content/posts/`:

```md
---
title: Your title
description: Short summary for cards and metadata.
pubDate: 2026-04-09
updatedDate: 2026-04-09
tags:
  - Tag One
  - Tag Two
featured: false
draft: false
heroImage: /images/optional-hero.jpg
---
```

### Projects

Add a file under `src/content/projects/`:

```md
---
title: Project name
summary: One-sentence description.
status: Active
tags:
  - TypeScript
  - Tooling
featured: true
order: 4
links:
  - label: Repository
    href: https://github.com/you/project
  - label: Live site
    href: https://example.com
---
```

### Photos

Add an image to `public/images/photos/`, then create a file under `src/content/photos/`:

```md
---
title: Image title
image: /images/photos/example.jpg
alt: Accessible description of the photo.
location: Madison, WI
takenAt: Summer 2024
featured: false
order: 4
---
```

## Deployment

The included GitHub Actions workflow deploys the built Astro site to GitHub Pages on pushes to `main`.

Custom-domain and DNS cutover work are intentionally deferred until the site is ready.
