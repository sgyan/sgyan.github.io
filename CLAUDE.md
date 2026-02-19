# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog ("澄光的博客") built with **Zola** using a custom **minimal** theme, deployed to GitHub Pages at `https://sgyan.github.io`. Content is written in Chinese (zh).

## Commands

```bash
zola serve        # Start local dev server (default: http://127.0.0.1:1111)
zola build        # Generate static site into public/
```

To create a new post, add a markdown file in `content/posts/` with TOML front-matter:
```markdown
+++
title = "Post Title"
date = YYYY-MM-DD
+++
```

## Architecture

- **`config.toml`** — Main Zola configuration (site metadata, theme, slugify, markdown settings)
- **`themes/minimal/`** — Custom minimal theme
  - `templates/base.html` — HTML5 base template
  - `templates/index.html` — Homepage with post list
  - `templates/section.html` — Section page template
  - `templates/page.html` — Individual post template
  - `templates/macros/header.html` — Site header macro
  - `sass/style.scss` — Main stylesheet
  - `sass/_theme.scss` — CSS variables
- **`content/posts/`** — Blog post markdown files with TOML front-matter
- **`static/images/`** — Image assets referenced by posts
- **`public/`** — Generated output (gitignored, rebuilt by CI)

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to `main` triggers:
1. Checkout repository
2. Build and deploy using `shalzz/zola-deploy-action`
3. Deploy to `gh-pages` branch

Requires `PERSONAL_TOKEN` secret configured in the repository.
