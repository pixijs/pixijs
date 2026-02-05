# PixiJS Playground

A local development sandbox for testing PixiJS code during development.

## Quick Start

1. From the project root, run:
   ```bash
   npm run dev
   ```
   This starts both the PixiJS watch mode and the playground Vite server.

2. Open http://localhost:5173 in your browser.

3. The `default.playground.ts` will load automatically, showing a bunny sprite.

## Creating Your Own Playground

1. Duplicate `src/default.playground.ts` to create a new file:
   ```bash
   cp src/default.playground.ts src/my-test.playground.ts
   ```

2. Edit your new file with your test code.

3. Refresh the browser - your new playground appears in the dropdown.

4. Select it from the dropdown to run it.

## File Structure

```
playground/
├── src/
│   ├── main.ts                  # Selector UI (don't edit)
│   ├── default.playground.ts    # Example template
│   └── *.playground.ts          # Your test files (gitignored)
└── assets/
    └── bunny.png                # Test asset
```

## Build Status Indicator

The playground shows a status indicator in the top-right corner:

- **Yellow (spinning)** - PixiJS is recompiling after source changes
- **Green (checkmark)** - PixiJS build is ready and fresh

When compilation completes, the playground automatically reloads to pick up the changes.

## Notes

- All `*.playground.ts` files are gitignored except `default.playground.ts`
- Changes to playground files hot-reload instantly
- Changes to PixiJS source trigger a rebuild (watch mode) and auto-reload
- The playground imports the local PixiJS build from `../lib/index.mjs`
