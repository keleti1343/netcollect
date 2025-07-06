"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

interface PageFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PageFeaturesClientProps {
  features: PageFeature[];
  className?: string;
}

export function PageFeaturesClient({ features, className = "" }: PageFeaturesClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-muted/30 rounded-lg py-4 pr-4 mb-4 border border-muted/50 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <Info className="h-4 w-4" />
        <span>Page Features</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 ml-auto transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto transition-transform" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 border-t border-muted/50 pt-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 text-xs text-muted-foreground">
              <div className="flex-shrink-0 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <div className="font-medium text-foreground/80">{feature.title}</div>
                <div className="text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}