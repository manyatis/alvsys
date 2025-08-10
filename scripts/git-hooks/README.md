# VibeHero Git Hooks

This directory contains git hooks that automatically integrate your commits with VibeHero issues for seamless traceability.

## Quick Start

```bash
# From project root
./scripts/setup-git-hooks.sh
```

## Manual Installation

```bash
# Copy hooks
cp scripts/git-hooks/* .git/hooks/

# Make executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit

# Configure project
git config vibehero.projectId "your-project-id"
git config vibehero.apiUrl "https://vibehero.io"
```

## Files

- **`pre-commit`** - Validates issue references before commit
- **`post-commit`** - Adds commit info as comments to issues
- **`README.md`** - This documentation

## Configuration

Set these git config values or environment variables:

```bash
VIBEHERO_PROJECT_ID="your-project-id"
VIBEHERO_API_URL="https://vibehero.io"  # optional, defaults to this
REPOSITORY_URL="https://github.com/user/repo"  # optional, for commit links
```

## Usage

Include issue references in commit messages:

```bash
git commit -m "feat: add authentication VH-123"
git commit -m "fix: resolve bug #456"
git commit -m "refactor: improve code card-abc123"
```

The hooks will automatically:
- Validate that referenced issues exist
- Add rich commit information as comments to those issues
- Include commit hash, author, date, changed files, and repository link

## Supported Formats

- `VH-123` - VibeHero issue format
- `#123` - GitHub-style references  
- `card-abc123` - Card prefix format
- `issue-abc123` - Issue prefix format
- `cme0gx68g...` - Full VibeHero issue ID

See the full documentation at `docs/git-integration.md` for advanced usage and troubleshooting.