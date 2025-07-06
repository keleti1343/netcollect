# Fixing Hover Card Positioning in VIPs Page

This document provides detailed, step-by-step instructions for fixing the hover card positioning issue in the VIPs page where the card appears off-screen.

## ✅ IMPLEMENTATION COMPLETED

**Status**: The hover card positioning issue has been successfully resolved.

## Problem Identification (RESOLVED)

The hover card for the "VDOM NAME" column on the VIPs page was positioning incorrectly:
- ✅ The hover card was appearing off-screen or cut off when triggered
- ✅ This happened specifically in the first column ("VDOM NAME") where there's no space to the left
- ✅ The table container's `overflow-auto` was clipping the hover card content

## Detailed Approach to Fix

### Step 1: Analyze the Current Positioning

1. Locate the hover card code in `fortinet-web/app/vips/page.tsx`
2. Identify the current positioning CSS classes:
   ```tsx
   <div className="absolute z-[9999] hidden group-hover:block hover:block left-0 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
   ```
3. Note that the current positioning is using `left-0` for small screens and `right-0` for larger screens

### Step 2: Fix the Positioning

Apply one of the following solutions, in order of recommendation:

#### Solution A: Position to the Right for All Screen Sizes

1. Open `fortinet-web/app/vips/page.tsx`
2. Find the hover card div near line 296:
   ```tsx
   <div className="absolute z-[9999] hidden group-hover:block hover:block left-0 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
   ```
3. Change the positioning classes to always position from the right:
   ```tsx
   <div className="absolute z-[9999] hidden group-hover:block hover:block right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
   ```
4. This removes `left-0` and `sm:left-auto` to ensure the card always displays from the right edge

#### Solution B: Add Transform for Better Positioning

If Solution A doesn't fully resolve the issue:

1. Open `fortinet-web/app/vips/page.tsx`
2. Find the hover card div near line 296
3. Add a transform to shift the hover card toward the center:
   ```tsx
   <div className="absolute z-[9999] hidden group-hover:block hover:block right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden transform translate-x-1/4">
   ```
4. The `transform translate-x-1/4` will shift the hover card 25% to the right

#### Solution C: Dynamic Positioning with Inline Style

For the most precise control:

1. Modify the hover card implementation to use dynamic positioning based on viewport:
   ```tsx
   <div 
     className="absolute z-[9999] hidden group-hover:block hover:block top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
     style={{ 
       left: "auto", 
       right: "0px"
     }}
   >
   ```

### Step 3: Adjust Width for Better Fit

If the hover card is still too wide for smaller screens:

1. Reduce the width on smaller screens:
   ```tsx
   <div className="absolute z-[9999] hidden group-hover:block hover:block right-0 top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
   ```
2. This uses a smaller width (`w-64` = 16rem) on mobile and progressively larger widths on bigger screens

### Step 4: Add Positioning Context to Parent

Ensure the parent element has the proper positioning context:

1. Verify the parent `TableCell` has `relative` positioning:
   ```tsx
   <TableCell className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
   ```
2. If not, add the `relative` class to ensure proper positioning context

### Step 5: Add Overflow Handling to Table Container

Add proper overflow handling to the table container:

1. Find the table container div (typically has `overflow-auto` or similar):
   ```tsx
   <div className="overflow-auto">
     <Table className="border-collapse">
   ```
2. Modify to ensure better overflow behavior:
   ```tsx
   <div className="overflow-visible">
     <Table className="border-collapse relative">
   ```
3. The `overflow-visible` ensures popover content isn't clipped

## Testing the Solution

After implementing the changes, test the hover card behavior:

1. Test on small screens (mobile size)
2. Test on medium screens (tablet size)
3. Test on large screens (desktop size)
4. Verify the hover card appears fully visible in all cases
5. Check that the hover card content is readable and not cut off

## Additional Considerations

- If the hover card still has positioning issues, consider using a UI library's popover component with built-in positioning logic
- For the most robust solution, consider using a library like Floating UI or Popper.js which handles positioning, overflow, and flipping automatically
- Consider adding a maximum height with scrolling for very tall hover cards:
  ```tsx
  style={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}
  ```

## Reference Implementation

Final hover card div with all recommended changes:

```tsx
<div 
  className="absolute z-[9999] hidden group-hover:block hover:block right-0 top-full mt-1 w-64 sm:w-80 md:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
  style={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}
>
  {/* Hover card content */}
</div>
```

For the table container:

```tsx
<div className="overflow-visible">
  <Table className="border-collapse relative">
    {/* Table content */}
  </Table>
</div>