# Hover Card Visibility Fix - VDOM NAME Column

## Problem
The hover card for the "VDOM NAME" column in the VIPs page is currently not visible after recent positioning changes. Previous attempts to fix the positioning issue resulted in the hover card becoming completely invisible.

## Root Cause Analysis
The current implementation has the following issues:
1. **Too Aggressive Positioning**: The `right: '100%'` positioning moved the hover card completely off-screen to the left
2. **Improper Hover Visibility**: The current positioning doesn't respect the viewport boundaries

## Step-by-Step Solution

### Step 1: Fix the Hover Card Positioning
**File**: `fortinet-web/app/vips/page.tsx` (Lines 296-304)

**Current Code (Not Working)**:
```tsx
<div
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
    right: '100%',
    marginRight: '8px'
  }}
>
```

**Fix to Implement**:
```tsx
<div
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
    left: '0',
    transform: 'translateX(-30%)'
  }}
>
```

**Changes Explained**:
1. Replace `right: '100%'` and `marginRight: '8px'` with a more balanced approach
2. Use `left: '0'` to anchor to the left edge of the cell
3. Apply a moderate `translateX(-30%)` to shift slightly left while keeping most content visible

### Step 2: Ensure All Container Overflows are Properly Set
Verify that all parent containers have `overflow-visible` to prevent clipping:

**File**: `fortinet-web/app/vips/page.tsx`

Ensure these elements have overflow-visible:

1. **Main Card Container** (around line 242):
```tsx
<Card
  className="border shadow-sm overflow-visible"
  style={{
    borderColor: 'rgba(26, 32, 53, 0.15)'
  }}
>
```

2. **Card Content** (around line 264):
```tsx
<CardContent className="p-0 overflow-visible">
```

3. **Table Container** (around line 265):
```tsx
<div className="relative overflow-visible">
```

### Step 3: Add a Debug Element to Verify Positioning (Temporary)
To help debug positioning issues, add this temporary element that will be visible when hovering:

**File**: `fortinet-web/app/vips/page.tsx` (insert after line 304)

```tsx
{/* Debug element - remove after fixing */}
<div className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full"></div>
```

## Alternative Solution (If Above Doesn't Work)

If the above solution still doesn't properly display the hover card, implement this more robust approach:

```tsx
<div
  className="absolute z-[9999] hidden group-hover:block hover:block mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
    width: '300px',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '100%'
  }}
>
```

**Key Changes**:
1. Fixed width of 300px regardless of screen size
2. Centered positioning with `left: '50%'` and `transform: 'translateX(-50%)'`
3. This ensures the card is always centered relative to the cell, preventing edge cases

## Progressive Enhancement: Viewport-Aware Positioning

For a more advanced solution, implement this JavaScript-based approach that checks viewport boundaries:

```tsx
<div
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
    // Dynamic positioning based on viewport
    ...(typeof window !== 'undefined' && {
      left: '0',
      transform: `translateX(${
        // Get cell position relative to viewport
        document.querySelector('.your-table-cell-selector')?.getBoundingClientRect().left < window.innerWidth / 2 
          ? '0' // If on left half of screen, don't shift
          : '-50%' // If on right half, shift left
      })`
    })
  }}
>
```

## Testing Procedure

After implementing the fix:

1. Navigate to the VIPs page
2. Hover over a VDOM NAME cell
3. Verify the hover card appears and is fully visible
4. Test on different screen sizes (mobile, tablet, desktop)
5. Verify the hover card doesn't extend beyond any viewport edge
6. Check that content is scrollable when it exceeds the maximum height

## Debugging Tips

If issues persist:

1. **Inspect Element**: Use browser dev tools to inspect the hover card
2. **Check z-index**: Ensure z-index is high enough (9999)
3. **Verify Event Triggers**: Confirm hover events are firing correctly
4. **Container Hierarchy**: Check all parent containers for overflow issues
5. **CSS Specificity**: Ensure no other styles are overriding the position

## Cross-Browser Compatibility

The solution should work across all modern browsers. Pay special attention to:
- Mobile Safari (iOS)
- Chrome on Android
- Firefox
- Edge

## Documentation Update

After confirming the fix works, update the following documents:
- `fortinet-web/docs/hover-card-positioning-fix.md`
- `fortinet-web/docs/hover-card-positioning-fix-advanced.md`
- `fortinet-web/docs/hover-card-positioning-emergency-fix.md`

## Related Components

This fix may need to be applied to similar hover cards in:
- Policies page
- Interfaces page
- Routes page

## Solution Breakdown Diagram

```
┌─────────────────────────────────┐
│          Viewport               │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Table             │    │
│  │                         │    │
│  │  ┌───────┐              │    │
│  │  │ VDOM  │              │    │
│  │  │ NAME  │              │    │
│  │  └───────┘              │    │
│  │      │                  │    │
│  │      ▼                  │    │
│  │  ┌───────────────────┐  │    │
│  │  │                   │  │    │
│  │  │   Hover Card      │  │    │
│  │  │                   │  │    │
│  │  │ • Left: 0         │  │    │
│  │  │ • TranslateX(-30%)│  │    │
│  │  │                   │  │    │
│  │  └───────────────────┘  │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