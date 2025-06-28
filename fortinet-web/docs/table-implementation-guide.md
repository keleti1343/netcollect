# Fortinet Network Visualizer - Table Implementation Guide

This guide provides specific implementation details to standardize tables across the Fortinet Network Visualizer application. The goal is to create a consistent, professional look and feel for all data tables.

## 1. Enhanced Table Cell Components

### Updated `table-cells.tsx`

```tsx
import { TableCell } from "@/components/ui/table";
import { TableCode } from "@/components/ui/table-code";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

// Primary Cell for entity names
export function PrimaryCell({ children, className, ...props }: React.ComponentProps<"td"> & { children: React.ReactNode }) {
  return (
    <TableCell 
      className={cn(
        "font-[var(--table-cell-primary-font-weight)] text-[var(--table-cell-primary-color)]", 
        className
      )} 
      {...props}
    >
      {children}
    </TableCell>
  );
}

// Technical Cell for IPs, ports, etc.
export function TechnicalCell({ 
  value, 
  className, 
  ...props 
}: React.ComponentProps<"td"> & { 
  value: string | number | null | undefined 
}) {
  return (
    <TableCell className={className} {...props}>
      {value !== undefined && value !== null && value !== '' ? (
        <TableCode>{value}</TableCode>
      ) : (
        <EmptyValue />
      )}
    </TableCell>
  );
}

// DateTime Cell with consistent formatting and icon
export function DateTimeCell({ 
  date, 
  className, 
  format = "full",
  ...props 
}: React.ComponentProps<"td"> & { 
  date: string | Date | null | undefined;
  format?: "full" | "date" | "time";
}) {
  if (!date) return <EmptyCell {...props} />;
  
  const dateObj = new Date(date);
  const formattedDate = getFormattedDate(dateObj, format);
  const fullDateTime = dateObj.toLocaleString();
  
  return (
    <TableCell 
      className={cn(
        "flex items-center space-x-2", 
        className
      )} 
      {...props}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-2 cursor-default">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{formattedDate}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{fullDateTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}

// Helper function for date formatting
function getFormattedDate(date: Date, format: "full" | "date" | "time") {
  switch (format) {
    case "date":
      return date.toLocaleDateString();
    case "time":
      return date.toLocaleTimeString();
    case "full":
    default:
      return date.toLocaleString();
  }
}

// Status Cell with standardized status indicators
export function StatusCell({ 
  status, 
  statusText, 
  className, 
  ...props 
}: React.ComponentProps<"td"> & { 
  status: "success" | "warning" | "error" | "neutral" | "unknown"; 
  statusText: string;
}) {
  // Map status to badge variant
  const variantMap: Record<string, string> = {
    "success": "success",
    "warning": "warning",
    "error": "error",
    "neutral": "secondary",
    "unknown": "placeholder"
  };
  
  const variant = variantMap[status] || "placeholder";
  
  return (
    <TableCell className={cn("", className)} {...props}>
      <Badge variant={variant} className="h-6 px-2 py-1">
        {statusText}
      </Badge>
    </TableCell>
  );
}

// Count Cell for numerical indicators with badges
export function CountCell({ 
  value, 
  label,
  variant = "secondary",
  className, 
  ...props 
}: React.ComponentProps<"td"> & { 
  value: number | null | undefined;
  label: string;
  variant?: "default" | "secondary" | "vdom" | "protocol" | "info";
}) {
  if (value === undefined || value === null) return <EmptyCell {...props} />;
  
  return (
    <TableCell className={className} {...props}>
      <Badge variant={variant} count={value}>
        {label}
      </Badge>
    </TableCell>
  );
}

// Standardized Empty Cell component
export function EmptyCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <TableCell className={cn("", className)} {...props}>
      <EmptyValue />
    </TableCell>
  );
}

// Reusable Empty Value component for consistent empty state display
export function EmptyValue() {
  return <span className="text-[var(--table-empty-color)]">-</span>;
}

// Link Cell for interactive links within tables
export function LinkCell({ 
  href, 
  children,
  className, 
  ...props 
}: React.ComponentProps<"td"> & { 
  href: string;
  children: React.ReactNode;
}) {
  return (
    <TableCell className={className} {...props}>
      <a 
        href={href}
        className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
      >
        {children}
      </a>
    </TableCell>
  );
}
```

## 2. CSS Variables for Table Standardization

Add these variables to your `globals.css`:

