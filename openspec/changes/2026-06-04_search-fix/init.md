# SDD Init: SearchCommand Duplicate Fix

**Change**: 2026-06-04_search-fix
**Status**: init → verify

## Problem
The sidebar had duplicate SearchCommand components after a botched integration. The `SearchCommand` import, state, effect, and JSX element were all present but conflicted with the existing search button setup. Two overlapping search dialogs rendered on click.

## Fix Applied
1. Removed `SearchCommand` import from sidebar
2. Removed `searchOpen` state and the keyboard shortcut `useEffect`
3. Removed `<SearchCommand>` JSX element (was appearing twice)
4. Search button onClick changed to no-op (`() => {}`) — CMD+K is handled globally by SearchCommand in SmartHeader

## Verify
- [ ] No `SearchCommand` references remain in `src/components/Sidebar.tsx`
- [ ] `npm run build` passes (no new errors)
- [ ] No duplicate search dialogs appear on CMD+K or button click
