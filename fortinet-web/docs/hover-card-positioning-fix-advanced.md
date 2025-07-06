# Advanced Hover Card Positioning Fix for VIPs Page

This document provides comprehensive, step-by-step instructions for properly fixing the hover card positioning issue in the VIPs page where the card appears off-screen.

## Problem Analysis

The hover card for the "VDOM NAME" column on the VIPs page is still positioning incorrectly despite initial fixes:
- The hover card appears off-screen or is cut off when triggered
- This happens specifically in the first column ("VDOM NAME") where there is limited space to the left
- Our previous fixes (changing `overflow-auto` to `overflow-visible` and using `right-0` positioning) were insufficient

## Root Causes & Comprehensive Solution

Based on thorough analysis, we need to address multiple aspects:

1. **Overflow and Stacking Context**: Table containers with `overflow-auto` clip content
2. **Positioning Strategy**: First column needs special positioning logic
3. **Viewport Constraints**: Content may exceed viewport bounds regardless of positioning
4. **Parent Positioning Context**: The CSS positioning hierarchy needs proper context
5. **Z-index Handling**: Ensuring the hover card appears above other elements

## Step-by-Step Implementation Instructions

### Step 1: Fix Table Container Overflow Handling

For both table containers in the VIPs page:

```tsx
// FROM
<div className="overflow-visible">
  <Table className="border-collapse relative">

// TO
<div className="relative overflow-visible">
  <Table className="border-collapse">
```

**Key changes:**
- Move `relative` from the table to the container
- This ensures the positioning context is at the right level

### Step 2: Implement a Repositioning Strategy for the Hover Card

Update the hover card positioning with a transform-based approach for better control:

```tsx
// FROM
<div 
  className="absolute z-[9999] hidden group-hover:block hover:block right-0 top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}
>

// TO
<div 
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{ 
    maxHeight: 'calc(80vh - 100px)', 
    overflowY: 'auto',
    left: '0',
    transform: 'translateX(-10%)'
  }}
>
```

**Key changes:**
- Use inline style for precise positioning
- Apply a transform to shift the card slightly to the left, ensuring it doesn't get cut off
- Remove `right-0` in favor of custom positioning

### Step 3: Enhance Z-index and Stacking Context

```tsx
// Update the parent cell
<TableCell className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)] z-10">
```

**Key changes:**
- Add `z-10` to ensure the cell has higher stacking context

### Step 4: Implement a Viewport-Aware Positioning Function

Add a custom hook that adjusts positioning based on viewport:

1. Create a new file at `fortinet-web/hooks/use-hover-position.ts`:

```typescript
import { useEffect, useRef, useState } from 'react';

interface Position {
  left?: string;
  right?: string;
  transform?: string;
}

export function useHoverPosition() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({});

  useEffect(() => {
    function updatePosition() {
      if (!triggerRef.current || !contentRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Calculate how much space we have on left and right
      const spaceOnLeft = triggerRect.left;
      const spaceOnRight = viewportWidth - triggerRect.right;
      
      // Determine the best position
      if (spaceOnRight >= contentRect.width) {
        // Enough space on right
        setPosition({ left: '0', transform: 'translateX(0)' });
      } else if (spaceOnLeft >= contentRect.width) {
        // Enough space on left
        setPosition({ right: '0', transform: 'translateX(0)' });
      } else {
        // Not enough space on either side, center it
        setPosition({ left: '0', transform: 'translateX(-25%)' });
      }
    }
    
    // Update on mount and window resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);
  
  return { triggerRef, contentRef, position };
}
```

2. Update the VIPs page to use this hook:

