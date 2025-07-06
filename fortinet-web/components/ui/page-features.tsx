import { ChevronDown, ChevronRight, Info, MousePointer, ArrowUpDown, Filter } from "lucide-react";
import { PageFeaturesClient } from "./page-features-client";

interface PageFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PageFeaturesProps {
  features: PageFeature[];
  className?: string;
}

export function PageFeatures({ features, className = "" }: PageFeaturesProps) {
  return <PageFeaturesClient features={features} className={className} />;
}

// Pre-defined feature types for consistency
export const FeatureTypes = {
  hoverCard: (columnName: string, description: string) => ({
    icon: <MousePointer className="h-3 w-3" />,
    title: `Hover for ${columnName} Details`,
    description: description
  }),
  
  sortableColumns: (columns: string[]) => ({
    icon: <ArrowUpDown className="h-3 w-3" />,
    title: "Sortable Columns",
    description: `Click column headers to sort: ${columns.join(", ")}`
  }),
  
  filtering: (filterTypes: string[]) => ({
    icon: <Filter className="h-3 w-3" />,
    title: "Filtering Options",
    description: `Filter by: ${filterTypes.join(", ")}`
  }),
  
  custom: (icon: React.ReactNode, title: string, description: string) => ({
    icon,
    title,
    description
  })
};