# VdomsFilter Component Implementation Plan

## Requirements

1. Modify the `VdomsFilter` component to only display VDOMs for the selected firewall
2. Ensure the firewall name is displayed under the firewall column (already implemented)
3. Disable the VDOM dropdown until a firewall is selected
4. Fetch VDOMs immediately when a firewall is selected
5. Keep the "Apply Filter" button behavior

## Implementation Steps

### 1. Import Required Functions and Types

```typescript
// Add getVdoms import
import { getFirewalls, getVdoms } from "@/services/api"
import { FirewallResponse, VDOMResponse } from "@/types"
```

### 2. Add State for VDOMs

```typescript
// Add state for VDOMs
const [vdomsOpen, setVdomsOpen] = React.useState(false);
const [vdomOptions, setVdomOptions] = React.useState<{ label: string; value: string }[]>([]);
const [isLoadingVdoms, setIsLoadingVdoms] = React.useState(false);
```

### 3. Modify Firewall Selection Handler

```typescript
// Modify the firewall selection handler to fetch VDOMs
const handleFirewallSelect = async (currentValue: string) => {
  const newValue = currentValue === selectedFwName ? "" : currentValue;
  setSelectedFwName(newValue);
  setFwNameOpen(false);
  
  // Reset VDOM selection when firewall changes
  setVdomName("");
  
  if (newValue) {
    // Fetch VDOMs for the selected firewall
    setIsLoadingVdoms(true);
    try {
      const vdomsResponse = await getVdoms({ fw_name: newValue });
      const vdoms = vdomsResponse.items;
      setVdomOptions(vdoms.map((vdom: VDOMResponse) => ({
        label: vdom.vdom_name,
        value: vdom.vdom_name,
      })));
    } catch (error) {
      console.error("Failed to fetch VDOMs:", error);
      setVdomOptions([]);
    } finally {
      setIsLoadingVdoms(false);
    }
  } else {
    // Clear VDOM options when no firewall is selected
    setVdomOptions([]);
  }
};
```

### 4. Replace VDOM Input with Dropdown

Replace the current VDOM input field with a dropdown similar to the firewall dropdown:

```typescript
<div className="grid gap-2">
  <Label htmlFor="vdom-name-filter">VDOM Name</Label>
  <Popover open={vdomsOpen} onOpenChange={setVdomsOpen} disabled={!selectedFwName}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={vdomsOpen}
        className="w-[250px] justify-between"
        id="vdom-name-filter"
        disabled={!selectedFwName || isLoadingVdoms}
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
    </PopoverTrigger>
    <PopoverContent className="w-[250px] p-0">
      <Command>
        <CommandInput placeholder="Search VDOM..." />
        <CommandList>
          <CommandEmpty>No VDOM found.</CommandEmpty>
          <CommandGroup>
            {vdomOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  setVdomName(currentValue === vdomName ? "" : currentValue);
                  setVdomsOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    vdomName === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>
```

### 5. Update Firewall Selection Handler in CommandItem

```typescript
<CommandItem
  key={option.value}
  value={option.value}
  onSelect={handleFirewallSelect}
>
  <Check
    className={cn(
      "mr-2 h-4 w-4",
      selectedFwName === option.value ? "opacity-100" : "opacity-0"
    )}
  />
  {option.label}
</CommandItem>
```

## Complete Implementation

The complete implementation will:

1. Import the necessary functions and types
2. Add state for VDOMs and loading state
3. Implement the firewall selection handler to fetch VDOMs
4. Replace the VDOM input with a dropdown
5. Disable the VDOM dropdown until a firewall is selected
6. Keep the existing "Apply Filter" button behavior

This implementation ensures that:
- The VDOM dropdown is disabled until a firewall is selected
- VDOMs are fetched immediately when a firewall is selected
- The filter is only applied when the "Apply Filter" button is clicked
- The firewall name is displayed in the firewall column (already implemented in the page component)