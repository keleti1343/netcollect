# Hover Card Refactoring Implementation Plan

## 🎯 Current State Analysis

### Identified Inconsistencies

Based on the search results, I found **23 different hover card implementations** across the application with these patterns:

#### **Dynamic Positioning (JavaScript-based)**
- **VDoms page**: Uses `HoverCard` component with `rect.right - 50` positioning
- **Firewalls page**: Inline implementation with `rect.right - 50` positioning  
- **VIPs page**: Inline implementation with `getBoundingClientRect()` positioning
- **Search-IPs page**: Multiple inline implementations with different positioning logic

#### **Static Positioning (CSS-based)**
- **Interfaces page**: `left-0 sm:left-auto sm:right-0 top-full mt-1`
- **Routes page**: `left-0 sm:left-auto sm:right-0 top-full mt-1`
- **IP-List page**: `left-0 top-full mt-2`
- **Firewalls Filter**: `left-0 top-full mt-2`

#### **Styling Variations**
- **Card widths**: `w-80`, `w-80 sm:w-96`, `w-80 rounded-lg`
- **Z-index values**: `z-[9999]`, `z-[9998]`, `99999`
- **Bridge areas**: Some have `h-2`, others don't exist
- **Positioning**: `fixed`, `absolute`, mixed approaches

## 🔧 Implementation Strategy

### Phase 1: Enhanced CSS Variables

Add to `fortinet-web/app/globals.css`:

```css
:root {
  /* Hover Card Positioning */
  --hover-card-offset-x: -50px;
  --hover-card-offset-y: 0px;
  --hover-card-fallback-offset: 50px;
  --hover-card-viewport-margin: 10px;
  
  /* Hover Card Dimensions */
  --hover-card-width: 320px;           /* w-80 */
  --hover-card-width-sm: 384px;        /* sm:w-96 */
  --hover-card-max-height: calc(80vh - 100px);
  
  /* Hover Card Z-Index */
  --hover-card-z-index: 99999;
  --hover-card-bridge-z-index: 99998;
  
  /* Bridge Area */
  --hover-card-bridge-height: 8px;     /* h-2 */
  
  /* Positioning Modes */
  --hover-card-position-mode: 'smart'; /* 'smart', 'right', 'left', 'above', 'below' */
}
```

### Phase 2: Positioning Utility

Create `fortinet-web/lib/hover-card-positioning.ts`:

```typescript
export interface PositionConfig {
  mode: 'smart' | 'right' | 'left' | 'above' | 'below';
  offsetX: number;
  offsetY: number;
  viewportMargin: number;
}

export interface PositionResult {
  left: number;
  top: number;
  placement: 'right' | 'left' | 'above' | 'below';
}

export function calculateHoverCardPosition(
  triggerElement: HTMLElement,
  cardWidth: number,
  cardHeight: number,
  config: PositionConfig = {
    mode: 'smart',
    offsetX: -50,
    offsetY: 0,
    viewportMargin: 10
  }
): PositionResult {
  const rect = triggerElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Smart positioning logic
  if (config.mode === 'smart') {
    // Try right side first
    if (rect.right + config.offsetX + cardWidth <= viewportWidth - config.viewportMargin) {
      return {
        left: rect.right + config.offsetX,
        top: Math.max(config.viewportMargin, rect.top + config.offsetY),
        placement: 'right'
      };
    }
    
    // Try left side
    if (rect.left - cardWidth - config.offsetX >= config.viewportMargin) {
      return {
        left: rect.left - cardWidth - config.offsetX,
        top: Math.max(config.viewportMargin, rect.top + config.offsetY),
        placement: 'left'
      };
    }
    
    // Try below
    if (rect.bottom + cardHeight <= viewportHeight - config.viewportMargin) {
      return {
        left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
        top: rect.bottom + config.offsetY,
        placement: 'below'
      };
    }
    
    // Fallback: above
    return {
      left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
      top: Math.max(config.viewportMargin, rect.top - cardHeight - config.offsetY),
      placement: 'above'
    };
  }
  
  // Handle explicit positioning modes...
}
```

### Phase 3: Universal Hover Card Component

Create `fortinet-web/components/ui/universal-hover-card.tsx`:

