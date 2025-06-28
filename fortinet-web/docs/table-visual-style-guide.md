# Fortinet Network Visualizer - Table Visual Style Guide

This document provides visual reference and styling examples for the standardized table design across the Fortinet Network Visualizer application.

## Table Design Overview

All tables in the application should follow this standardized design to ensure consistency:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [ICON] Table Title                                            Count: XX  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ COLUMN A      │ COLUMN B      │ COLUMN C      │ COLUMN D           │ │
│ ├───────────────┼───────────────┼───────────────┼───────────────────┤ │
│ │ Primary Value │ 192.168.1.1   │ Count Badge   │ 2025-06-19 09:57  │ │
│ ├───────────────┼───────────────┼───────────────┼───────────────────┤ │
│ │ Primary Value │ 10.0.0.1      │ Count Badge   │ 2025-06-19 09:57  │ │
│ ├───────────────┼───────────────┼───────────────┼───────────────────┤ │
│ │ Primary Value │ -             │ Count Badge   │ 2025-06-19 09:57  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Showing 1-15 of 205                            [Pagination Controls]    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Standard Cell Types

### Primary Cell

Used for entity names and primary identifiers.

```
Primary Value
```

**Styling:**
- Font weight: 500 (semibold)
- Text color: var(--text-primary)
- Font size: 0.875rem (14px)

### Technical Cell

Used for IP addresses, ports, and technical values.

```
192.168.1.1
```

**Styling:**
- Font family: monospace
- Background: var(--muted)
- Border radius: 0.25rem (4px)
- Padding: 0.25rem 0.5rem (4px 8px)

### Status Cell

Used for status indicators with consistent badge styling.

```
[ Success ]  [ Warning ]  [ Error ]  [ Unknown ]
```

