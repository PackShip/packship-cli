# Branch Naming Conventions

To maintain consistency and traceability between issues, commits, and branches, we follow these branch naming conventions.

## Branch Name Format

```bash
<type>[/<optional-scope>]/<issue-number>-<short-description>
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

- Can be a module name: `feat/cli/123-...`
- Can be a component name: `fix/templates/456-...`
- Can be a specific area: `docs/api/789-...`
- Should be lowercase and use hyphens for multiple words: `feat/file-manager/123-...`

### Issue Number

- Include the issue number to link the branch directly to its corresponding issue
- If no issue exists, consider creating one first
  
### Short Description

- Use hyphens to separate words
- Keep it brief but descriptive (2-4 words)
- Use lowercase letters only
- No special characters except hyphens

### Examples

Standard format:

- `feat/123-npm-publish-automation`
- `fix/456-windows-template-error`
- `docs/789-update-cli-docs`
- `refactor/101-config-loading`
- `perf/202-file-scanning-optimization`

With scopes for better modularization:

- `feat/cli/123-custom-template-paths`
- `fix/templates/456-typescript-interpolation`
- `docs/api/789-auth-docs-update`
- `refactor/utils/101-path-normalization`
- `perf/file-system/202-scanning-optimization`
- `chore/deps/303-update-versions`
- `test/commands/404-build-tests`

## Special Branches

- Main development branch: `main` or `master`
- Development branch: `develop`
- Release branches: `release/v1.2.3`
- Hotfix branches: `hotfix/v1.2.4`

## Git Workflow

1. Create a new branch from `develop` using the naming convention
2. Make changes and commit using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
3. Submit a pull request back to `develop`
4. After review and approval, merge the branch
5. Delete the branch after merging

## Related Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)
- [Issue Naming Convention](./ISSUE_NAMING_CONVENTION.md)
