"use client";

import { VDOMResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface IpListFilterProps {
  vdoms: VDOMResponse[];
  initialVdomId?: string;
  initialIp?: string;
  initialName?: string;
}

export function IpListFilter({
  vdoms,
  initialVdomId,
  initialIp,
  initialName,
}: IpListFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vdomId = useMemo(
    () => searchParams?.get("vdom_id") || initialVdomId || "",
    [searchParams, initialVdomId]
  );
  const ip = useMemo(
    () => searchParams?.get("ip") || initialIp || "",
    [searchParams, initialIp]
  );
  const name = useMemo(
    () => searchParams?.get("name") || initialName || "",
    [searchParams, initialName]
  );

  const handleFilterChange = (
    key: "vdom_id" | "ip" | "name",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams || undefined);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("?");
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Label htmlFor="name">Interface Name</Label>
        <Input
          id="name"
          placeholder="Filter by name..."
          value={name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="ip">IP Address</Label>
        <Input
          id="ip"
          placeholder="Filter by IP..."
          value={ip}
          onChange={(e) => handleFilterChange("ip", e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="vdom">VDOM</Label>
        <Select
          value={vdomId}
          onValueChange={(value) => handleFilterChange("vdom_id", value)}
        >
          <SelectTrigger className="shadow-sm">
            <SelectValue placeholder="Select a VDOM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All VDOMs</SelectItem>
            {vdoms.map((vdom) => (
              <SelectItem key={vdom.vdom_id} value={vdom.vdom_id.toString()}>
                {vdom.vdom_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleReset}
        variant="outline"
        className="bg-[var(--filter-button-secondary-bg)] text-[var(--filter-button-secondary-text)] border-[var(--filter-button-secondary-border)] hover:bg-[var(--filter-button-secondary-hover-bg)] hover:border-[var(--filter-button-secondary-hover-border)] transition-all"
      >
        Reset
      </Button>
    </div>
  );
}