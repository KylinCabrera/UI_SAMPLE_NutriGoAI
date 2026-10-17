---
name: Clerk React version alignment
description: Runtime compatibility lesson when adding Clerk to this pnpm React workspace.
---

Keep the resolved `react` and `react-dom` versions exactly aligned after adding Clerk dependencies. A successful TypeScript check does not guarantee the preview will load if the runtime versions differ.

**Why:** The pnpm lockfile can retain an older peer-dependency variant, resulting in a runtime React mismatch despite the package manifest appearing updated.

**How to apply:** Confirm the installed versions match after dependency changes, not only the declared version ranges.
