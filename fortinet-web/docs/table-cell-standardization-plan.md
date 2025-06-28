# Table Cell Standardization Plan for Firewall Pages

## Current State Analysis

After reviewing the codebase, I've identified the following:

1. **Base Table Components** defined in `fortinet-web/components/ui/table.tsx`
2. **CSS Variables** in `fortinet-web/app/globals.css` for table styling
3. **Specialized Components** like `TableCode` for technical data (IPs, ports)
4. **Inconsistent Styling** across different pages (firewalls, VIPs, etc.)

The current `TableCell` component uses some CSS variables but lacks complete standardization across all firewall pages:

```tsx
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

## Implementation Plan

### 1. Extend CSS Variables in globals.css

Add the following to `fortinet-web/app/globals.css`:

```css
/* Table cell standardization */
:root {
  /* Standard table cell variables */
  --table-cell-padding-x: 1rem;
  --table-cell-padding-y: 1rem;
  --table-cell-text-color: var(--text-primary);
  --table-cell-primary-font-weight: 500;
  --table-cell-background: transparent;
  --table-cell-border-radius: 0;
  
  /* Ensure existing variables are consistently applied */
  --table-cell-font-size: 0.875rem; /* 14px */
  --table-cell-line-height: 1.25rem; /* 20px */
  
  /* Technical content (already defined but ensuring consistency) */
  --table-code-font-size: 0.875rem; /* 14px */
  --table-code-bg: var(--muted);
  --table-code-padding-x: 0.5rem;
  --table-code-padding-y: 0.25rem;
  --table-code-border-radius: 0.25rem;
  --table-code-text-color: var(--text-primary);
  
  /* Status indicators */
  --table-status-size: 0.5rem;
  --table-status-margin: 0.5rem;
  
  /* Date/time cells */
  --table-datetime-icon-size: 14px;
  --table-datetime-icon-margin: 0.25rem;
  --table-datetime-text-color: var(--text-secondary);
  --table-datetime-font-size: var(--font-size-small);
}

/* Dark theme extensions */
.dark {
  /* Any dark mode specific overrides if needed */
  --table-cell-text-color: var(--text-primary);
  --table-code-bg: var(--muted);
  --table-code-text-color: var(--text-primary);
}

/* Helper classes for table cells */
.table-cell-primary {
  font-weight: var(--table-cell-primary-font-weight);
  color: var(--table-cell-text-color);
}

.table-cell-center {
  text-align: center;
}

.table-cell-right {
  text-align: right;
}

.table-cell-action {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.table-cell-datetime {
  display: flex;
  align-items: center;
  color: var(--table-datetime-text-color);
  font-size: var(--table-datetime-font-size);
}

.table-cell-datetime svg {
  width: var(--table-datetime-icon-size);
  height: var(--table-datetime-icon-size);
  margin-right: var(--table-datetime-icon-margin);
}
```

### 2. Update TableCell Component

Modify `fortinet-web/components/ui/table.tsx` to use the standardized variables:

```tsx
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-[var(--table-cell-padding-x)] py-[var(--table-cell-padding-y)] text-[var(--table-cell-font-size)] leading-[var(--table-cell-line-height)] text-[var(--table-cell-text-color)] bg-[var(--table-cell-background)] rounded-[var(--table-cell-border-radius)] align-middle",
        className
      )}
      {...props}
    />
  );
}
```

### 3. Create Specialized Table Cell Components

Create a new file `fortinet-web/components/ui/table-cells.tsx`:

```tsx
import { TableCell } from "@/components/ui/table";
import { TableCode } from "@/components/ui/table-code";
import { cn } from "@/lib/utils";
import React from "react";

interface PrimaryCellProps extends React.ComponentProps<"td"> {
  children: React.ReactNode;
}

// Primary Cell for entity names
export function PrimaryCell({ children, className, ...props }: PrimaryCellProps) {
  return (
    <TableCell className={cn("table-cell-primary", className)} {...props}>
      {children}
    </TableCell>
  );
}

interface TechnicalCellProps extends React.ComponentProps<"td"> {
  value: string | number | null | undefined;
}

// Technical Cell for IPs, ports, etc.
export function TechnicalCell({ value, className, ...props }: TechnicalCellProps) {
  return (
    <TableCell className={className} {...props}>
      <TableCode>{value !== undefined && value !== null ? value : '-'}</TableCode>
    </TableCell>
  );
}

interface DateTimeCellProps extends React.ComponentProps<"td"> {
  date: string | Date;
}

