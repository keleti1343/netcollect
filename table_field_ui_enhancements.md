# Table Field UI Enhancements

This document provides step-by-step instructions for implementing UI enhancements to the search results tables in the Fortinet Network Visualizer application.

## Requirements

1. Replace all table fields that currently display "unknown" with a dash ("-") wrapped in a badge component
2. Wrap all table field values in badge components, except for the "LAST UPDATED" column

## Implementation Steps

### 1. Examine the Current Components

First, let's look at how the `PlaceholderValue` component is currently used in the application. This component is used to handle potentially null values in the table fields.

### 2. Modify the PlaceholderValue Component

The `PlaceholderValue` component needs to be updated to use badges and replace "unknown" with "-".

**File to modify**: `fortinet-web/components/ui/placeholder-value.tsx`

```tsx
import { Badge } from "@/components/ui/badge";

interface PlaceholderValueProps {
  value: string | null | undefined;
  useCode?: boolean;
  placeholder?: string;
  useBadge?: boolean;
}

export function PlaceholderValue({
  value,
  useCode = false,
  placeholder = "-",
  useBadge = true
}: PlaceholderValueProps) {
  // If value is null or undefined or empty string, show placeholder
  if (value === null || value === undefined || value === "") {
    if (useBadge) {
      return <Badge variant="outline">{placeholder}</Badge>;
    }
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  // If value is "unknown", replace with placeholder
  if (value.toLowerCase() === "unknown") {
    if (useBadge) {
      return <Badge variant="outline">{placeholder}</Badge>;
    }
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  // Otherwise, show the value
  if (useCode) {
    if (useBadge) {
      return <Badge variant="code">{value}</Badge>;
    }
    return <code>{value}</code>;
  }

  if (useBadge) {
    return <Badge variant="secondary">{value}</Badge>;
  }
  
  return <span>{value}</span>;
}
```

### 3. Update Interface Table in the Search Results

**File to modify**: `fortinet-web/app/search-ips/page.tsx`

Locate the interfaces table rendering section and update it:

```tsx
<TableCell>
  <PlaceholderValue value={iface.ip_address} useCode={true} />
</TableCell>
<TableCell className="font-medium">
  <PlaceholderValue value={iface.interface_name} />
</TableCell>
<TableCell>
  <PlaceholderValue value={iface.type} />
</TableCell>
<TableCell>
  <PlaceholderValue value={iface.vdom?.vdom_name} />
</TableCell>
<TableCell>
  <Badge
    variant={
      iface.status === 'up'
        ? 'success'
        : iface.status === 'down'
        ? 'error'
        : 'warning'
    }
  >
    {iface.status || '-'}
  </Badge>
</TableCell>
<TableCell>
  <div className="flex items-center text-sm text-muted-foreground">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <small>{new Date(iface.last_updated).toLocaleString()}</small>
  </div>
</TableCell>
```

### 4. Update Routes Table in the Search Results

**File to modify**: `fortinet-web/app/search-ips/page.tsx`

Locate the routes table rendering section and update it:

```tsx
<TableCell>
  <PlaceholderValue value={`${route.destination_network}/${route.mask_length}`} useCode={true} />
</TableCell>
<TableCell className="font-medium">
  <PlaceholderValue value={route.exit_interface_name} />
</TableCell>
<TableCell>
  <Badge variant="protocol">
    {route.route_type || '-'}
  </Badge>
</TableCell>
<TableCell>
  <PlaceholderValue value={route.gateway === 'n/a' ? null : route.gateway} useCode={true} />
</TableCell>
<TableCell>
  <PlaceholderValue value={route.vdom?.vdom_name} />
</TableCell>
<TableCell>
  <div className="flex items-center text-sm text-muted-foreground">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <small>{new Date(route.last_updated).toLocaleString()}</small>
  </div>
</TableCell>
```

### 5. Update VIPs Table in the Search Results

**File to modify**: `fortinet-web/app/search-ips/page.tsx`

Locate the VIPs table rendering section and update it:

```tsx
<TableCell>
  <PlaceholderValue value={vip.external_ip} useCode={true} />
</TableCell>
<TableCell>
  <PlaceholderValue value={vip.mapped_ip} useCode={true} />
</TableCell>
<TableCell>
  <PlaceholderValue value={vip.vip_type} />
</TableCell>
<TableCell>
  <PlaceholderValue value={vip.vdom?.vdom_name} />
</TableCell>
<TableCell>
  <div className="flex items-center text-sm text-muted-foreground">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <small>{new Date(vip.last_updated).toLocaleString()}</small>
  </div>
</TableCell>
```

### 6. Create Badge Variants if Needed

You may need to ensure that you have appropriate badge variants defined in your theme configuration.

**File to check/modify**: `fortinet-web/components/ui/badge.tsx`

Make sure you have these variants defined:

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        error: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
        protocol: "border-transparent bg-indigo-500 text-white hover:bg-indigo-500/80",
        code: "font-mono bg-muted border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

## Testing the Changes

1. After implementing these changes, test the search functionality with various search queries
2. Verify that all fields except "LAST UPDATED" are displayed with appropriate badge styles
3. Confirm that "unknown" values are displayed as "-" in a badge
4. Check that the various badge variants provide good visual differentiation for different types of data

## Implementation Notes

1. **Badge Styling**:
   - Use appropriate colors and styling to differentiate between different types of data
   - Consider using a different style for code fields vs. regular text fields

2. **Accessibility**:
   - Ensure that badge colors maintain sufficient contrast for readability
   - Test with screen readers to verify that the information is accessible

3. **Responsive Design**:
   - Test on different screen sizes to ensure the badges display correctly on mobile devices
   - Consider adjusting padding or font size on smaller screens if needed

4. **Performance**:
   - Adding badges to all fields will increase the DOM size slightly
   - Monitor performance, especially for large result sets

These changes will enhance the visual presentation of the data in the tables, making it more consistent and easier to scan quickly.