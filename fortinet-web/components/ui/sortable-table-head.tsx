"use client";

import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortKey: string;
  className?: string;
}

export function SortableTableHead({ children, sortKey, className }: SortableTableHeadProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams?.get("sort_by");
  const currentOrder = searchParams?.get("sort_order") || "asc";
  
  const isActive = currentSort === sortKey;
  const isAsc = isActive && currentOrder === "asc";
  const isDesc = isActive && currentOrder === "desc";
  
  const handleSort = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (isActive) {
      // If already sorting by this column, toggle the order
      if (isAsc) {
        params.set("sort_order", "desc");
      } else {
        // If desc, remove sorting (go back to default)
        params.delete("sort_by");
        params.delete("sort_order");
      }
    } else {
      // If not active, set this column as sort with asc order
      params.set("sort_by", sortKey);
      params.set("sort_order", "asc");
    }
    
    // Reset to first page when sorting changes
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };
  
  const getSortIcon = () => {
    if (isAsc) return <ChevronUp className="h-5 w-5" />;
    if (isDesc) return <ChevronDown className="h-5 w-5" />;
    return <ArrowUpDown className="h-4 w-4 opacity-75" />;
  };
  
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto p-0 font-medium hover:bg-transparent ${className?.includes('text-white') ? 'text-white hover:text-white' : ''}`}
        onClick={handleSort}
      >
        <span className="flex items-center gap-1">
          {children}
          {getSortIcon()}
        </span>
      </Button>
    </TableHead>
  );
}