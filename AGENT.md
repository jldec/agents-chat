# Agent Instructions for agents-chat Project

## Project Overview
This is a Cloudflare Workers/Redwood SDK project for a chat application.

## Package Management
- Use `pnpm` for all package installations
- Dev dependencies: `pnpm install -D <package>`
- Regular dependencies: `pnpm install <package>`

## Build Commands
- Development: `pnpm run dev`
- Build: `pnpm run build`
- Deploy: `pnpm run ship`
- Type checking: `pnpm run types`

## Styling & CSS
- Uses Tailwind CSS v4 with @tailwindcss/vite plugin
- Main styles in `src/app/styles.css`
- To add Tailwind plugins, use `@plugin` directive in CSS file instead of creating separate tailwind.config.js
- Example: `@plugin "@tailwindcss/typography";`

## Code Conventions
- Uses TypeScript
- React components in `src/app/` directory
- Shared components in `src/app/shared/`
- Uses Prettier formatting with:
  - printWidth: 120
  - tabWidth: 2
  - singleQuote: true
  - no semicolons
  - no trailing commas

## Libraries Used
- `markdown-it` for Markdown rendering
- `nanoid` for ID generation
- `clsx` and `tailwind-merge` for className utilities
- `tinybase` for state management
- `reconnecting-websocket` for WebSocket connections

## Markdown Rendering Pattern
When rendering markdown content (like assistant messages):
```tsx
import markdownit from 'markdown-it'

const md = markdownit({
  linkify: true
})

// In component:
<div dangerouslySetInnerHTML={{ __html: md.render(content) }}></div>
```

## Project Structure
- `src/app/` - Main application code
- `src/app/shared/` - Shared components
- `src/app/styles.css` - Main stylesheet
- `public/` - Static assets
- `dist/` - Build output