```css
:root {
  /* Existing variables */
  
  /* Table standardization */
  --table-row-height: 3.5rem;
  --table-header-bg-start: #f8fafc;
  --table-header-bg-end: #f1f5f9;
  --table-row-border: #e2e8f0;
  --table-row-hover-bg: rgba(241, 245, 249, 0.7);
  
  /* Typography standardization */
  --table-header-font-size: 0.75rem;
  --table-header-font-weight: 600;
  --table-header-letter-spacing: 0.05em;
  --table-header-text-transform: uppercase;
  
  --table-cell-font-size: 0.875rem;
  --table-cell-line-height: 1.25rem;
  --table-cell-padding-x: 1rem;
  --table-cell-padding-y: 1rem;
  --table-cell-text-color: var(--text-primary);
  --table-cell-primary-font-weight: 500;
  --table-cell-primary-color: var(--text-primary);
  --table-cell-background: transparent;
  --table-cell-border-radius: 0;
  
  /* Technical content styling */
  --table-code-font-size: 0.875rem;
  --table-code-bg: var(--muted);
  --table-code-text-color: var(--text-primary);
  --table-code-padding-x: 0.5rem;
  --table-code-padding-y: 0.25rem;
  --table-code-border-radius: 0.25rem;
  
  /* Empty state standardization */
  --table-empty-color: var(--muted-foreground);
  
  /* Status badge standardization */
  --badge-unknown-bg: oklch(0.95 0.01 0 / 10%);
  --badge-unknown-text: oklch(0.4 0.01 0);
  --badge-unknown-border: oklch(0.8 0.01 0 / 30%);
  
  /* Count badge hover effects */
  --hover-trigger-bg-hover: rgba(0, 0, 0, 0.05);
  --hover-trigger-transition: background-color 0.2s ease;
  --hover-card-content-padding: 0.75rem;
}

/* Additional utility classes */
.table-cell-vertical-middle td {
  vertical-align: middle;
}

.table-fixed-layout {
  table-layout: fixed;
}

.table-cell-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}

/* Enhanced hover card styling */
.hover-card-list {
  max-height: 200px;
  overflow-y: auto;
}

.hover-card-list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.hover-card-list-item:hover {
  background-color: var(--muted);
}
```

## 3. Standardized Table Implementation Example

Here's an example of how to implement a standardized table for the Firewalls page:

```tsx
<Card className="border shadow-md">
  <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
    <div>
      <CardTitle className="text-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        Firewall Devices
      </CardTitle>
      <CardDescription>
        Total: {totalCount} devices
      </CardDescription>
    </div>
    <div className="text-sm text-muted-foreground">
      {firewalls.length > 0 
        ? `Showing ${(currentPage - 1) * currentPageSize + 1}-${Math.min(currentPage * currentPageSize, totalCount)} of ${totalCount}` 
        : 'No firewalls found'}
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <div className="overflow-auto">
      <Table className="border-collapse table-cell-vertical-middle">
        <TableHeader>
          <TableRow>
            <TableHead>Firewall Name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>FortiManager IP</TableHead>
            <TableHead>FortiAnalyzer IP</TableHead>
            <TableHead>VDoms</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firewalls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState 
                  title="No Firewalls Found" 
                  description="No firewall devices match your criteria. Try adjusting your filters." 
                />
              </TableCell>
            </TableRow>
          ) : (
            firewalls.map((firewall) => (
              <TableRow key={firewall.firewall_id}>
                <PrimaryCell>{firewall.fw_name}</PrimaryCell>
                <TechnicalCell value={firewall.fw_ip} />
                <TechnicalCell value={firewall.fmg_ip} />
                <TechnicalCell value={firewall.faz_ip} />
                <CountCell 
                  value={firewall.total_vdoms} 
                  label="VDOMs" 
                  variant="vdom" 
                />
                <DateTimeCell date={firewall.last_updated} />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    
    <div className="border-t p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * currentPageSize, totalCount)} of {totalCount} firewalls
        </div>
        <DataPagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  </CardContent>
</Card>
```

## 4. Standardized Filter Section Component

Create a reusable filter layout component:

```tsx
// FilterSection.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FilterSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function FilterSection({ title = "Filter Options", children }: FilterSectionProps) {
  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-muted/50 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
```

## 5. Implementation Steps

Follow these steps to update all tables in the application:

### Step 1: Update Component Files
1. Replace `table-cells.tsx` with the enhanced version
2. Add the new CSS variables to `globals.css`
3. Create the reusable `FilterSection.tsx` component

### Step 2: Update Table Pages
For each page with tables (Firewalls, VDoms, Routes, Interfaces, VIPs, Search):

1. Use the standardized table structure
2. Replace direct TableCell usage with specialized cell components
3. Implement the consistent filter section using FilterSection component
4. Ensure consistent pagination display

### Step 3: Verify Visual Consistency
After updating each page, verify:

1. All headers have consistent styling
2. Row heights and cell padding are uniform
3. Technical data (IPs, etc.) uses the TechnicalCell component
4. Status indicators use the StatusCell component
5. Empty values are handled consistently

## 6. Styling Guidelines

### Headers
- Use uppercase text
- Consistent font size (0.75rem/12px)
- Medium font weight (600)
- Muted foreground color
- Gradient background

### Rows
- Consistent height (3.5rem/56px)
- Uniform border styling
- Standardized hover effect
- Vertical middle alignment for all content

### Cell Types
- **Primary**: Bold, primary text color
- **Technical**: Monospace, code-styled
- **Status**: Standard badge styling
- **Count**: Badge with consistent count indicator
- **DateTime**: Icon + formatted date with tooltip
- **Empty**: Standardized dash with muted color

### Filters
- Standard card styling with muted header
- Consistent button styling
- Uniform spacing and alignment

By following this implementation guide, all tables in the Fortinet Network Visualizer will have a consistent, professional appearance, improving both the user experience and the maintainability of the codebase.