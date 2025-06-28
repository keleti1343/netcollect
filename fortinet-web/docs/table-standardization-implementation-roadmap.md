# Fortinet Network Visualizer - Table Standardization Implementation Roadmap

This roadmap outlines the step-by-step process for implementing the table standardization across the Fortinet Network Visualizer application.

## Implementation Phases

### Phase 1: Component Updates (Week 1)

#### 1.1 Update CSS Variables in globals.css

Add the standardized table variables to the globals.css file:

```css
:root {
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
  
  /* Cell styling */
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
  
  /* Badge standardization */
  --badge-unknown-bg: oklch(0.95 0.01 0 / 10%);
  --badge-unknown-text: oklch(0.4 0.01 0);
  --badge-unknown-border: oklch(0.8 0.01 0 / 30%);
}

/* Utility classes */
.table-cell-vertical-middle td {
  vertical-align: middle;
}

.table-fixed-layout {
  table-layout: fixed;
}
```

#### 1.2 Enhance table-cells.tsx

Update the existing table-cells.tsx with the enhanced cell components detailed in the implementation guide:

- PrimaryCell - For entity names (bold text)
- TechnicalCell - For IP addresses and technical values (monospace font)
- DateTimeCell - For timestamps with icon and tooltip
- StatusCell - For status indicators with consistent badges
- CountCell - For numerical counts with badges
- EmptyCell - For standardized empty state display
- LinkCell - For interactive links within tables

Ensure each component uses the CSS variables defined in globals.css for consistent styling.

#### 1.3 Create Reusable FilterSection Component

Create a new component called FilterSection.tsx that provides a standardized layout for filter controls:

- Consistent card styling with muted header
- Standard layout for filter controls
- Uniform button styling
- Proper spacing and alignment

### Phase 2: Page-by-Page Implementation (Weeks 2-3)

Implement the standardized table components on each page, following this priority order:

#### 2.1 Firewalls Page (Day 1-2)

1. Update table header styling
2. Replace direct TableCell usage with specialized cell components
3. Implement consistent filter section
4. Standardize pagination display

#### 2.2 VDoms Page (Day 3-4)

1. Update table header styling
2. Replace direct TableCell usage with specialized cell components
3. Implement consistent filter section
4. Standardize pagination display

#### 2.3 Routes Page (Day 5-6)

1. Update table header styling
2. Replace direct TableCell usage with specialized cell components
3. Implement consistent filter section
4. Standardize pagination display

#### 2.4 Interfaces Page (Day 7-8)

1. Update table header styling
2. Replace direct TableCell usage with specialized cell components
3. Implement consistent filter section
4. Standardize pagination display

#### 2.5 VIPs Page (Day 9-10)

1. Update table header styling
2. Replace direct TableCell usage with specialized cell components
3. Implement consistent filter section
4. Standardize pagination display

### Phase 3: Cross-Component Standardization (Week 4)

#### 3.1 Standardize Empty States

Create and implement a consistent EmptyState component for all tables:

- Centered icon and text
- Consistent messaging
- Adequate vertical spacing
- Clear visual hierarchy

#### 3.2 Standardize Filter Controls

Ensure all filter controls use consistent styling:

- Dropdown components
- Input fields
- Date pickers
- Button styling

#### 3.3 Standardize Pagination

Create a standardized DataPagination component:

- Consistent "showing X-Y of Z" text
- Uniform pagination controls
- Clear current page indicator
- Proper spacing and alignment

### Phase 4: Testing & Refinement (Week 5)

#### 4.1 Visual Consistency Testing

Verify visual consistency across all pages:

- Table header styling
- Row heights and cell padding
- Badge and status indicator styling
- Technical data formatting
- Empty value handling

#### 4.2 Responsive Testing

Test table responsiveness on different screen sizes:

- Horizontal scrolling on smaller screens
- Proper text wrapping and truncation
- Correct alignment on mobile devices

#### 4.3 Edge Case Testing

Test edge cases:

- Tables with many columns
- Tables with long content
- Empty tables
- Tables with very few items

#### 4.4 Refinement

Address any inconsistencies or issues found during testing:

- Fix styling issues
- Adjust component behavior
- Optimize performance
- Refine responsive behavior

## Implementation Guidelines

### Code Quality

- Follow TypeScript best practices
- Add proper JSDoc comments to all components
- Ensure proper prop types and interfaces
- Implement error handling and fallbacks

### Accessibility

- Ensure proper ARIA attributes for all table elements
- Use semantic HTML for better screen reader support
- Test with keyboard navigation
- Verify color contrast meets WCAG standards

### Performance

- Use virtualization for tables with many rows
- Optimize component re-rendering
- Ensure proper memoization of expensive computations
- Lazy load data when appropriate

## Testing Checklist

For each page implementation, verify:

- [ ] All headers have consistent styling
- [ ] Row heights and cell padding are uniform
- [ ] Technical data (IPs, etc.) uses the TechnicalCell component
- [ ] Status indicators use the StatusCell component
- [ ] Empty values are handled consistently
- [ ] Filter sections use the standardized FilterSection component
- [ ] Pagination display is consistent
- [ ] Responsive behavior works as expected
- [ ] Accessibility requirements are met

## Dependencies and Requirements

- Next.js 14 or higher
- Tailwind CSS
- shadcn/ui components
- React 18 or higher

## Rollout Strategy

1. Implement changes in a feature branch
2. Test thoroughly in development environment
3. Get design review and approval
4. Deploy to staging environment for final testing
5. Roll out to production in phases, starting with less critical pages
6. Monitor for any issues and address promptly

By following this implementation roadmap, we'll ensure a consistent, professional appearance across all tables in the Fortinet Network Visualizer while maintaining a systematic approach to the codebase changes.