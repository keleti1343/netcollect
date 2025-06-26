"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

interface VdomsButtonProps {
  firewallName: string;
  totalVdoms: number;
}

export function VdomsButton({ firewallName, totalVdoms }: VdomsButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/vdoms?fw_name=${encodeURIComponent(firewallName)}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
    >
      VDoms ({totalVdoms})
    </Button>
  );
}