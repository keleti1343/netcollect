// FilterSection.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FilterSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function FilterSection({ title = "Filter Options", children }: FilterSectionProps) {
  return (
    <Card className="border shadow-md">
      <CardHeader className="bg-muted/50 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}