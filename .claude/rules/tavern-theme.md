---
description: 'Tavern theme design constraints for TaskCooker Web'
globs:
  - 'src/ui/**'
  - 'src/features/**/components/**'
---

Full details: @docs/tavern-theme.md

## Two Themes

- `tavern-light`: daytime cafe (generic light base)
- `tavern-dark`: nighttime beer bar (brownish palette)
- Switch via `[data-theme]` attribute. Keep `prefers-color-scheme` as initial fallback only

## Invariants

- Status colors (order/prep/cook/serve) are theme-invariant — do not change per theme
- `docs/color-system.md` is user reference only — do not overwrite

## NG List

- No emoji in UI
- No puffy rounded corners (角丸もこもこ)
- No warm flat solid fills (暖色ベタ塗り)
- No hiding completed tasks
- No type definition changes for theming
- CSS layer only — never change status logic or type definitions for theme purposes
