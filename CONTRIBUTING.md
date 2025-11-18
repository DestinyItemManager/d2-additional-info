# Contributing to d2-additional-info

Thank you for your interest in contributing! This guide will help you get started with contributing to d2-additional-info.

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
- **Bungie API Key** ([Get one here](https://www.bungie.net/en/Application))

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/d2-additional-info.git
   cd d2-additional-info
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Set up your API key**:
   ```bash
   # On Linux/macOS:
   export API_KEY="your-bungie-api-key-here"

   # On Windows (PowerShell):
   $env:API_KEY="your-bungie-api-key-here"

   # On Windows (cmd):
   set API_KEY=your-bungie-api-key-here
   ```

5. **Generate data to verify setup**:
   ```bash
   pnpm generate-data
   ```

If this completes successfully, you're ready to contribute!

## Development Workflow

### Making Changes

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b my-feature-name
   ```

2. **Make your changes** in the appropriate files

3. **Test your changes**:
   ```bash
   # Run specific generator scripts
   pnpm generate-data-sub script-name

   # Or run all generators
   pnpm generate-data
   ```

4. **Lint and format** your code:
   ```bash
   # Check for linting issues
   pnpm lint:eslint

   # Auto-fix linting issues
   pnpm fix:eslint

   # Check formatting
   pnpm lint:prettier

   # Auto-fix formatting
   pnpm fix:prettier
   ```

5. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))

6. **Push to your fork**:
   ```bash
   git push origin my-feature-name
   ```

7. **Open a Pull Request** on GitHub

## Code Style

This project uses:
- **ESLint 9** with flat config for linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

### Pre-commit Hooks

When you commit, the following runs automatically:
- **Prettier** formats your staged files
- **Import organization** via prettier-plugin-organize-imports

If the pre-commit hook fails, fix the issues and try committing again.

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

> **⚠️ Important:** NEVER manually edit JSON files anywhere (including `output/` or `data/`). All JSON files are generated by scripts and manual edits will be overwritten. If output is incorrect, fix the generator script or update TypeScript config files in `data/`, then re-run generators.

### Check Types

```bash
pnpm build
```

This compiles TypeScript and catches type errors.

## Commit Guidelines

Write clear commit messages that explain what you changed and why. Keep it simple:

- Describe what changed (e.g., "Add guardian games participation data" or "Fix event info generator")
- Add details if helpful (but not required)
- Don't include AI tool attribution in commit messages

That's it! No strict format required - just make it clear enough for reviewers to understand your changes.

## Pull Request Process

### Before Submitting

**Automated** (runs on commit via husky):
- ✅ Code formatting with Prettier

**Manual checks** (run these yourself):
- `pnpm lint:eslint` - Check for linting issues
- `pnpm generate-data` - Builds TypeScript and tests that generators work (if you changed generator scripts)
- Update README.md if you added new output files

### PR Description

Include in your PR description:
- **What** you changed
- **Why** you made the change
- **How** to test the change
- Link to related issues (if any)

### Example PR Description

```markdown
## Summary
Add missing exotic weapon hashes to craftable weapons list

## Changes
- Updated craftable weapons detection in `generate-craftable-hashes.ts`
- Added pattern checking for new Episode exotic weapons
- Regenerated `craftable-hashes.json` with updated data
- Updated README.md documentation

## Testing
1. Run `pnpm generate-data-sub craftable-hashes`
2. Verify `output/craftable-hashes.json` includes new exotic hashes
3. Confirm no existing craftable weapons were removed

Fixes #123
```

### Review Process

- Maintainers will review your PR
- You may be asked to make changes
- Once approved, a maintainer will merge your PR

## Common Tasks

> **⚠️ Golden Rule:** Never manually edit JSON files or `data/generated-enums.ts`. All JSON files (in `output/` or `data/`) are generated by scripts. You CAN edit TypeScript config files in `data/` (e.g., `bounty-config.ts`). If JSON data is wrong, fix the generator script or update TypeScript config files, then re-run the generators.

### Manifest Updates (Automated)

When Bungie releases a new manifest, a GitHub Actions workflow automatically:
1. Detects the new manifest
2. Runs `pnpm generate-data`
3. Creates a pull request with the updated output files

**As a contributor:** You don't need to do anything for manifest updates - they're handled automatically. The automated PR will be reviewed and merged by maintainers.

### Add Missing Item Hashes or Configuration

If you notice missing items in generated output or need to update configuration:

1. Check if there's a TypeScript config file in `data/` for this data (e.g., `bounty-config.ts`)
2. Update the TypeScript config file (NOT JSON files - those are generated!)
3. Run the relevant generator to regenerate the JSON output
4. Submit a PR with the updated config file and regenerated output

**Note:** If there's no config file and the data comes directly from the manifest, fix the generator script itself.

### Fix Deprecated Data

When updating deprecated files:

1. Check CHANGELOG.md for migration path
2. Update consuming code to use v2 files
3. Test thoroughly
4. Submit a PR

### Debug a Generator

```bash
# Add console.log statements to the generator
# Then run it:
pnpm generate-data-sub your-script-name

# Or use Node.js debugger:
node --inspect-brk built/src/main.js your-script-name
```

## Questions?

- **Check existing issues** on GitHub
- **Ask in a new issue** if you need help
- **Look at existing generators** for examples

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to make DIM better!

---

Thank you for contributing to d2-additional-info! 🎮
