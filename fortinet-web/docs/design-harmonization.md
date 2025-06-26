# Design Harmonization Plan

This document outlines the implementation plan for harmonizing key design elements across the Fortinet Network Visualizer application to ensure a consistent user experience.

## 1. Table Cell Typography Standardization

### Current Issues
- Inconsistent font weights across table cells
- Varying text sizes and styles for similar content types
- Inconsistent styling of code elements in tables
- No clear typographic hierarchy within tables

### Implementation Plan

#### 1.1 Define Table Typography Variables in CSS

Add the following CSS variables to `fortinet-web/app/globals.css`:

```css
:root {
  /* Table typography */
  --table-header-font-size: 0.75rem; /* 12px */
  --table-header-font-weight: 500;
  --table-header-letter-spacing: 0.05em;
  --table-header-text-transform: uppercase;
  
  --table-cell-font-size: 0.875rem; /* 14px */
  --table-cell-line-height: 1.25rem; /* 20px */
  
  --table-code-font-size: 0.875rem; /* 14px */
  --table-code-bg: var(--muted);
  --table-code-padding-x: 0.5rem;
  --table-code-padding-y: 0.25rem;
  --table-code-border-radius: 0.25rem;
  
  /* Light theme */
  --table-row-hover-bg: oklch(0.95 0.01 0 / 20%);
  --table-header-bg: oklch(0.95 0.01 0 / 50%);
  
  /* Dark theme equivalents will be defined in .dark {} */
}

.dark {
  /* ... existing dark theme variables ... */
  
  /* Table typography - dark theme */
  --table-row-hover-bg: oklch(1 0 0 / 5%);
  --table-header-bg: oklch(0.25 0.02 265 / 50%);
}
```

#### 1.2 Update Table Component Base Styles

Modify `fortinet-web/components/ui/table.tsx` to use these variables:

```tsx
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-[var(--table-header-bg)] [&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-[var(--table-row-hover-bg)] transition-colors border-b border-border",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-[var(--table-header-font-size)] font-[var(--table-header-font-weight)] tracking-[var(--table-header-letter-spacing)] text-transform-[var(--table-header-text-transform)] text-muted-foreground py-3 px-4 text-left align-middle",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "text-[var(--table-cell-font-size)] leading-[var(--table-cell-line-height)] p-4 align-middle",
        className
      )}
      {...props}
    />
  );
}
```

#### 1.3 Create Standardized Code Component for Tables

Create a new component for consistent code displays in tables:

```tsx
// fortinet-web/components/ui/table-code.tsx
import { cn } from "@/lib/utils";

interface TableCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCode({ children, className }: TableCodeProps) {
  return (
    <code
      className={cn(
        "px-[var(--table-code-padding-x)] py-[var(--table-code-padding-y)] bg-[var(--table-code-bg)] rounded-[var(--table-code-border-radius)] text-[var(--table-code-font-size)] font-mono",
        className
      )}
    >
      {children}
    </code>
  );
}
```

#### 1.4 Implementation Guidelines for Tables

1. **Table Headers**:
   - Use the default `TableHead` component without custom class overrides
   - Keep text uppercase, consistent font weight, and tracking

2. **Standard Cells**:
   - Regular text: Use default `TableCell` without additional classes
   - Primary identifier cells: Add `className="font-medium"` to emphasize
   
3. **Code/IP Addresses**:
   - Replace all instances of inline `<code>` with `<TableCode>`
   - Example: `<TableCode>{iface.ip_address}</TableCode>`

4. **Empty/Placeholder Values**:
   - Use consistent placeholder for empty values: `{value || '-'}`

## 2. Hover Card Styling Improvements

### Current Issues
- Inconsistent sizing across different hover cards
- Varying padding and border styles
- Inconsistent header styling
- Trigger elements have different hover behaviors

### Implementation Plan

#### 2.1 Define Hover Card Variables in CSS

Add the following to `fortinet-web/app/globals.css`:

```css
:root {
  /* Hover card */
  --hover-card-width: 20rem; /* 320px */
  --hover-card-border-radius: var(--radius);
  --hover-card-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  --hover-card-header-bg: var(--muted);
  --hover-card-header-padding: 0.75rem 1rem;
  --hover-card-header-border: 1px solid var(--border);
  
  --hover-card-content-padding: 1rem;
  --hover-card-content-bg: var(--card);
  
  --hover-trigger-transition: all 0.2s ease;
  --hover-trigger-bg-hover: var(--primary-foreground);
  --hover-trigger-transform-hover: translateY(-1px);
}
```

#### 2.2 Update Hover Card Component

Modify `fortinet-web/components/ui/hover-card.tsx`:

```tsx
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-[var(--hover-card-width)] rounded-[var(--hover-card-border-radius)] border border-border bg-[var(--hover-card-content-bg)] shadow-[var(--hover-card-shadow)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "origin-(--radix-hover-card-content-transform-origin)",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
```

