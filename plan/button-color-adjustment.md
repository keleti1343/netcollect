# Apply Filter Button Color Adjustment

This document provides step-by-step instructions for changing the "Apply Filter" button color to match the sidebar's color scheme but in a lighter shade.

## Color Analysis

From the screenshot, we can observe:
- The sidebar has a dark blue/navy background color (#1e1e2e or similar)
- The current "Apply Filter" button has a vibrant purple color

## Implementation Steps

### Step 1: Identify Button Component Location

The "Apply Filter" button is likely defined in one of two places:
1. In the `fortinet-web/app/interfaces/page.tsx` file (if it's specific to the interfaces page)
2. In a shared component if it's used across multiple pages

First, let's check the interfaces page to locate the button:

```bash
grep -r "Apply Filter" fortinet-web/app/
```

### Step 2: Examine Current Button Implementation

Once we locate the button, we need to understand how it's currently styled:

1. If it uses a variant of the Button component:
   ```tsx
   <Button variant="default">Apply Filter</Button>
   ```

2. If it uses a custom class:
   ```tsx
   <Button className="custom-button">Apply Filter</Button>
   ```

### Step 3: Check Theme Configuration

Next, examine the theme configuration to understand the color palette:

1. Look for the theme configuration in:
   ```
   fortinet-web/components/ui/theme.ts
   ```
   or
   ```
   fortinet-web/styles/theme.ts
   ```
   or
   ```
   fortinet-web/tailwind.config.js
   ```

2. Identify the sidebar color and create a lighter variant for the button

### Step 4: Modify Button Styling

There are two main approaches to modify the button color:

#### Option 1: Change Button Variant (if using Shadcn UI or similar library)

If the button uses a component library with variants:

1. Open the file containing the "Apply Filter" button
2. Change the button variant:
   ```tsx
   // Before
   <Button variant="default">Apply Filter</Button>
   
   // After
   <Button variant="secondary">Apply Filter</Button>
   ```

#### Option 2: Create a Custom Style

If a specific color matching the sidebar is needed:

1. Open the file containing the "Apply Filter" button
2. Add a custom class to the button:
   ```tsx
   <Button className="bg-sidebar-light hover:bg-sidebar-light/90">Apply Filter</Button>
   ```

3. Define the custom color in the tailwind.config.js:
   ```js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'sidebar': '#1e1e2e', // Actual sidebar color
           'sidebar-light': '#2d2d45', // Lighter version for the button
         },
       },
     },
   }
   ```

### Step 5: Fine-Tune the Color

You may need to adjust the exact color values to achieve the desired look:

1. For a lighter version of the sidebar color, you can:
   - Increase lightness in HSL
   - Add white/opacity in RGB
   - Use Tailwind's opacity modifiers (e.g., `bg-sidebar/80`)

2. Example of various lighter shades if sidebar is #1e1e2e:
   - #2d2d45 (slightly lighter)
   - #3c3c5c (medium lighter)
   - #4b4b73 (significantly lighter)

### Step 6: Test the Changes

After implementing the changes:

1. Run the development server:
   ```bash
   cd fortinet-web
   npm run dev
   ```

2. Navigate to the page with the "Apply Filter" button
3. Verify the button color matches the desired aesthetic
4. Test hover and active states to ensure they're also appropriate

### Step 7: Additional Considerations

For a polished UI:

1. Ensure the text color contrasts well with the new background
2. Update hover and focus states if necessary
3. Consider updating other primary buttons throughout the application for consistency

## Example Implementation

If the button is in `fortinet-web/app/interfaces/page.tsx`:

```tsx
// Before
<Button onClick={handleApplyFilter}>Apply Filter</Button>

// After (using Tailwind directly)
<Button 
  onClick={handleApplyFilter}
  className="bg-[#2d2d45] hover:bg-[#3c3c5c] text-white"
>
  Apply Filter
</Button>

// Or, after adding custom colors to tailwind.config.js
<Button 
  onClick={handleApplyFilter}
  className="bg-sidebar-light hover:bg-sidebar-light/90"
>
  Apply Filter
</Button>
```

If you'd like to implement this change, please provide the exact location of the "Apply Filter" button in your codebase, and I can provide more specific instructions.