// DateTime Cell with icon
export function DateTimeCell({ date, className, ...props }: DateTimeCellProps) {
  return (
    <TableCell className={cn("table-cell-datetime", className)} {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <small>{new Date(date).toLocaleString()}</small>
    </TableCell>
  );
}

interface StatusCellProps extends React.ComponentProps<"td"> {
  status: "success" | "warning" | "error" | "neutral";
  statusText: string;
}

// Status Cell with indicator
export function StatusCell({ status, statusText, className, ...props }: StatusCellProps) {
  return (
    <TableCell className={className} {...props}>
      <div className={`status-indicator ${status}`}>
        {statusText}
      </div>
    </TableCell>
  );
}

interface PlaceholderCellProps extends React.ComponentProps<"td"> {
  value: string | number | null | undefined;
  useCode?: boolean;
}

// Placeholder Cell for handling undefined/null values
export function PlaceholderCell({ value, useCode = false, className, ...props }: PlaceholderCellProps) {
  if (value === undefined || value === null || value === '') {
    return (
      <TableCell className={className} {...props}>
        <span className="text-muted-foreground">-</span>
      </TableCell>
    );
  }
  
  if (useCode) {
    return <TechnicalCell value={value} className={className} {...props} />;
  }
  
  return (
    <TableCell className={className} {...props}>
      {value}
    </TableCell>
  );
}
```

### 4. Implementation Example for Firewall Page

Update `fortinet-web/app/firewalls/page.tsx` to use the standardized components:

```tsx
import { PrimaryCell, TechnicalCell, DateTimeCell } from "@/components/ui/table-cells";

// Replace existing table rows with:
<TableRow key={firewall.firewall_id} className="hover:bg-muted/20 border-b">
  <PrimaryCell>{firewall.fw_name}</PrimaryCell>
  <TechnicalCell value={firewall.fw_ip} />
  <TechnicalCell value={firewall.fmg_ip && firewall.fmg_ip !== 'None' && firewall.fmg_ip !== 'n/a' ? firewall.fmg_ip : '-'} />
  <TechnicalCell value={firewall.faz_ip && firewall.faz_ip !== 'None' && firewall.faz_ip !== 'n/a' ? firewall.faz_ip : '-'} />
  <TableCell>
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge variant="vdom" count={firewall.total_vdoms || 0} className="cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]">
          VDOMs
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="p-0">
        <HoverCardHeader>
          <h4 className="font-medium">List of VDoms for {firewall.fw_name}</h4>
        </HoverCardHeader>
        <div className="p-[var(--hover-card-content-padding)]">
          <VdomsList firewallId={firewall.firewall_id} firewallName={firewall.fw_name} />
        </div>
      </HoverCardContent>
    </HoverCard>
  </TableCell>
  <DateTimeCell date={firewall.last_updated} />
</TableRow>
```

### 5. Implementation Example for VIPs Page

Update `fortinet-web/app/vips/page.tsx` to use the standardized components:

```tsx
import { PrimaryCell, TechnicalCell, DateTimeCell, PlaceholderCell } from "@/components/ui/table-cells";

// Replace existing table rows with:
<TableRow key={vip.vip_id} className="hover:bg-muted/20 border-b">
  <PlaceholderCell value={vip.vdom?.vdom_name} />
  <PrimaryCell>{vip.vip_name}</PrimaryCell>
  <TechnicalCell value={vip.external_ip} />
  <TechnicalCell value={vip.mapped_ip} />
  <PlaceholderCell value={vip.external_port} useCode={true} />
  <PlaceholderCell value={vip.mapped_port} useCode={true} />
  <PlaceholderCell value={vip.protocol} />
  <DateTimeCell date={vip.last_updated} />
</TableRow>
```

## Step-by-Step Implementation Guide

1. **Add CSS Variables to globals.css**
   - Add the new CSS variables to the `:root` and `.dark` sections
   - Add the helper classes for specialized cell types

2. **Update TableCell Component**
   - Modify the `TableCell` component in `table.tsx` to use the new CSS variables

3. **Create Table Cell Components**
   - Create `table-cells.tsx` with the specialized cell components

4. **Update Firewall Pages**
   - Update each page to use the new standardized components
   - Start with the firewalls page
   - Move to VIPs page
   - Continue with any other pages that use tables

5. **Testing**
   - Test in both light and dark themes
   - Verify consistent appearance across all pages
   - Check for proper handling of edge cases (null values, long text, etc.)

## Benefits

- **Visual Consistency**: All tables will maintain the same appearance and behavior
- **Developer Experience**: Simplified component usage with semantic naming
- **Maintainability**: Central control of styling through CSS variables
- **Flexibility**: Easy to extend with new cell types
- **Accessibility**: Consistent styling improves user experience

## Future Enhancements

- Consider adding sorting indicators for sortable columns
- Add support for cell tooltips for truncated content
- Create a condensed variant for data-dense tables
- Develop a fixed header option for long tables