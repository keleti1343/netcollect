# Fixing the Button and Popup Box Colors

Based on the screenshot provided, we need to match:
1. The "Search" button color with the "Apply Filter" button 
2. The popup box color with the "Apply Filter" button

## Visual Observations from Screenshot

1. The "Search" button appears to have the default button styling
2. The "Apply Filter" buttons across the application use custom CSS variables for styling
3. We need to ensure visual consistency across the application by applying the same styling to the Search button and popup elements

## Solution Approach

We need to update the Search button styling and ensure the popup elements match the custom CSS variables used by the "Apply Filter" button.

## Steps to Fix

### 1. Update the Search Button in search-ips/page.tsx

The "Apply Filter" button in vdoms-filter.tsx uses custom CSS variables for styling. We need to apply the same styling to the Search button.

1. Open `fortinet-web/app/search-ips/page.tsx`
2. Find the Search button (around line 146)
3. Update the button to include the same className as the "Apply Filter" button:

```tsx
<Button 
  onClick={() => handleSearch()} 
  disabled={loading}
  className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
>
  {loading ? "Searching..." : "Search"}
</Button>
```

### 2. Ensure Consistent Popup Box Styling

The popup box needs to match the styling of the "Apply Filter" button. This involves:

1. Open `fortinet-web/app/globals.css` or your theme configuration file
2. Ensure the CSS variable `--combobox-item-hover-bg` matches `--filter-button-primary-bg`

Add or update these CSS variables in your global CSS:

```css
:root {
  /* Ensure these match for consistency */
  --combobox-item-hover-bg: var(--filter-button-primary-bg);
  --combobox-item-hover-text: var(--filter-button-primary-text);
}
```

### 3. Update CommandItem in command.tsx

We've already added the hover state to the CommandItem component, but let's ensure the colors are consistent by explicitly referencing the same CSS variables:

1. Open `fortinet-web/components/ui/command.tsx`
2. Find the CommandItem component (around line 142)
3. Ensure the className includes the appropriate variables:

```tsx
function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-[var(--filter-button-primary-bg)] data-[selected=true]:text-[var(--filter-button-primary-text)] hover:bg-[var(--filter-button-primary-bg)] hover:text-[var(--filter-button-primary-text)] focus:bg-[var(--filter-button-primary-bg)] focus:text-[var(--filter-button-primary-text)] [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}
```

This ensures that the CommandItem uses the same CSS variables as the "Apply Filter" button, creating visual consistency.

### 4. Update CSS Variables Definition

To ensure all components have access to the same styling, verify the CSS variables are properly defined:

1. Open `fortinet-web/app/globals.css` (or your main CSS file)
2. Make sure the following CSS variables are defined with consistent colors:

```css
:root {
  /* Primary filter button variables */
  --filter-button-primary-bg: #3b82f6; /* Adjust this to your brand color */
  --filter-button-primary-text: white;
  --filter-button-primary-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --filter-button-primary-hover-bg: #2563eb;
  --filter-button-primary-hover-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  /* Ensure combobox variables use the same values */
  --combobox-item-hover-bg: var(--filter-button-primary-bg);
  --combobox-item-hover-text: var(--filter-button-primary-text);
}
```

### 5. Verify Popover Component Styling

If your dropdown is using the Popover component, ensure its styling is also consistent:

1. Check `fortinet-web/components/ui/popover.tsx`
2. Ensure the Popover component styling uses variables that are consistent with the button styling

## Implementation Order

Follow these steps to implement the changes:

1. First, update the CSS variables in `globals.css` to ensure they're properly defined
2. Update the CommandItem component in `command.tsx` to use the correct variables
3. Update the Search button in `search-ips/page.tsx` to match the "Apply Filter" button styling
4. Check and update other components that might need consistent styling (Popover, Dialog, etc.)

## Verifying the Fix

After implementing the changes:

1. Run the application
2. Navigate to the Search IPs page
3. Verify that the Search button has the same styling as the Apply Filter buttons in other pages
4. Click on a dropdown to open the popup and verify that the hover and selected states match the button styling
5. Test in both light and dark modes if your application supports them

## Troubleshooting

If the colors still don't match after implementation:

1. Use browser developer tools to inspect the elements and check the applied CSS
2. Verify that the CSS variables are correctly defined and have the same values throughout the application
3. Check for any CSS specificity issues that might be overriding your styles
4. Ensure that the variables are properly scoped (global vs. component-specific)
5. Check if there are theme-specific overrides that might be affecting the styling