**Status Variants:**
- Success: Green (#4cb782)
- Warning: Amber (#f7b538)
- Error: Red (#e63946)
- Neutral/Unknown: Gray (#f1f5f9)

**Styling:**
- Border radius: 4px
- Padding: 0.25rem 0.5rem (4px 8px)
- Font size: 0.75rem (12px)
- Font weight: 500

### Count Cell

Used for numerical counts with badge styling.

```
[ VDOMs (8) ]  [ Routes (127) ]
```

**Styling:**
- Badge with count number in parentheses
- Consistent color based on entity type
- Hover state for interactive badges

### DateTime Cell

Used for consistent date/time display with icon.

```
🕒 2025-06-19 09:57:39 AM
```

**Styling:**
- Clock icon
- Consistent date/time format
- Tooltip with full timestamp on hover

### Empty Cell

Used for standardized empty/null value display.

```
-
```

**Styling:**
- Single dash character
- Text color: var(--muted-foreground)
- Consistent alignment with other cells

## Standard Table Components

### Table Header

```
COLUMN A      │ COLUMN B      │ COLUMN C      │ COLUMN D
```

**Styling:**
- All caps text transform
- Font size: 0.75rem (12px)
- Font weight: 600
- Letter spacing: 0.05em
- Text color: var(--muted-foreground)
- Background: gradient from #f8fafc to #f1f5f9
- Padding: 0.75rem 1rem (12px 16px)

### Table Row

**Styling:**
- Height: 3.5rem (56px)
- Border bottom: 1px solid var(--table-row-border)
- Hover background: var(--table-row-hover-bg)
- Vertical alignment: middle for all cells

### Filter Section

```
┌─────────────────────────────────────────────────────────────────────┐
│ [ICON] Filter Options                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Dropdown]   [Dropdown]   [Input]                                  │
│                                                                     │
│                           [Apply Filter]  [Clear]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Card with light header background
- Consistent button styling
- Uniform spacing between elements
- Clear visual hierarchy

### Pagination

```
Showing 1-15 of 205    [Previous]  1  2  3  ...  14  [Next]
```

**Styling:**
- Consistent "showing X-Y of Z" text
- Uniform pagination controls
- Clear current page indicator
- Proper spacing and alignment

## Examples By Page Type

### Firewalls Page

**Table Header:**
- Firewall Name | IP Address | FortiManager IP | FortiAnalyzer IP | VDOMs | Last Updated

**Cell Types:**
- Firewall Name: PrimaryCell
- IP Address: TechnicalCell
- FortiManager IP: TechnicalCell
- FortiAnalyzer IP: TechnicalCell
- VDOMs: CountCell with vdom variant
- Last Updated: DateTimeCell

### VDoms Page

**Table Header:**
- VDom Name | Firewall | Interfaces | VIPs | Routes | Last Updated

**Cell Types:**
- VDom Name: PrimaryCell
- Firewall: Badge with firewall name
- Interfaces: CountCell with info variant
- VIPs: CountCell with info variant
- Routes: CountCell with info variant
- Last Updated: DateTimeCell

### Routes Page

**Table Header:**
- Route Type | Destination | Gateway | Exit Interface | VDom | Last Updated

**Cell Types:**
- Route Type: Badge with route type
- Destination: TechnicalCell
- Gateway: TechnicalCell
- Exit Interface: PrimaryCell
- VDom: Badge with vdom name
- Last Updated: DateTimeCell

### Interfaces Page

**Table Header:**
- Name | IP Address | VDom Name | Description | Status | Last Updated

**Cell Types:**
- Name: PrimaryCell
- IP Address: TechnicalCell
- VDom Name: Badge with vdom name
- Description: TableCell (regular)
- Status: StatusCell
- Last Updated: DateTimeCell

### VIPs Page

**Table Header:**
- VDom Name | VIP Name | External IP | Mapped IP | External Port | Mapped Port | Protocol | Last Updated

**Cell Types:**
- VDom Name: Badge with vdom name
- VIP Name: PrimaryCell
- External IP: TechnicalCell
- Mapped IP: TechnicalCell
- External Port: TechnicalCell
- Mapped Port: TechnicalCell
- Protocol: Badge with protocol name
- Last Updated: DateTimeCell

## Status Badges Color Reference

These colors should be used consistently across all status indicators:

- Success/Active: #4cb782 (Green)
  - Background: rgba(76, 183, 130, 0.1)
  - Border: rgba(76, 183, 130, 0.3)

- Warning: #f7b538 (Amber)
  - Background: rgba(247, 181, 56, 0.1)
  - Border: rgba(247, 181, 56, 0.3)

- Error/Critical: #e63946 (Red)
  - Background: rgba(230, 57, 70, 0.1)
  - Border: rgba(230, 57, 70, 0.3)

- Unknown/Neutral: #f1f5f9 (Light Gray)
  - Background: rgba(241, 245, 249, 0.5)
  - Border: rgba(226, 232, 240, 1)

## Badge Variants Color Reference

- VDom Badge:
  - Background: rgba(139, 92, 246, 0.1) (Light Purple)
  - Text: rgb(139, 92, 246) (Purple)
  - Border: rgba(139, 92, 246, 0.3)

- Protocol Badge:
  - Background: rgba(14, 165, 233, 0.1) (Light Blue)
  - Text: rgb(14, 165, 233) (Blue)
  - Border: rgba(14, 165, 233, 0.3)

- Firewall Badge:
  - Background: rgba(234, 88, 12, 0.1) (Light Orange)
  - Text: rgb(234, 88, 12) (Orange)
  - Border: rgba(234, 88, 12, 0.3)

## Empty States

When a table has no data to display, show a standardized empty state:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                               [Empty Icon]                              │
│                                                                         │
│                            No Items Found                               │
│                                                                         │
│               No items match your criteria. Try adjusting               │
│                        your filters or search terms.                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Centered icon and text
- Consistent messaging
- Adequate vertical spacing
- Clear visual hierarchy

By following this visual style guide, we'll ensure a consistent, professional appearance across all tables in the Fortinet Network Visualizer.