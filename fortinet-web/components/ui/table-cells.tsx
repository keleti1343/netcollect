import { TableCell } from "@/components/ui/table";
import { TableCode } from "@/components/ui/table-code";
import { Badge, badgeVariants, type VariantProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

interface StatusCellProps extends React.ComponentProps<"td"> {
  status: "success" | "warning" | "error" | "neutral" | "unknown";
  statusText: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

// Primary Cell for entity names
export function PrimaryCell({ children, className, ...props }: React.ComponentProps<"td"> & { children: React.ReactNode }) {
  const isEmpty = children === undefined || children === null || children === '' || children === 'n/a' || children === 'None';
  return (
    <TableCell
      className={cn(
        "font-[var(--table-cell-primary-font-weight)] text-[var(--table-cell-primary-color)]",
        className
      )}
      {...props}
    >
      {!isEmpty ? (
        children
      ) : (
        <EmptyValue />
      )}
    </TableCell>
  );
}

// Technical Cell for IPs, ports, etc.
export function TechnicalCell({
  value,
  className,
  badgeVariant,
  ...props
}: React.ComponentProps<"td"> & {
  value: string | number | null | undefined;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "error" | "warning" | "info" | "vdom" | "protocol" | "placeholder" | "firewall"; // Add all possible badge variants
}) {
  const isEmpty = value === undefined || value === null || value === '' || value === 'n/a' || value === 'None';
  
  const content = !isEmpty ? (
    <TableCode>{value}</TableCode>
  ) : (
    <EmptyValue />
  );

  return (
    <TableCell className={className} {...props}>
      {badgeVariant ? (
        <Badge variant={badgeVariant as BadgeVariant}>{content}</Badge>
      ) : (
        content
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
  const isEmpty = date === undefined || date === null || date === '' || date === 'n/a' || date === 'None';
  
  const content = !isEmpty ? (
    <span className="px-[var(--table-code-padding-x)] py-[var(--table-code-padding-y)] bg-[var(--table-code-bg)] rounded-[var(--table-code-border-radius)] text-[var(--table-code-font-size)] font-mono flex items-center gap-2">
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
      <span>{getFormattedDate(new Date(date), format)}</span>
    </span>
  ) : (
    <EmptyValue />
  );
  
  return (
    <TableCell
      className={cn("whitespace-nowrap", className)}
      {...props}
    >
      {content}
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

export function StatusCell({
  status,
  statusText,
  className,
  ...props
}: StatusCellProps) {
  // Map status to badge variant
  const variantMap: Record<StatusCellProps["status"], BadgeVariant> = {
    "success": "success",
    "warning": "warning",
    "error": "error",
    "neutral": "secondary",
    "unknown": "placeholder"
  };
  
  const variant: BadgeVariant = variantMap[status] || "placeholder";
  const displayStatusText = statusText === 'n/a' || statusText === 'None' ? '-' : statusText;

  return (
    <TableCell className={cn("", className)} {...props}>
      <Badge variant={variant} className="h-6 px-2 py-1">
        {displayStatusText}
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
  variant?: "default" | "secondary" | "vdom" | "protocol" | "info" | "outline";
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
  return <TableCode>−</TableCode>;
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