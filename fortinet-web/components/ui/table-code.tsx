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