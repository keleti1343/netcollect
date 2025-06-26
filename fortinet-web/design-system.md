# Fortinet-Web Design System

This document provides a comprehensive design system for the Fortinet-Web application, ensuring consistency across all pages while allowing for page-specific functionality.

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Component Library](#4-component-library)
5. [Layout Structure](#5-layout-structure)
6. [Page-Specific Guidelines](#6-page-specific-guidelines)
7. [Responsive Design](#7-responsive-design)
8. [Animation & Interaction](#8-animation--interaction)
9. [Implementation Guide](#9-implementation-guide)

## 1. Design Principles

### Consistency
Maintain visual consistency across all pages through shared components, color schemes, and layout patterns.

### Clarity
Prioritize clear information hierarchy and readability to help users navigate complex network information.

### Efficiency
Design interfaces that allow users to efficiently locate, filter, and manage network resources.

### Scalability
Ensure designs work well with both small and large datasets through proper pagination and filtering.

## 2. Color System

### Primary Colors
- Primary: Used for key actions, navigation, and highlights
- Primary Foreground: Text color on primary backgrounds

### Secondary Colors
- Secondary: Used for secondary actions and less prominent UI elements
- Secondary Foreground: Text color on secondary backgrounds

### Accent Colors
- Accent: Used sparingly to draw attention to specific elements
- Accent Foreground: Text color on accent backgrounds

### Status Colors
- Success: Green (#10b981) - For positive status, successful operations
- Warning: Amber (#f59e0b) - For cautionary status, warnings
- Destructive: Red (#ef4444) - For negative status, errors, destructive actions
- Info: Blue (#3b82f6) - For informational status

### Neutral Colors
- Background: Main page background
- Foreground: Main text color
- Card: Background color for cards
- Card Foreground: Text color inside cards
- Muted: For less prominent UI elements
- Muted Foreground: Text color for less prominent text
- Border: Color for borders and dividers

## 3. Typography

### Font Family
- Primary: Use system font stack for optimal performance and native feel

### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

### Font Weights
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Line Heights
- tight: 1.25
- normal: 1.5
- relaxed: 1.75

## 4. Component Library

### Page Header
```tsx
<div className="flex items-center justify-between pb-6 border-b">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
    <p className="text-sm text-muted-foreground mt-1">
      {pageDescription}
    </p>
  </div>
  <div className="flex items-center gap-2">
    {/* Action buttons */}
    <Button variant="outline" size="sm">
      <span className="mr-2">Export</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </Button>
    <Button size="sm">
      <span className="mr-2">Refresh</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
    </Button>
  </div>
</div>
```

### Filter Card
```tsx
<Card className="border shadow-sm">
  <CardHeader className="bg-muted/50 pb-3">
    <CardTitle className="text-lg flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      Filter Options
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-4">
    {/* Page-specific filter component */}
  </CardContent>
</Card>
```

### Data Card
```tsx
<Card className="border shadow-sm">
  <CardHeader className="bg-muted/50 pb-3 flex flex-row items-center justify-between">
    <div>
      <CardTitle className="text-lg flex items-center">
        {/* Page-specific icon */}
        {pageDataTitle}
      </CardTitle>
      <CardDescription>
        Total: {totalCount} {itemType}
      </CardDescription>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">
        {items.length > 0 ? 
          `Showing ${(currentPage - 1) * currentPageSize + 1}-${Math.min(currentPage * currentPageSize, totalCount)} of ${totalCount}` : 
          `No ${itemType} found`}
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    {/* Table content */}
  </CardContent>
</Card>
```

### Table Header
```tsx
<TableHeader className="bg-muted/50">
  <TableRow className="hover:bg-muted/20">
    {columns.map(column => (
      <TableHead 
        key={column.key} 
        className="font-medium text-xs uppercase tracking-wider text-muted-foreground py-3"
      >
        {column.label}
      </TableHead>
    ))}
  </TableRow>
</TableHeader>
```

### Table Body
```tsx
<TableBody>
  {items.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
        No {itemType} found
      </TableCell>
    </TableRow>
  ) : (
    items.map((item) => (
      <TableRow key={item.id} className="hover:bg-muted/20 border-b">
        {/* Row cells */}
      </TableRow>
    ))
  )}
</TableBody>
```

### Pagination
```tsx
<div className="border-t p-4">
  <div className="flex items-center justify-between">
    <div className="text-sm text-muted-foreground">
      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} {itemType}
    </div>
    <DataPagination currentPage={page} totalPages={totalPages} />
  </div>
</div>
```

### Status Badges
```tsx
// Success status
<Badge className="bg-green-500 text-white">
  Online
</Badge>

// Warning status
<Badge className="bg-amber-500 text-white">
  Warning
</Badge>

// Error status
<Badge className="bg-red-500 text-white">
  Offline
</Badge>

// Info status
<Badge className="bg-blue-500 text-white">
  Info
</Badge>
```

### Code Display
```tsx
<code className="px-2 py-1 bg-muted rounded text-sm">{codeContent}</code>
```

### HoverCard for Additional Information
```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <Badge variant="outline" className="cursor-help flex items-center space-x-1 hover:bg-primary/10">
      <span className="w-2 h-2 bg-primary rounded-full"></span>
      <span>{labelText}</span>
    </Badge>
  </HoverCardTrigger>
  <HoverCardContent className="w-80 p-0">
    <div className="bg-muted/50 p-3 border-b">
      <h4 className="font-semibold">{headerText}</h4>
    </div>
    <div className="p-3">
      {/* Content */}
    </div>
  </HoverCardContent>
</HoverCard>
```

### Loading State
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

## 5. Layout Structure

### Page Layout
```
┌──────────────────────────────────────┐
│              Page Header             │
├──────────────────────────────────────┤
│              Filter Card             │
├──────────────────────────────────────┤
│                                      │
│                                      │
│             Content Card             │
│            (Table/Content)           │
│                                      │
│                                      │
├──────────────────────────────────────┤
│              Pagination              │
└──────────────────────────────────────┘
```

### Container
Wrap all page content with a consistent container:
```tsx
<div className="space-y-6 max-w-7xl mx-auto">
  {/* Page content */}
</div>
```

## 6. Page-Specific Guidelines

### Firewalls Page
- Display firewall status with visual indicators
- Show VDoms count with hover card details
- Format IP addresses with code styling
- Include action buttons for export and refresh

### Interfaces Page
- Display interface status with color-coded badges
- Show descriptive hover cards for additional information
- Format IP addresses with code styling
- Highlight VDOM associations

### IP List Page
- Format IP addresses with code styling
- Show subnet masks clearly
- Include visual indicators for IP types
- Implement proper filtering for IP ranges

### Routes Page
- Show route diagram or visualization 
- Indicate gateway status
- Display metrics and priorities
- Format complex routing information clearly

### Search IPs Page
- Implement prominent search interface
- Display search results clearly
- Highlight matching text in results
- Show relevant context for matches

### VDoms Page
- Display hierarchical relationships
- Show associated interfaces and policies
- Use badges to indicate VDOM status
- Implement proper filtering options

### VIPs Page
- Show mapping between external and internal IPs clearly
- Display service information prominently
- Include visual indicators for VIP status
- Format port information consistently

## 7. Responsive Design

### Breakpoints
- xs: 0px (base)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile Adaptations
- Stack header components vertically
- Full-width cards
- Responsive tables with horizontal scroll
- Simplified filtering interface

### Tablet Adaptations
- Maintain most desktop layouts
- Adjust spacing for comfort
- Keep tables responsive

### Desktop Experience
- Multi-column layouts
- Full featured tables
- Expanded filtering options

## 8. Animation & Interaction

### Hover States
Apply subtle hover effects to interactive elements:
```css
.interactive-element {
  transition: background-color 0.2s, transform 0.1s;
}

.interactive-element:hover {
  background-color: var(--hover-bg);
  transform: translateY(-1px);
}
```

### Loading States
Use consistent loading animations:
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Transitions
Apply smooth transitions to state changes:
```css
.state-element {
  transition: opacity 0.3s, height 0.3s;
}
```

### Focus States
Ensure accessible focus states:
```css
.interactive-element:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

## 9. Implementation Guide

### Step 1: Standardize Imports
Ensure all pages have consistent imports:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/data-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
```

### Step 2: Apply Page Structure
Follow the layout structure consistently:
1. Page header with title and description
2. Filter card with page-specific filters
3. Main content card with data table
4. Pagination section

### Step 3: Implement Common Components
Use the component patterns defined in this document for:
- Page headers
- Filter cards
- Data tables
- Status indicators
- Pagination

### Step 4: Apply Page-Specific Elements
Add page-specific functionality while maintaining visual consistency.

### Step 5: Ensure Responsive Design
Test and adjust layouts for all breakpoints.

### Step 6: Implement Animations
Add animations and transitions as defined in this document.

### Step 7: Test Accessibility
Ensure all interactive elements have proper focus states and semantic markup.