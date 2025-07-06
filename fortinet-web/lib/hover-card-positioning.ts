/**
 * Centralized hover card positioning utility
 * Provides consistent positioning logic across all hover cards
 */

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

/**
 * Calculate optimal position for hover card based on trigger element and viewport constraints
 */
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
  
  // Smart positioning logic - tries multiple positions to find the best fit
  if (config.mode === 'smart') {
    // Try right side first (preferred position)
    if (rect.right + Math.abs(config.offsetX) + cardWidth <= viewportWidth - config.viewportMargin) {
      return {
        left: rect.right + config.offsetX,
        top: Math.max(config.viewportMargin, Math.min(rect.top + config.offsetY, viewportHeight - cardHeight - config.viewportMargin)),
        placement: 'right'
      };
    }
    
    // Try left side
    if (rect.left - cardWidth + config.offsetX >= config.viewportMargin) {
      return {
        left: rect.left - cardWidth + config.offsetX,
        top: Math.max(config.viewportMargin, Math.min(rect.top + config.offsetY, viewportHeight - cardHeight - config.viewportMargin)),
        placement: 'left'
      };
    }
    
    // Try below
    if (rect.bottom + cardHeight + Math.abs(config.offsetY) <= viewportHeight - config.viewportMargin) {
      return {
        left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
        top: rect.bottom + Math.abs(config.offsetY),
        placement: 'below'
      };
    }
    
    // Fallback: above
    return {
      left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
      top: Math.max(config.viewportMargin, rect.top - cardHeight - Math.abs(config.offsetY)),
      placement: 'above'
    };
  }
  
  // Handle explicit positioning modes
  switch (config.mode) {
    case 'right':
      return {
        left: rect.right + config.offsetX,
        top: Math.max(config.viewportMargin, Math.min(rect.top + config.offsetY, viewportHeight - cardHeight - config.viewportMargin)),
        placement: 'right'
      };
      
    case 'left':
      return {
        left: rect.left - cardWidth + config.offsetX,
        top: Math.max(config.viewportMargin, Math.min(rect.top + config.offsetY, viewportHeight - cardHeight - config.viewportMargin)),
        placement: 'left'
      };
      
    case 'below':
      return {
        left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
        top: rect.bottom + Math.abs(config.offsetY),
        placement: 'below'
      };
      
    case 'above':
      return {
        left: Math.max(config.viewportMargin, Math.min(rect.left, viewportWidth - cardWidth - config.viewportMargin)),
        top: Math.max(config.viewportMargin, rect.top - cardHeight - Math.abs(config.offsetY)),
        placement: 'above'
      };
      
    default:
      // Fallback to smart positioning
      return calculateHoverCardPosition(triggerElement, cardWidth, cardHeight, { ...config, mode: 'smart' });
  }
}

/**
 * Get card dimensions based on width setting
 */
export function getCardDimensions(width: 'default' | 'wide' | 'narrow'): { width: number; className: string } {
  switch (width) {
    case 'narrow':
      return { width: 256, className: 'w-64' }; // 16rem
    case 'wide':
      return { width: 384, className: 'w-80 sm:w-96' }; // 20rem -> 24rem on sm+
    case 'default':
    default:
      return { width: 320, className: 'w-80' }; // 20rem
  }
}

/**
 * Default positioning configuration
 */
export const DEFAULT_POSITION_CONFIG: PositionConfig = {
  mode: 'smart',
  offsetX: -50,
  offsetY: 0,
  viewportMargin: 10
};