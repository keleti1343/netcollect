# Fixing the Selected Firewall and VDOM Color to Match Combobox Hover Color

This document outlines the steps to ensure that when a firewall or VDOM is selected, the background color of the selection matches the hover background color of the combobox items.

## Problem

Currently, there's a visual inconsistency between:
- The hover background color in the combobox items
- The background color of the selected items in the filter buttons

## Solution

We'll modify the Firewall and VDOM filter buttons to use the same CSS variable (`--combobox-item-hover-bg`) that's used for the combobox item hover state. This ensures visual consistency across the UI.

## Steps to Fix

### 1. Identify the Combobox Hover Color

The combobox hover color is defined in `fortinet-web/components/ui/command.tsx` as the CSS variable `--combobox-item-hover-bg`. This variable is used for the hover state of combobox items.

### 2. Modify the Firewall Selection Button

In `fortinet-web/app/vdoms/components/vdoms-filter.tsx`, locate the Firewall selection button (around line 84):

```tsx
<Button
  variant="outline"
  role="combobox"
  aria-expanded={fwNameOpen}
  className="w-[250px] justify-between shadow-sm"
  id="fw-name-filter"
>
  {selectedFwName
    ? firewallOptions.find((option) => option.value === selectedFwName)?.label
    : "Select firewall..."}
  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Button>
```

Modify it to use conditional styling with the `cn()` utility:

```tsx
<Button
  variant="outline"
  role="combobox"
  aria-expanded={fwNameOpen}
  className={cn(
    "w-[250px] justify-between shadow-sm",
    selectedFwName && "bg-[var(--combobox-item-hover-bg)] text-accent-foreground"
  )}
  id="fw-name-filter"
>
  {selectedFwName
    ? firewallOptions.find((option) => option.value === selectedFwName)?.label
    : "Select firewall..."}
  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Button>
```

### 3. Modify the VDOM Selection Button (already done)

The VDOM selection button (around line 157) has already been updated with similar styling:

```tsx
<Button
  variant="outline"
  role="combobox"
  aria-expanded={vdomsOpen}
  className={cn(
    "w-[250px] justify-between shadow-sm",
    vdomName && "bg-[var(--combobox-item-hover-bg)] text-accent-foreground"
  )}
  id="vdom-name-filter"
>
  {isLoadingVdoms ? (
    "Loading VDOMs..."
  ) : vdomName ? (
    vdomOptions.find((option) => option.value === vdomName)?.label || vdomName
  ) : (
    "Select VDOM..."
  )}
  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Button>
```

### 4. Test and Verify

After making these changes:
1. Run the application
2. Navigate to the page with the filters
3. Select a firewall and a VDOM
4. Verify that both selected buttons now have the same background color as the hover state in the combobox items
5. Check that the text is properly contrasted with the background
6. Ensure there are no unintended side effects

## Success Criteria

- The selected firewall button has the same background color as the combobox item hover state
- The selected VDOM button has the same background color as the combobox item hover state
- Visual consistency is maintained throughout the UI