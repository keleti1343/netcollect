import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

export type { VariantProps }

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // New semantic variants
        // Theme-based variants
        success: "border-[var(--badge-success-border)] bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] [a&]:hover:bg-[var(--badge-success-bg)/80]",
        error: "border-[var(--badge-error-border)] bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] [a&]:hover:bg-[var(--badge-error-bg)/80]",
        warning: "border-[var(--badge-warning-border)] bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] [a&]:hover:bg-[var(--badge-warning-bg)/80]",
        info: "border-[var(--badge-info-border)] bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] [a&]:hover:bg-[var(--badge-info-bg)/80]",
        vdom: "border-[var(--badge-vdom-border)] bg-[var(--badge-vdom-bg)] text-[var(--badge-vdom-text)] [a&]:hover:bg-[var(--badge-vdom-bg)/80]",
        protocol: "border-[var(--badge-protocol-border)] bg-[var(--badge-protocol-bg)] text-[var(--badge-protocol-text)] [a&]:hover:bg-[var(--badge-protocol-bg)/80]",
        placeholder: "border-[var(--badge-placeholder-border)] bg-[var(--badge-placeholder-bg)] text-[var(--badge-placeholder-text)] [a&]:hover:bg-[var(--badge-placeholder-bg)/80]",
        firewall: "border-[var(--badge-firewall-border)] bg-[var(--badge-firewall-bg)] text-[var(--badge-firewall-text)] [a&]:hover:bg-[var(--badge-firewall-bg)/80]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  children,
  count,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; count?: number }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="ml-1 text-xs font-bold">({count})</span>
      )}
    </Comp>
  );
}

export { Badge, badgeVariants }
