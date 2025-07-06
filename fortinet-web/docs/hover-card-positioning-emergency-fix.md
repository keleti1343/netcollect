# Hover Card Positioning - Emergency Fix

## Problem
The hover card for "VDOM NAME" column in VIPs page continues to appear off-screen despite multiple positioning attempts.

## Root Cause
The issue was caused by multiple factors:
1. **Container Overflow Clipping**: Card containers were not allowing overflow, clipping the hover card
2. **Insufficient Positioning Shift**: Previous positioning attempts weren't aggressive enough
3. **Viewport Boundary Issues**: The hover card was still extending beyond the right edge of the viewport

## Emergency Solution Implemented

### Step 1: Enable Overflow on All Containers
**File**: `fortinet-web/app/vips/page.tsx`

**Lines 242-247** - Main Card Container:
```tsx
<Card
  className="border shadow-sm overflow-visible"  // Added overflow-visible
  style={{
    borderColor: 'rgba(26, 32, 53, 0.15)'
  }}
>
```

**Lines 264-265** - Card Content Container:
```tsx
<CardContent className="p-0 overflow-visible">  // Added overflow-visible
  <div className="relative overflow-visible">
```

### Step 2: Left-Side Positioning
**File**: `fortinet-web/app/vips/page.tsx` (Lines 296-304)

**New Positioning Strategy**:
```tsx
<div
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{
    maxHeight: 'calc(80vh - 100px)',
    overflowY: 'auto',
    right: '100%',        // Position to the left of the cell
    marginRight: '8px'    // Add small gap between cell and card
  }}
>
```

## How This Solution Works

### Positioning Logic
1. **`right: '100%'`**: Positions the hover card's right edge at the left edge of the table cell
2. **`marginRight: '8px'`**: Creates a small 8px gap between the cell and the hover card
3. **Result**: The hover card appears entirely to the left of the VDOM NAME cell

### Visual Representation
```
Hover Card:  [--------Card Content--------]    [VDOM NAME Cell]
                                         ↑    ↑
                                      8px gap  Cell starts here
```

### Container Overflow Chain
```
Main Card (overflow-visible)
  └── CardContent (overflow-visible)
      └── Table Container (overflow-visible)
          └── TableCell (relative positioning)
              └── Hover Card (absolute positioning to the left)
```

## Benefits of This Approach

1. **Guaranteed Visibility**: Card appears to the left, never extending beyond right viewport edge
2. **No Clipping**: All containers allow overflow, preventing any clipping issues
3. **Consistent Positioning**: Works regardless of viewport size or table position
4. **Maintains Functionality**: Preserves hover state, scrolling, and responsive design
5. **Clean Visual Separation**: 8px margin provides clear visual separation

## Testing Verification

After implementing this solution, verify:
- [ ] Hover card appears fully visible to the left of VDOM NAME cells
- [ ] No clipping occurs at any viewport size
- [ ] Hover state is maintained when moving cursor over the card
- [ ] Card content scrolls properly when needed
- [ ] Visual gap between cell and card looks appropriate
- [ ] Works on mobile, tablet, and desktop viewports

## Fallback Options

If this solution still doesn't work, consider:

### Option 1: Modal Approach
Convert hover cards to click-triggered modals that appear centered on screen.

### Option 2: Tooltip Library
Implement a dedicated tooltip/popover library like Floating UI or Radix UI Tooltip.

### Option 3: Dynamic Positioning
Implement JavaScript-based positioning that detects viewport boundaries and adjusts accordingly.

## Technical Notes

- The `right: '100%'` positioning is more reliable than transform-based approaches
- Container overflow settings are crucial for absolute positioned elements
- The 8px margin prevents the card from touching the cell edge
- Z-index hierarchy ensures proper stacking above table elements

## Files Modified

1. `fortinet-web/app/vips/page.tsx` - Main implementation
   - Line 242: Added `overflow-visible` to main Card
   - Line 264: Added `overflow-visible` to CardContent  
   - Lines 296-304: Updated hover card positioning to left-side approach

This solution takes a more aggressive approach by positioning the hover card entirely to the left of the cell, ensuring it never conflicts with viewport boundaries while maintaining all existing functionality.