```tsx
import { useHoverPosition } from '@/hooks/use-hover-position';

// Inside your component:
const { triggerRef, contentRef, position } = useHoverPosition();

// In your JSX:
<TableCell className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)] z-10">
  <div ref={triggerRef}>
    <TableCode>
      {vip.vdom.vdom_name}
    </TableCode>
  </div>
  {/* Invisible bridge area to maintain hover state */}
  <div className="absolute z-[9998] hidden group-hover:block left-0 right-0 top-full h-2 bg-transparent"></div>
  <div 
    ref={contentRef}
    className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
    style={{ 
      maxHeight: 'calc(80vh - 100px)', 
      overflowY: 'auto',
      ...position
    }}
  >
    {/* Hover card content */}
  </div>
</TableCell>
```

### Step 5: Simpler Alternative (if custom hook is too complex)

If implementing the custom hook is too complex, use this simpler approach:

```tsx
<div 
  className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{ 
    maxHeight: 'calc(80vh - 100px)', 
    overflowY: 'auto',
    left: '0',
    transform: 'translateX(-25%)' 
  }}
>
```

This applies a 25% leftward shift to ensure the card doesn't go off-screen.

### Step 6: Ensure Full Visibility by Adding Viewport Protection

Add this to the main layout to ensure hover cards are never clipped:

```css
/* In globals.css or equivalent */
.table-container {
  position: relative;
  overflow: visible !important;
}

/* Add this to prevent horizontal scrolling while still showing the popover */
.card-content {
  overflow-x: auto;
  overflow-y: visible !important;
}
```

Apply these classes to all relevant containers.

## Complete Implementation Example

Here's a complete implementation for the VIPs page:

```tsx
// In fortinet-web/app/vips/page.tsx

// Table container:
<CardContent className="p-0 card-content">
  <div className="relative table-container">
    <Table className="border-collapse">
      {/* Table content */}
    </Table>
  </div>
</CardContent>

// Hover card:
<TableCell className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)] z-10">
  <TableCode>
    {vip.vdom.vdom_name}
  </TableCode>
  {/* Invisible bridge area to maintain hover state */}
  <div className="absolute z-[9998] hidden group-hover:block left-0 right-0 top-full h-2 bg-transparent"></div>
  <div 
    className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
    style={{ 
      maxHeight: 'calc(80vh - 100px)', 
      overflowY: 'auto',
      left: '0',
      transform: 'translateX(-25%)' 
    }}
  >
    {/* Hover card content */}
  </div>
</TableCell>
```

## Testing the Solution

After implementing these changes, test the hover card in these scenarios:

1. **Small screen (mobile)**: Verify the card appears properly on small viewports
2. **First column**: Ensure the "VDOM NAME" column hover card appears fully visible
3. **Edge cases**: Test with very long content in the hover card
4. **Different browsers**: Test in Chrome, Firefox, and Safari if possible
5. **Responsive testing**: Verify it works at various viewport widths

## Troubleshooting Guide

If the hover card is still positioned incorrectly:

1. **Check z-index**: Ensure no other elements have higher z-index values that might overlap
2. **Verify overflow**: Make sure all parent containers have `overflow: visible`
3. **Adjust transform**: Try different values for `translateX`, like `-30%` or `-20%`
4. **Browser dev tools**: Use browser developer tools to inspect the element positioning
5. **Container width**: Ensure the card width is not too large for small screens

## Advanced Alternatives

For the most robust solution, consider using a positioning library:

1. **Floating UI/Popper.js**: These libraries handle edge cases automatically
2. **Radix UI Popover**: A ready-made solution with proper positioning
3. **Headless UI Popover**: Another accessible alternative

Example with Floating UI:
```tsx
// npm install @floating-ui/react-dom

import { useFloating, shift, flip, offset } from '@floating-ui/react-dom';

// In your component:
const { x, y, strategy, refs } = useFloating({
  placement: 'bottom-start',
  middleware: [offset(10), flip(), shift({ padding: 10 })]
});

// In JSX:
<div ref={refs.setReference}>Trigger element</div>
<div
  ref={refs.setFloating}
  style={{
    position: strategy,
    top: y ?? 0,
    left: x ?? 0,
  }}
>
  Hover card content
</div>