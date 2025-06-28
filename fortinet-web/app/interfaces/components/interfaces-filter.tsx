"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react" // Import icons for Combobox
import { cn } from "@/lib/utils" // Utility for class names
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command" // Combobox components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover" // Popover for Combobox
import { Input } from "@/components/ui/input" // Keep Input for name/IP filter
import { Label } from "@/components/ui/label"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { VDOMResponse } from "@/types" // Import VDOMResponse

interface InterfacesFilterProps {
  initialName?: string;
  initialIp?: string;
  vdoms: VDOMResponse[]; // New prop for VDOMs
}

export function InterfacesFilter({ initialName, initialIp, vdoms }: InterfacesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterValue, setFilterValue] = React.useState(initialName || initialIp || "");
  const [vdomOpen, setVdomOpen] = React.useState(false);
  const [selectedVdomId, setSelectedVdomId] = React.useState(searchParams.get("vdom_id") || ""); // Get initial vdom_id from URL

  const vdomOptions = vdoms.map((vdom: VDOMResponse) => ({
    label: `${vdom.vdom_name} (${vdom.total_interfaces || 0} Interfaces)`,
    value: vdom.vdom_id.toString(),
  }));

  function handleApplyFilter() {
    const params = new URLSearchParams(searchParams);
    
    // Clear previous name/ip filters
    params.delete("name");
    params.delete("ip");
    params.delete("vdom_id"); // Clear vdom_id filter

    if (filterValue) {
      if (filterValue.includes('.')) {
        params.set("ip", filterValue);
      } else {
        params.set("name", filterValue);
      }
    }

    if (selectedVdomId) {
      params.set("vdom_id", selectedVdomId);
    }
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }
  
  function handleClearFilter() {
    setFilterValue("");
    setSelectedVdomId(""); // Clear selected VDOM
    const params = new URLSearchParams(searchParams);
    params.delete("name");
    params.delete("ip");
    params.delete("vdom_id"); // Clear vdom_id filter
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* VDOM Filter Combobox */}
      <div className="grid gap-2">
        <Label htmlFor="vdom-filter">VDOM</Label>
        <Popover open={vdomOpen} onOpenChange={setVdomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="combobox"
              role="combobox"
              aria-expanded={vdomOpen}
              className="w-[250px] justify-between shadow-sm"
              id="vdom-filter"
            >
              {selectedVdomId
                ? vdomOptions.find((vdom) => vdom.value === selectedVdomId)?.label
                : "Select VDOM..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search VDOM..." />
              <CommandList>
                <CommandEmpty>No VDOM found.</CommandEmpty>
                <CommandGroup>
                  {vdomOptions.map((vdom) => (
                    <CommandItem
                      key={vdom.value}
                      value={vdom.value}
                      onSelect={(currentValue) => {
                        setSelectedVdomId(currentValue === selectedVdomId ? "" : currentValue);
                        setVdomOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedVdomId === vdom.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {vdom.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Name/IP Filter Input */}
      <div className="grid gap-2">
        <Label htmlFor="interface-filter">Filter by Name or IP</Label>
        <Input
          id="interface-filter"
          placeholder="Enter name or IP..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="w-[250px]"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleApplyFilter}
          className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
        >
          Apply Filter
        </Button>
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className="bg-[var(--filter-button-secondary-bg)] text-[var(--filter-button-secondary-text)] border-[var(--filter-button-secondary-border)] hover:bg-[var(--filter-button-secondary-hover-bg)] hover:border-[var(--filter-button-secondary-hover-border)] transition-all"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}