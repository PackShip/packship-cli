# Issue Naming Conventions

To maintain a consistent and organized repository, we follow these naming conventions for issues.

## Issue Title Format

```bash
<type>[optional scope]: <description>
```

### Types

- **feat**: New feature or enhancement
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style/formatting changes that don't affect code functionality
- **refactor**: Code refactoring that doesn't change functionality
- **perf**: Performance improvements
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks, dependency updates, etc.
- **security**: Security-related issues or fixes

### Scope (Optional)

The scope provides additional contextual information about which part of the codebase is affected:

- Can be a module name: `feat(cli): ...`
- Can be a component name: `fix(templates): ...`
- Can be a specific area: `docs(api): ...`
- Should be lowercase and use hyphens for multiple words: `feat(file-manager): ...`

### Description Guidelines

- Keep descriptions concise but clear (50-100 characters)
- Use imperative mood ("Add feature" not "Added feature")
- Lowercase first letter unless using proper nouns
- No period at the end

### Examples

Standard format:

- `feat: add npm package publishing automation`
- `fix: resolve template generation error on Windows`
- `docs: update README with new CLI options`
- `refactor: simplify configuration loading process`
- `perf: optimize file scanning for large directories`

With scopes for better modularization:

- `feat(cli): add support for custom template paths`
- `fix(templates): correct variable interpolation in TypeScript templates`
- `docs(api): update authentication documentation`
- `refactor(utils): extract common path normalization logic`
- `perf(file-system): optimize directory scanning algorithm`
- `chore(deps): update dependency versions`
- `test(commands): add unit tests for build command`

## Labels

In addition to the standardized titles, apply appropriate labels to categorize issues further:

- Priority labels: `priority:high`, `priority:medium`, `priority:low`
- Complexity labels: `complexity:easy`, `complexity:medium`, `complexity:hard`
- Status labels: `status:in-progress`, `status:blocked`, `status:needs-review`
- Other labels: `good-first-issue`, `help-wanted`, `discussion`

## Related Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)
