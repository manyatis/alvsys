# VibeHero Git Integration

Automatically link your git commits to VibeHero issues for complete traceability and seamless workflow integration.

## Overview

VibeHero's git integration automatically adds commit information as comments to related issues, providing a complete audit trail of all work done on each task. This eliminates the need to manually update issues with commit references and ensures perfect traceability.

## Features

- ✅ **Automatic commit comments** - Every commit is automatically added as a comment to referenced issues
- ✅ **Issue validation** - Pre-commit hooks validate that referenced issues exist
- ✅ **Multiple reference formats** - Supports VH-123, #123, card-abc123, issue-abc123, and full issue IDs
- ✅ **Rich commit information** - Includes hash, author, date, branch, message, and changed files
- ✅ **Repository links** - Direct links back to commits in your repository
- ✅ **Conventional commits** - Optional support for conventional commit format
- ✅ **Cross-platform** - Works on macOS, Linux, and Windows (with Git Bash)

## Quick Setup

### 1. Run the Setup Script

From your project root directory:

```bash
./scripts/setup-git-hooks.sh
```

The script will:
- Install pre-commit and post-commit hooks
- Prompt for your VibeHero Project ID
- Configure API settings
- Create a `.vibehero` configuration file

### 2. Configure Your Project ID

If you didn't run the setup script, manually configure your project:

```bash
git config vibehero.projectId "your-project-id-here"
git config vibehero.apiUrl "https://vibehero.io"
```

### 3. Start Committing

Include issue references in your commit messages:

```bash
# Reference a specific issue
git commit -m "feat: add user authentication VH-123"

# Reference multiple issues
git commit -m "fix: resolve login bugs #456 #789"

# Use full issue IDs
git commit -m "refactor: improve database queries cme0gx68g0005jr049y0m1zvy"
```

## Supported Issue Reference Formats

| Format | Example | Description |
|--------|---------|-------------|
| `VH-123` | `VH-123` | VibeHero issue number format |
| `#123` | `#123` | GitHub-style issue reference |
| `card-abc123` | `card-abc123` | Card prefix format |
| `issue-abc123` | `issue-abc123` | Issue prefix format |
| Full ID | `cme0gx68g...` | Complete VibeHero issue ID |

## How It Works

### Pre-Commit Hook

Before each commit, the pre-commit hook:

1. **Extracts issue references** from your commit message
2. **Validates issue IDs** by checking if they exist in your project
3. **Prevents invalid commits** if referenced issues don't exist
4. **Provides helpful feedback** about commit message format

### Post-Commit Hook

After each successful commit, the post-commit hook:

1. **Gathers commit information** (hash, author, date, branch, files)
2. **Finds referenced issues** in the commit message
3. **Adds rich comments** to each referenced issue
4. **Includes repository links** for easy navigation

### Example Comment Added to Issue

When you make a commit like:

```bash
git commit -m "feat: implement user dashboard VH-123"
```

VibeHero automatically adds this comment to issue VH-123:

---

**Git Commit Added**

**Commit:** `a1b2c3d4e5f6`
**Author:** John Doe <john@example.com>
**Date:** 2025-08-10 15:30:22 -0800
**Branch:** feature/user-dashboard

**Message:**
```
feat: implement user dashboard VH-123
```

**Changed Files:**
```
src/components/Dashboard.tsx
src/pages/dashboard.tsx
src/styles/dashboard.css
```

[View commit in repository](https://github.com/yourorg/project/commit/a1b2c3d4e5f6)

---

## Advanced Configuration

### Environment Variables

You can use environment variables instead of git config:

```bash
export VIBEHERO_PROJECT_ID="your-project-id"
export VIBEHERO_API_URL="https://vibehero.io"
export REPOSITORY_URL="https://github.com/yourorg/project"
```

### Custom Hook Installation

If you prefer manual installation:

```bash
# Copy hooks to .git/hooks/
cp scripts/git-hooks/pre-commit .git/hooks/
cp scripts/git-hooks/post-commit .git/hooks/

# Make them executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

### Bypassing Hooks

If you need to commit without triggering hooks:

```bash
# Skip pre-commit validation
git commit --no-verify -m "emergency fix"

# Skip all hooks
git commit -n -m "quick update"
```

## Troubleshooting

### Hook Not Running

1. **Check permissions:**
   ```bash
   ls -la .git/hooks/
   # Should show -rwxr-xr-x for hook files
   ```

2. **Verify configuration:**
   ```bash
   git config --list | grep vibehero
   ```

### API Connection Issues

1. **Test API connectivity:**
   ```bash
   curl -s https://vibehero.io/api/health
   ```

2. **Check project ID:**
   - Verify your project ID in VibeHero dashboard
   - Ensure no trailing spaces or special characters

### Issue Validation Failing

1. **Check issue format:**
   - Use supported formats (VH-123, #123, etc.)
   - Ensure issue exists in your project

2. **Debug validation:**
   - Check `.git/hooks/pre-commit` output
   - Verify API response manually

## CI/CD Integration

### GitHub Actions

Add to your workflow to integrate with VibeHero in CI:

```yaml
name: VibeHero Integration
on: [push]

jobs:
  update-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 2
      
      - name: Update VibeHero Issues
        env:
          VIBEHERO_PROJECT_ID: ${{ secrets.VIBEHERO_PROJECT_ID }}
          VIBEHERO_API_URL: "https://vibehero.io"
        run: |
          # Extract commit info
          COMMIT_MSG=$(git log -1 --pretty=%B)
          COMMIT_HASH=$(git rev-parse HEAD)
          
          # Add commit comment to issues
          ./scripts/git-hooks/post-commit
```

### GitLab CI

```yaml
vibehero-integration:
  stage: deploy
  script:
    - export VIBEHERO_PROJECT_ID=$VIBEHERO_PROJECT_ID
    - ./scripts/git-hooks/post-commit
  variables:
    VIBEHERO_API_URL: "https://vibehero.io"
  only:
    - main
    - develop
```

## Best Practices

### Commit Message Format

Use conventional commits with issue references:

```bash
# Good examples
git commit -m "feat(auth): add OAuth integration VH-123"
git commit -m "fix(api): resolve timeout issues #456 #789"
git commit -m "docs: update API documentation VH-101"

# Avoid
git commit -m "fixed stuff"
git commit -m "WIP"
```

### Issue References

- **Always reference issues** for feature work and bug fixes
- **Use multiple references** when commits affect multiple issues
- **Be consistent** with your chosen reference format
- **Include context** in commit messages beyond just the issue reference

### Workflow Integration

1. **Start with issue creation** in VibeHero
2. **Reference issues in commits** consistently
3. **Review commit comments** in issues for traceability
4. **Use status updates** to move issues through workflow

## Security Considerations

- **Keep project IDs secure** - don't expose in public repositories
- **Use environment variables** for sensitive configuration
- **Validate API endpoints** before making requests
- **Consider rate limiting** for high-frequency commits

## Support

For issues with git integration:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review hook output in terminal
3. Test API connectivity manually
4. Contact support with specific error messages

The git integration makes VibeHero the single source of truth for your development workflow, providing complete traceability from issue creation to code deployment.