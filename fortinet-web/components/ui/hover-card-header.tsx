import { cn } from "@/lib/utils";

interface HoverCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCardHeader({ children, className }: HoverCardHeaderProps) {
  return (
    <div
      className={cn(
        "bg-[var(--hover-card-header-bg)] p-[var(--hover-card-header-padding)] border-b border-[var(--hover-card-header-border)]",
        className
      )}
    >
      {children}
    </div>
  );
}