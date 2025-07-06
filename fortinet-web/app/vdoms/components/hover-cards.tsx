import { TableCode } from "@/components/ui/table-code";
import React from "react";

interface HoverCardProps {
  vdomId: number;
  count: number;
  type: string;
  vdomName: string;
}

export function HoverCard({ vdomId, count, type, vdomName }: HoverCardProps) {
  const handleMouseEnterWithPositioning = (e: React.MouseEvent<HTMLDivElement>) => {
    const hoverCard = e.currentTarget.querySelector('.hover-card') as HTMLElement;
    if (hoverCard) {
      // Get the table cell bounds (not the inner div)
      const tableCell = e.currentTarget.closest('td') as HTMLElement;
      const rect = tableCell.getBoundingClientRect();
      
      // Get card dimensions
      const cardWidth = 384; // w-96 = 384px
      const cardHeight = Math.min(hoverCard.scrollHeight, window.innerHeight * 0.8 - 100);
      
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate horizontal position (prefer right side, but adjust if needed)
      let leftPos = rect.right - 50;
      if (leftPos + cardWidth > viewportWidth) {
        leftPos = rect.left - cardWidth + 50;
      }
      if (leftPos < 0) {
        leftPos = 10;
      }
      
      // Calculate vertical position
      let topPos;
      if (rect.bottom + cardHeight + 10 > viewportHeight) {
        // Position above the cell
        topPos = rect.top - cardHeight;
      } else {
        // Position below the cell
        topPos = rect.bottom;
      }
      
      // Apply final positioning
      hoverCard.style.left = `${leftPos}px`;
      hoverCard.style.top = `${topPos}px`;
      hoverCard.style.zIndex = '99999';
    }
  };

  return (
    <div
      className="relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]"
      onMouseEnter={handleMouseEnterWithPositioning}
    >
      <TableCode>
        {count} {type}
      </TableCode>
      {/* Invisible bridge area to maintain hover state */}
      <div className="absolute z-[9998] hidden group-hover:block left-0 right-0 top-full h-2 bg-transparent"></div>
      <div className="hover-card hidden group-hover:block hover:block w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={{ maxHeight: 'calc(80vh - 100px)', position: 'fixed', left: '-9999px', top: '-9999px', zIndex: 99999 }}>
        <div className="bg-muted p-3 border-b border-border">
          <h4 className="font-medium truncate">{vdomName}'s {type}</h4>
        </div>
        <div className="p-3">
          <div className="text-center text-muted-foreground text-xs p-1">
            {count === 0 ? `No ${type} found` : `Showing ${count} of ${count} ${type}`}
          </div>
        </div>
      </div>
    </div>
  );
}