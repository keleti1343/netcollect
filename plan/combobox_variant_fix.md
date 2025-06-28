# Final Fix for Dropdown/Combobox Background Color

## Problem Description

Previous attempts to change the dropdown/combobox background color have failed because the `Button` component's default `variant` styling (`bg-primary`) is overriding the CSS variables. The correct approach is to create a new button variant that uses the desired CSS variables and apply it to the dropdown trigger.

## Step-by-Step Fix

### 1. Create a New Button Variant

Open `fortinet-web/components/ui/button.tsx` and add a new variant called `combobox` to the `buttonVariants`:

```typescript
const buttonVariants = cva(
  // ... (rest of the cva function)
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        combobox: "bg-[var(--combobox-bg)] text-[var(--combobox-text)] hover:bg-[var(--combobox-hover-bg)]",
      },
      // ... (rest of the variants)
    },
    // ... (default variants)
  }
)
```

### 2. Update Filter Components to Use the New Variant

Now, we need to update all the filter components that use a `PopoverTrigger` with a `Button` to use the new `combobox` variant. Here are the files to update:

-   `fortinet-web/app/firewalls/components/firewalls-filter.tsx`
-   `fortinet-web/app/interfaces/components/interfaces-filter.tsx`
-   `fortinet-web/app/routes/components/routes-filter.tsx`
-   `fortinet-web/app/vdoms/components/vdoms-filter.tsx`
-   `fortinet-web/app/vips/components/vips-filter.tsx`

In each of these files, find the `Button` component inside the `PopoverTrigger` and add `variant="combobox"` to it.

**Example for `firewalls-filter.tsx`:**

```tsx
// ...
<PopoverTrigger asChild>
  <Button
    variant="combobox" // <--- Add this line
    role="combobox"
    aria-expanded={open}
    className="w-[250px] justify-between"
  >
    {firewallName
      ? firewallOptions.find((option) => option.value === firewallName)?.label
      : "Select firewall..."}
    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  </Button>
</PopoverTrigger>
// ...
```

Repeat this for all the filter components listed above.

## Expected Result

After applying these changes, the dropdown/combobox buttons will correctly use the `combobox` variant, which in turn uses the CSS variables we've defined. This will finally make the dropdown background color match the sidebar background color.