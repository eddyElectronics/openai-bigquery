# Contributing to OpenAI-BigQuery

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/openai-bigquery.git
   cd openai-bigquery
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/eddyElectronics/openai-bigquery.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Creating a New Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation changes
- `refactor/` - for code refactoring

### Making Changes

1. Make your changes in your branch
2. Test your changes thoroughly
3. Ensure your code follows the project's style

### Committing Changes in VS Code

#### Step-by-Step Guide

1. **Review Your Changes**:
   - Open Source Control panel (`Ctrl+Shift+G` / `Cmd+Shift+G`)
   - Click on each file to see the diff
   - Review what you've changed

2. **Stage Files**:
   - **Stage individual files**: Click the `+` icon next to specific files
   - **Stage all files**: Click the `+` icon next to "Changes"
   - **Unstage files**: Click the `-` icon next to staged files

3. **Write a Good Commit Message**:
   ```
   Brief summary of changes (50 chars or less)
   
   More detailed explanation if needed. Wrap at 72 characters.
   Explain what and why, not how.
   
   - Use bullet points for multiple changes
   - Reference issues: Fixes #123
   ```

4. **Commit**:
   - Click the checkmark icon or press `Ctrl+Enter` / `Cmd+Enter`

5. **Push Your Changes**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Or use VS Code:
   - Click `...` in Source Control panel
   - Select "Push"

### Alternative: Using Git Extensions in VS Code

Install the "GitLens" extension for enhanced Git functionality:
1. Go to Extensions (`Ctrl+Shift+X`)
2. Search for "GitLens"
3. Click Install

GitLens provides:
- Inline blame annotations
- Rich commit details
- File history
- And much more!

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Open Source Control | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Commit | `Ctrl+Enter` | `Cmd+Enter` |
| Open Terminal | ``Ctrl+` `` | ``Cmd+` `` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |

## Commit Message Guidelines

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

**Simple commit**:
```
feat: add connection pooling for BigQuery
```

**Detailed commit**:
```
fix: resolve timeout issues in chat endpoint

The chat endpoint was timing out when processing long-running
queries. This commit adds proper timeout handling and returns
partial results when available.

Fixes #42
```

**Breaking change**:
```
feat: update OpenAI API to v4

BREAKING CHANGE: The Assistant API interface has changed.
Update your ASSISTANT_ID in the .env file to use the new format.
```

## Submitting a Pull Request

1. **Push your changes** to your fork on GitHub

2. **Create a Pull Request**:
   - Go to the original repository on GitHub
   - Click "Pull Requests" → "New Pull Request"
   - Click "compare across forks"
   - Select your fork and branch
   - Fill in the PR template with:
     - Description of changes
     - Related issue number
     - Testing performed

3. **Wait for Review**:
   - Maintainers will review your PR
   - Address any requested changes
   - Push updates to your branch (PR will update automatically)

4. **After Merge**:
   - Delete your branch
   - Update your local main branch:
     ```bash
     git checkout main
     git pull upstream main
     ```

## Code Style

- Use ES6+ features (the project uses `"type": "module"`)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting your PR:

1. Run the application:
   ```bash
   npm start
   ```

2. Test your changes manually

3. Ensure no console errors or warnings

## Questions?

If you have questions or need help:
- Open an issue on GitHub
- Check existing issues and pull requests
- Review the README.md for documentation

## Thank You!

Your contributions make this project better. We appreciate your time and effort! 🙏