#### 2.3 Create Standardized Hover Card Components

Create reusable sub-components for hover cards:

```tsx
// fortinet-web/components/ui/hover-card-header.tsx
import { cn } from "@/lib/utils";

interface HoverCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCardHeader({ children, className }: HoverCardHeaderProps) {
  return (
    <div
      className={cn(
        "bg-[var(--hover-card-header-bg)] padding-[var(--hover-card-header-padding)] border-b border-[var(--hover-card-header-border)]",
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### 2.4 Implementation Guidelines for Hover Cards

1. **Standard Hover Card Pattern**:
   ```tsx
   <HoverCard>
     <HoverCardTrigger asChild>
       <Badge variant="info" className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
         {triggerText}
       </Badge>
     </HoverCardTrigger>
     <HoverCardContent className="p-0">
       <HoverCardHeader>
         <h4 className="font-medium">{headerText}</h4>
       </HoverCardHeader>
       <div className="p-[var(--hover-card-content-padding)]">
         {content}
       </div>
     </HoverCardContent>
   </HoverCard>
   ```

2. **Trigger Elements**:
   - Always use `asChild` on triggers
   - Always add `cursor-help` to clickable elements
   - Use `hover:bg-[var(--hover-trigger-bg-hover)]` and `transition-[var(--hover-trigger-transition)]` for consistent hover effects

3. **Content Structure**:
   - No padding on the HoverCardContent (use `className="p-0"`)
   - Use the HoverCardHeader component for titles
   - Add padding to the content div

## 3. Combobox Component Styling

### Current Issues
- Inconsistent styling between different combobox implementations
- Varying padding and sizing
- Inconsistent dropdown styling

### Implementation Plan

#### 3.1 Define Combobox Variables in CSS

Add the following to `fortinet-web/app/globals.css`:

```css
:root {
  /* Combobox */
  --combobox-height: 2.5rem; /* 40px */
  --combobox-font-size: 0.875rem; /* 14px */
  --combobox-padding-x: 0.75rem;
  --combobox-border-radius: var(--radius);
  
  --combobox-trigger-gap: 0.5rem;
  
  --combobox-content-width: 15rem; /* 240px */
  --combobox-content-max-height: 15rem; /* 240px */
  
  --combobox-item-padding: 0.5rem 0.75rem;
  --combobox-item-height: 2.5rem; /* 40px */
  --combobox-item-gap: 0.5rem;
  
  --combobox-empty-padding: 3rem 1rem;
  --combobox-empty-text-align: center;
}
```

#### 3.2 Update Combobox Component

Modify `fortinet-web/components/ui/combobox.tsx`:

```tsx
export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ options, value, onChange, placeholder }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-[var(--combobox-height)] text-[var(--combobox-font-size)] px-[var(--combobox-padding-x)] rounded-[var(--combobox-border-radius)]"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder || "Select option..."}
            <ChevronsUpDown className="ml-[var(--combobox-trigger-gap)] h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--combobox-content-width)] p-0">
          <Command>
            <CommandInput placeholder={placeholder || "Search..."} className="h-[var(--combobox-height)]" />
            <CommandEmpty className="py-[var(--combobox-empty-padding)] text-center text-sm">
              No results found.
            </CommandEmpty>
            <CommandGroup className="max-h-[var(--combobox-content-max-height)] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className="h-[var(--combobox-item-height)] px-[var(--combobox-item-padding)]"
                >
                  <Check
                    className={cn(
                      "mr-[var(--combobox-item-gap)] h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
```

#### 3.3 Implementation Guidelines for Combobox

1. **Standard Pattern for Filter Components**:
   ```tsx
   <div className="grid gap-2">
     <Label htmlFor="vdom-filter" className="text-sm font-medium">
       VDOM
     </Label>
     <Combobox
       options={vdomOptions}
       value={selectedVdom}
       onChange={setSelectedVdom}
       placeholder="All VDOMs"
     />
   </div>
   ```

2. **Container Styling**:
   - Always wrap comboboxes in a `<div className="grid gap-2">`
   - Always use a `<Label>` with consistent styling
   - Group filter elements in `<div className="flex flex-wrap items-end gap-4">`

## Implementation Steps

1. Update CSS variables in `globals.css`
2. Update base components (table.tsx, hover-card.tsx, combobox.tsx)
3. Create new helper components (table-code.tsx, hover-card-header.tsx)
4. Systematically update each page to use the new standardized components:
   - Start with a single page as a test/prototype
   - Update pages in this order: firewalls, interfaces, routes, vips, vdoms, search-ips, ip-list
5. Test in both light and dark modes
6. Create documentation with examples in the project wiki

## Expected Outcomes

- Consistent visual appearance across all pages
- Improved readability with standardized typography
- Better user experience with predictable hover card behavior
- More maintainable codebase with reusable styling patterns
- Easier theme customization through CSS variables