```typescript
"use client"

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { calculateHoverCardPosition, PositionConfig } from '@/lib/hover-card-positioning';

interface UniversalHoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  positioning?: PositionConfig['mode'];
  width?: 'default' | 'wide' | 'narrow';
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function UniversalHoverCard({
  trigger,
  content,
  title,
  positioning = 'smart',
  width = 'default',
  className,
  triggerClassName,
  disabled = false
}: UniversalHoverCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: -9999, top: -9999 });

  const widthClasses = {
    narrow: 'w-64',      // 256px
    default: 'w-80',     // 320px
    wide: 'w-80 sm:w-96' // 320px -> 384px on sm+
  };

  const handleMouseEnter = () => {
    if (disabled || !triggerRef.current || !cardRef.current) return;

    const cardElement = cardRef.current;
    const triggerElement = triggerRef.current.closest('td') || triggerRef.current;
    
    // Get card dimensions
    const cardWidth = width === 'wide' ? 384 : width === 'narrow' ? 256 : 320;
    const cardHeight = Math.min(cardElement.scrollHeight, window.innerHeight * 0.8 - 100);
    
    // Calculate position
    const newPosition = calculateHoverCardPosition(
      triggerElement as HTMLElement,
      cardWidth,
      cardHeight,
      { mode: positioning, offsetX: -50, offsetY: 0, viewportMargin: 10 }
    );
    
    setPosition(newPosition);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className={cn(
        "relative group cursor-help hover:bg-[var(--hover-trigger-bg-hover)] transition-[var(--hover-trigger-transition)]",
        triggerClassName
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      
      {/* Bridge area */}
      <div className="absolute z-[var(--hover-card-bridge-z-index)] hidden group-hover:block left-0 right-0 top-full h-[var(--hover-card-bridge-height)] bg-transparent" />
      
      {/* Hover card */}
      <div
        ref={cardRef}
        className={cn(
          "hidden group-hover:block hover:block rounded-lg border border-border bg-popover shadow-lg overflow-hidden",
          widthClasses[width],
          className
        )}
        style={{
          position: 'fixed',
          left: `${position.left}px`,
          top: `${position.top}px`,
          zIndex: 'var(--hover-card-z-index)',
          maxHeight: 'var(--hover-card-max-height)',
          display: isVisible ? 'block' : 'none'
        }}
      >
        {title && (
          <div className="bg-[var(--hover-card-header-bg)] p-[var(--hover-card-header-padding)] border-b border-[var(--hover-card-header-border)]">
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
```

### Phase 4: Migration Strategy

#### **Priority 1: Main Data Pages**
1. **VDoms page** - Replace existing `HoverCard` component
2. **Firewalls page** - Replace inline implementation
3. **VIPs page** - Replace inline implementation

#### **Priority 2: Secondary Pages**
4. **Interfaces page** - Replace static positioning
5. **Routes page** - Replace static positioning
6. **Search-IPs page** - Replace multiple inline implementations

#### **Priority 3: Simple Cases**
7. **IP-List page** - Replace simple static positioning
8. **Firewalls Filter** - Replace filter hover card

### Phase 5: Usage Examples

#### **Before (VDoms page)**
```typescript
<HoverCard 
  vdomId={vdom.id} 
  count={vdom.interfaces_count} 
  type="interfaces" 
  vdomName={vdom.vdom_name} 
/>
```

#### **After (VDoms page)**
```typescript
<UniversalHoverCard
  trigger={<TableCode>{vdom.interfaces_count} interfaces</TableCode>}
  title={`${vdom.vdom_name}'s interfaces`}
  content={
    <div className="text-center py-4 text-muted-foreground text-xs min-h-[200px] flex items-center justify-center">
      <TableCode>Showing {vdom.interfaces_count} of {vdom.interfaces_count} interfaces</TableCode>
    </div>
  }
  positioning="smart"
  width="wide"
/>
```

#### **Before (Interfaces page - static)**
```typescript
<div className="relative group cursor-help">
  <TableCode>{iface.name}</TableCode>
  <div className="absolute z-[9998] hidden group-hover:block left-0 right-0 top-full h-2 bg-transparent"></div>
  <div className="absolute z-[9999] hidden group-hover:block hover:block left-0 sm:left-auto sm:right-0 top-full mt-1 w-80 sm:w-96 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
    {/* content */}
  </div>
</div>
```

#### **After (Interfaces page)**
```typescript
<UniversalHoverCard
  trigger={<TableCode>{iface.name}</TableCode>}
  content={<FirewallDetailsHoverCard firewall={iface.vdom.firewall} />}
  positioning="smart"
  width="wide"
/>
```

## 🎯 Benefits

### **Immediate Benefits**
- ✅ **Single Source of Truth**: One component, one positioning logic
- ✅ **Global Changes**: Modify CSS variables → affects all pages instantly
- ✅ **Consistent UX**: Same behavior across entire application
- ✅ **Code Reduction**: Remove ~200+ lines of duplicate positioning logic

### **Long-term Benefits**
- ✅ **Maintainable**: No more hunting through multiple files
- ✅ **Scalable**: Easy to add new hover cards with consistent behavior
- ✅ **Testable**: Single component to test instead of multiple implementations
- ✅ **Performance**: Reduced bundle size from code deduplication

## 🔄 Implementation Steps

1. **Add CSS variables** to `globals.css`
2. **Create positioning utility** in `lib/hover-card-positioning.ts`
3. **Create universal component** in `components/ui/universal-hover-card.tsx`
4. **Migrate VDoms page** (replace existing component)
5. **Migrate Firewalls page** (replace inline implementation)
6. **Migrate remaining pages** one by one
7. **Remove old implementations** after migration complete
8. **Update documentation** and add usage examples

## 🧪 Testing Strategy

- **Visual regression testing** for each migrated page
- **Cross-browser positioning verification**
- **Mobile responsiveness check**
- **Hover state interaction testing**
- **Performance impact measurement**

---

**Next Step**: Switch to Code mode to implement this plan.