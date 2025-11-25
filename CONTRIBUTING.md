# Contributing to d2-additional-info

Thank you for your interest in contributing!

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Adding New Generators](#adding-new-generators)
- [Testing Your Changes](#testing-your-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Common Tasks](#common-tasks)

## Getting Started

### Prerequisites

- **Node.js** >= 22 ([Download](https://nodejs.org/))
- **pnpm** >= 10 ([Installation](https://pnpm.io/installation))

### Initial Setup

1. Fork and clone the repository
2. Run `pnpm install`
3. Run `pnpm generate-data` to verify setup

## Development Workflow

### Making Changes

1. Create a new branch
2. Make your changes
3. Test your changes (see [Testing Your Changes](#testing-your-changes))
4. Run `pnpm fix:eslint`
5. Commit and push to your fork (Prettier runs automatically on commit)
6. Open a Pull Request

## Code Style

This project uses:
- **ESLint 9** with flat config for linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

### Pre-commit Hooks

Prettier automatically formats staged files and organizes imports when you commit.

### Style Guidelines

- Use TypeScript for all new code
- Follow existing code patterns in similar scripts
- Use descriptive variable names
- Add comments for complex logic
- Use the `writeFile()` helper from `helpers.ts` for file output
- Use `@d2api/manifest-node` for Destiny 2 manifest access

## Project Structure

```
d2-additional-info/
├── src/                          # TypeScript source files
│   ├── generate-*.ts            # Data generation scripts
│   ├── main.ts                  # Orchestrates script execution
│   ├── helpers.ts               # Shared utility functions
│   └── log.ts                   # Logging utilities
├── output/                       # Generated JSON/TypeScript files
├── data/                         # Static data and config files
│   ├── events/                  # Event-related data
│   ├── seasons/                 # Season-related data
│   └── generated-enums.ts       # Auto-generated enums
├── built/                        # Compiled JavaScript
└── .husky/                       # Git hooks
```

### Key Files

- **`src/main.ts`** - Entry point that runs all generator scripts in order
- **`src/helpers.ts`** - Shared utilities like `writeFile()` and `readJsonFile()`
- **`src/generate-*.ts`** - Individual generator scripts (one per output file)

### Script Execution Order

Generator scripts run in this order:
1. **Priority scripts** (in exact order):
   - `enums` - Generates TypeScript enums from manifest
   - `season-info` - Generates season data
   - `source-info` - Generates source mappings
   - `watermark-info` - Generates watermark mappings
   - `universal-ornament-plugsethashes` - Generates ornament plug set hashes
2. **All other scripts** run alphabetically

Priority scripts generate data that other scripts depend on.

## Adding New Generators

To create a new data generator:

1. **Create a new file** in `src/` named `generate-your-feature.ts`

2. **Follow this pattern**:
   ```typescript
   import { getAllDefs, getDef } from '@d2api/manifest-node';
   import { writeFile } from './helpers.js';

   const TAG = 'YOUR-FEATURE';

   // Fetch data from manifest
   const items = getAllDefs('InventoryItem');

   // Process data
   const result: Record<number, string> = {};
   items.forEach((item) => {
     // Your logic here
     result[item.hash] = item.displayProperties.name;
   });

   // Write output file
   writeFile('./output/your-feature.json', result);
   ```

3. **If other scripts will depend on your script's output**, add your script to `prioritizedScripts` in `src/main.ts` to ensure it runs first

4. **Document your output file** in README.md's "Output Files" section

5. **Test your generator**:
   ```bash
   pnpm generate-data-sub your-feature
   ```

### Important: Module Caching

If your script reads a JSON file that's written by another script during the same `generate-data` run, use `readJsonFile()` instead of static imports:

```typescript
// ❌ Don't use static imports for files written during the same run
import seasons from 'data/seasons/seasons_unfiltered.json' with { type: 'json' };

// ✅ Use readJsonFile to bypass Node.js module cache
import { readJsonFile } from './helpers.js';
const seasons = readJsonFile<Record<string, number>>('./data/seasons/seasons_unfiltered.json');
```

This ensures you always read the latest data from disk, not cached data from before the current run.

## Testing Your Changes

### Test Individual Scripts

```bash
pnpm generate-data-sub script-name
```

Where `script-name` is the generator filename without the `generate-` prefix and `.ts` extension. For example, `src/generate-season-info.ts` → `season-info`.

Example:
```bash
pnpm generate-data-sub season-info source-info
```

### Test All Scripts

```bash
pnpm generate-data
```

### Verify Output

1. Check that your output file appears in `output/`
2. Verify the file contains expected data
3. Ensure no errors were logged during generation
4. Check for unexpected changes in other output files

> **⚠️ Important:** NEVER manually edit JSON files anywhere (including `output/` or `data/`). All JSON files are generated by scripts and manual edits will be overwritten. If output is incorrect, fix the generator script or update TypeScript config files in `data/`, then re-run generators.

## Commit Guidelines

Write clear commit messages that describe what changed and why. No strict format required.

## Pull Request Process

### Before Submitting

- Run `pnpm lint:eslint`
- Run `pnpm generate-data`
- Update README.md if you added new output files

### PR Description

Include:
- What you changed and why
- How to test the change
- Link to related issues (if any)

## Common Tasks

> **⚠️ Golden Rule:** Never manually edit JSON files or `data/generated-enums.ts`. All JSON files (in `output/` or `data/`) are generated by scripts. You CAN edit TypeScript config files in `data/` (e.g., `bounty-config.ts`). If JSON data is wrong, fix the generator script or update TypeScript config files, then re-run the generators.

### Manifest Updates

Manifest updates are handled automatically by GitHub Actions. You don't need to do anything.

### Add Missing Items or Update Configuration

1. Check for a TypeScript config file in `data/` (e.g., `bounty-config.ts`)
2. Update the config file or generator script (NOT JSON files!)
3. Run the generator to regenerate output
4. Submit a PR with the updated config/script and regenerated output

## Questions?

- **Join the DIM Discord** for quick help and discussion
- **Check existing issues** on GitHub
- **Ask in a new issue** if you need help
- **Look at existing generators** for examples

## Code of Conduct

Be respectful and constructive in all interactions.

---

Thank you for contributing to d2-additional-info!
