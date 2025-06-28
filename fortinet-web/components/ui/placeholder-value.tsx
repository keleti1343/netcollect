import React from "react";
import { Badge } from "./badge";
import { TableCode } from "./table-code";

interface PlaceholderValueProps {
  value: string | number | null | undefined;
  useCode?: boolean;
  className?: string;
}

export function PlaceholderValue({
  value,
  useCode = false,
  className
}: PlaceholderValueProps) {
  // Check for null, undefined, empty string, or "unknown"
  if ((!value && value !== 0) || value === "unknown") {
    return (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        -
      </Badge>
    );
  }
  
  // When value is present and code format is requested
  if (useCode) {
    return <TableCode className={className}>{value}</TableCode>;
  }
  
  // When value is present (normal text wrapped in badge)
  // Use the same variant as seen in the VDOM NAME column in the screenshot
  return (
    <Badge variant="protocol" className={`font-normal ${className || ''}`}>
      {value}
    </Badge>
  );
}