# Maestro E2E — Mobile

## Setup

Maestro installed at `~/.maestro/bin/maestro`.

Add to PATH if needed:
```
export PATH="$PATH:$HOME/.maestro/bin"
```

## Run flows

```bash
# Login happy path (requires a running simulator with the app)
maestro test .maestro/login.yaml \
  -e USERNAME=your@email.com \
  -e PASSWORD=yourpassword

# Validate empty form state
maestro test .maestro/login-empty.yaml
```

## Flows

| File | What it tests |
|------|--------------|
| `login.yaml` | Login happy path → asserts "Home" tab visible |
| `login-empty.yaml` | Empty form → submit button disabled |

## Adding testIDs

When adding new flows, add `testID` props to the target elements first.
Already added: `input-username`, `input-password`, `btn-login` in `login.tsx`.

## Visual regression (when needed)

Add screenshot steps to any flow:
```yaml
- takeScreenshot: screen-name
```

Screenshots saved to `.maestro/screenshots/` by default.
