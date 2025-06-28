"use client"

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
interface DataPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void; // Add optional onPageChange prop
}

export function DataPagination({ totalPages, currentPage, onPageChange }: DataPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handlePageChange = (pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('page', pageNumber.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-6">
      <Button
        variant="sidebar-outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="sidebar-outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}