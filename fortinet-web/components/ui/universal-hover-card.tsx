"use client"

import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UniversalHoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  positioning?: 'smart' | 'right' | 'left' | 'above' | 'below';
  width?: 'default' | 'wide' | 'narrow';
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

/**
 * Universal Hover Card Component
 * 
 * Uses the exact working positioning logic from search-ips/page.tsx
 * that was proven to work correctly.
 */
export function UniversalHoverCard({
  trigger,
  content,
  title,
  positioning = 'smart',
  width = 'default',
  className,
  triggerClassName,
  disabled = false,
}: UniversalHoverCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  // Get width class based on width prop
  const getWidthClass = () => {
    switch (width) {
      case 'narrow': return 'w-64';
      case 'wide': return 'w-80 sm:w-96';
      case 'default':
      default: return 'w-80';
    }
  };

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Use the exact working logic from search-ips/page.tsx
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverCard = e.currentTarget.querySelector('.hover-card') as HTMLElement;
    if (hoverCard) {
      // First position off-screen to measure actual dimensions
      hoverCard.style.position = 'fixed';
      hoverCard.style.top = '-9999px';
      hoverCard.style.left = '-9999px';
      hoverCard.style.visibility = 'visible';
      hoverCard.style.opacity = '1';
      
      // Get actual card dimensions
      const cardRect = hoverCard.getBoundingClientRect();
      const cardHeight = cardRect.height;
      const cardWidth = cardRect.width;
      
      // Get viewport dimensions
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
      hoverCard.style.visibility = '';
      hoverCard.style.opacity = '';
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    // No need to do anything - CSS handles hiding
  }, []);

  return (
    <div
      ref={triggerRef}
      className={cn(
        "relative group cursor-help",
        triggerClassName
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      
      {/* Hover card - always rendered but initially positioned off-screen */}
      <div
        className={cn(
          "hover-card hidden group-hover:block hover:block rounded-lg border border-border bg-popover shadow-lg overflow-hidden",
          getWidthClass(),
          className
        )}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          zIndex: 99999,
          maxHeight: 'calc(80vh - 100px)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {title && (
          <div className="bg-muted/50 p-3 border-b border-border">
            <h4 className="font-medium truncate">{title}</h4>
          </div>
        )}
        <div className="p-3">
          {content}
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized hover card for firewall details
 * Pre-configured for common firewall detail use cases
 */
export function FirewallHoverCard({
  trigger,
  firewall,
  className,
  ...props
}: Omit<UniversalHoverCardProps, 'content' | 'title'> & {
  firewall: any; // Replace with proper firewall type
}) {
  return (
    <UniversalHoverCard
      trigger={trigger}
      title={firewall?.fw_name}
      content={
        <div>
          <p className="text-sm mb-1">This VDOM belongs to:</p>
          <ul className="text-xs text-muted-foreground">
            <li className="flex items-center leading-tight">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
              <span className="font-medium mr-1">Firewall Name:</span>
              <span>{firewall?.fw_name}</span>
            </li>
            <li className="flex items-center leading-tight">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
              <span className="font-medium mr-1">Firewall IP:</span>
              <span>{firewall?.fw_ip}</span>
            </li>
            {firewall?.fmg_ip && (
              <li className="flex items-center leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                <span className="font-medium mr-1">FortiManager IP:</span>
                <span>{firewall.fmg_ip}</span>
              </li>
            )}
            {firewall?.faz_ip && (
              <li className="flex items-center leading-tight">
                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                <span className="font-medium mr-1">FortiAnalyzer IP:</span>
                <span>{firewall.faz_ip}</span>
              </li>
            )}
          </ul>
        </div>
      }
      width="wide"
      className={className}
      {...props}
    />
  );
}