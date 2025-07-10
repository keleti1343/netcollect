# Hover Card Scrolling Fix: Step-by-Step Instructions

## Problem Analysis

The current implementation of hover cards in the Fortinet web application has two critical issues:

1. **Limited Content Display**: Users cannot see all 172 routes when viewing route data
2. **Mouse Wheel Scrolling Not Working**: Scrolling requires using the scrollbar instead of the mouse wheel

After careful analysis of the code, the following root causes have been identified:

- **Nested Scrollable Areas**: Multiple scrollable containers with conflicting behaviors
- **Event Propagation Issues**: Mouse wheel events not being properly handled
- **CSS Configuration Problems**: Insufficient styling for proper scrolling experience
- **Container Height Limitations**: Inadequate height allocation for large datasets

## Step-by-Step Solution

### 1. Fix the Component Structure

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// CHANGE FROM:
<div className="p-3 max-h-[500px] overflow-auto" onWheel={handleWheel}>
  {renderContent()}
</div>

// TO:
<div className="p-3">
  {renderContent()}
</div>
```

This removes the redundant outer scrollable container, eliminating the conflict between two scrollable areas.

### 2. Improve the ScrollArea Configuration

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// CHANGE FROM:
<ScrollArea className="max-h-[500px] w-full" orientation="both">
  <ul className="text-xs text-muted-foreground pl-4 space-y-1">
    {/* Content */}
  </ul>
</ScrollArea>

// TO:
<ScrollArea 
  className="max-h-[500px] w-full pr-4" 
  orientation="vertical"
  ref={scrollAreaRef}
>
  <div className="hover-card-content">
    <ul className="text-xs text-muted-foreground pl-4 pr-2 space-y-1">
      {/* Content */}
    </ul>
  </div>
</ScrollArea>
```

This makes several important changes:
- Changes orientation from "both" to "vertical" since horizontal scrolling isn't needed
- Adds right padding to prevent content from touching the scrollbar
- Adds a ref for programmatic scroll control if needed
- Wraps the list in a div with a specific class for targeted CSS styling
- Adds right padding to the list for better spacing

### 3. Remove the Wheel Event Handler

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// REMOVE this function:
const handleWheel = (e: React.WheelEvent) => {
  // Allow the ScrollArea to handle wheel events naturally
  e.stopPropagation();
};

// And REMOVE the onWheel attribute from the div
```

The wheel event handler is unnecessary when using a properly configured ScrollArea component, and might actually be interfering with natural scrolling behavior.

### 4. Enhance the CSS for Better Scrolling

**File**: `fortinet-web/app/globals.css`

Add these comprehensive styles:

```css
/* ScrollArea improvements for hover cards */
.hover-card-content {
  padding-right: 4px;
}

[data-slot="scroll-area-viewport"] {
  overflow-y: auto !important;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  padding-right: 4px;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar {
  width: 8px;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar-track {
  background: transparent;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

[data-slot="scroll-area-viewport"]::-webkit-scrollbar-thumb:hover {
  background-color: var(--muted-foreground);
}

/* Fix for Safari */
@supports (-webkit-overflow-scrolling: touch) {
  [data-slot="scroll-area-viewport"] {
    -webkit-overflow-scrolling: touch;
  }
}
```

These styles ensure proper scrolling behavior across all browsers, with particular attention to:
- Ensuring overflow-y is always enabled for vertical scrolling
- Adding smooth scroll behavior
- Creating a thin, attractive scrollbar
- Adding proper padding to prevent content from touching the scrollbar
- Ensuring touch scrolling works on Safari

### 5. Increase the Overall Card Height

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// CHANGE FROM:
<div className="absolute z-[9999] hidden group-hover:block left-0 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">

// TO:
<div className="absolute z-[9999] hidden group-hover:block left-0 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={{ maxHeight: 'calc(80vh - 100px)' }}>
```

This dynamically sets the maximum height of the entire card to 80% of the viewport height minus 100px, allowing it to scale appropriately on different screen sizes while ensuring it doesn't get too large.

### 6. Fix the ScrollArea Height for Large Data Sets

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// CHANGE FROM:
<ScrollArea className="max-h-[500px] w-full pr-4" orientation="vertical" ref={scrollAreaRef}>

// TO:
<ScrollArea 
  className={`w-full pr-4 ${data.length > 50 ? 'max-h-[60vh]' : 'max-h-[500px]'}`} 
  orientation="vertical" 
  ref={scrollAreaRef}
>
```

This makes the ScrollArea's height responsive to the amount of data:
- For large datasets (more than 50 items), use 60% of viewport height
- For smaller datasets, maintain the 500px height

### 7. Add a Loading Indicator That Doesn't Jump

**File**: `fortinet-web/app/vdoms/components/hover-cards.tsx`

```tsx
// CHANGE FROM:
if (loading) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="text-xs text-muted-foreground">Loading...</div>
    </div>
  );
}

// TO:
if (loading) {
  return (
    <div className="flex items-center justify-center py-4 min-h-[200px]">
      <div className="text-xs text-muted-foreground">Loading...</div>
    </div>
  );
}
```

Adding a minimum height to the loading container prevents layout shifts when data loads.

## Testing Instructions

After implementing these changes, test thoroughly:

1. **Route Display Test**:
   - Navigate to a VDOM with many routes (aim for one with 172+ routes)
   - Hover over the routes count
   - Verify all routes are accessible by scrolling

2. **Mouse Wheel Test**:
   - Hover over the routes data
   - Use the mouse wheel to scroll
   - Verify smooth scrolling without having to use the scrollbar

3. **Visual Inspection**:
   - Check that the scrollbar appears correctly
   - Verify the hover card doesn't become too large on small screens
   - Ensure content doesn't touch the scrollbar

4. **Browser Compatibility**:
   - Test in Chrome, Firefox, and Safari if possible
   - Verify scrolling works in all browsers

## Complete Code Changes Summary

This solution addresses both issues by:

1. **Eliminating nested scrollable containers**: Removing redundant scrollable areas
2. **Focusing scrolling in the ScrollArea component**: Using the component as intended
3. **Enhancing CSS for better scrolling**: Adding proper styles for all browsers
4. **Making the component height responsive**: Adapting to both screen size and data amount
5. **Fixing mouse wheel behavior**: Removing interfering event handlers
6. **Preventing layout shifts**: Adding minimum heights to loading states

These changes ensure users can access all routes and use the mouse wheel for scrolling, while maintaining a clean and responsive design.