# Hover Card Scrolling Issues Fix Plan

## Issues Identified

After analyzing the hover card implementation, I've identified two main issues:

1. **Limited Scrolling Height**: The current ScrollArea is limited to 300px height, which isn't enough to show all 172 routes
2. **Mouse Wheel Scrolling Problems**: The ScrollArea component isn't properly handling mouse wheel events

## Detailed Solution

### 1. Increase ScrollArea Height

The current hover card implementation uses a fixed height that's too small:

```tsx
// Current implementation in hover-cards.tsx (line 101)
<ScrollArea className="max-h-[300px] w-full" orientation="both">
```

**Fix**: Increase the max height to at least 500px to show more content:

```tsx
<ScrollArea className="max-h-[500px] w-full" orientation="both">
```

Also increase the parent container height:

```tsx
// Line 145 in hover-cards.tsx
<div className="p-3 max-h-[500px] overflow-hidden">
  {renderContent()}
</div>
```

### 2. Fix Mouse Wheel Scrolling

The issue with mouse wheel scrolling is related to how the ScrollArea component is receiving events. We need to enhance the CSS rules in globals.css:

```css
/* Enhance these rules in globals.css */
[data-slot="scroll-area-viewport"] {
  overflow: auto !important;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  height: 100%;
  max-height: 100%;
  padding-right: 5px; /* Prevents content from touching scrollbar */
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: transparent;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 4px;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb:hover {
  background-color: var(--muted-foreground);
}
```

### 3. Implement Direct Event Handling (If CSS-only Approach Isn't Sufficient)

If the CSS changes don't fully resolve the scrolling issue, add event handlers:

```tsx
// Add to hover-cards.tsx
import { useRef } from 'react';

// In the component:
const scrollAreaRef = useRef<HTMLDivElement>(null);

const handleWheel = (e: React.WheelEvent) => {
  if (scrollAreaRef.current) {
    e.preventDefault();
    scrollAreaRef.current.scrollTop += e.deltaY;
  }
};

// Then in the render section:
<div 
  ref={scrollAreaRef} 
  onWheel={handleWheel} 
  className="p-3 max-h-[500px] overflow-auto"
>
  {renderContent()}
</div>
```

## Implementation Steps

1. **Switch to Code Mode**: This mode allows you to edit TSX files
2. **Edit hover-cards.tsx**:
   - Increase the ScrollArea height from 300px to 500px
   - Also increase the parent container height
   - If needed, implement wheel event handling
3. **Update globals.css**:
   - Enhance the ScrollArea viewport CSS rules to better support mouse wheel

## Expected Result

After implementing these changes:
- You'll be able to scroll through all 172 routes
- Mouse wheel scrolling will work smoothly
- The hover card will maintain its position while scrolling