"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { VDOMResponse } from "@/types"

interface VipsFilterProps {
  vdoms: VDOMResponse[];
  initialVdomId?: string;
}

export function VipsFilter({ vdoms, initialVdomId }: VipsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [vdomOpen, setVdomOpen] = React.useState(false);
  const [selectedVdomId, setSelectedVdomId] = React.useState(initialVdomId || "");

  const vdomOptions = vdoms.map((vdom: VDOMResponse) => ({
    label: `${vdom.vdom_name} (${vdom.total_vips || 0} VIPs)${vdom.firewall ? ` - ${vdom.firewall.fw_name}` : ''}`, // Display name, VIPs count, and firewall name
    value: vdom.vdom_id.toString(),
  }));

  function handleApplyFilter() {
    const params = new URLSearchParams(searchParams || undefined);
    
    params.delete("vdom_id"); // Clear vdom_id filter

    if (selectedVdomId) {
      params.set("vdom_id", selectedVdomId);
    }
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }
  
  function handleClearFilter() {
    setSelectedVdomId("");
    const params = new URLSearchParams(searchParams || undefined);
    params.delete("vdom_id");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-start gap-4 mb-2">
      {/* VDOM Filter Combobox */}
      <div className="grid gap-2 min-w-[250px]">
          <Label htmlFor="vdom-filter">VDOM</Label>
          <Popover open={vdomOpen} onOpenChange={setVdomOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="combobox"
                role="combobox"
                aria-expanded={vdomOpen}
                className="w-full justify-between shadow-sm"
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
                      value={vdom.label}
                      onSelect={(currentLabel) => {
                        const selectedVdom = vdomOptions.find(v => v.label.toLowerCase() === currentLabel.toLowerCase());
                        if (selectedVdom) {
                          setSelectedVdomId(selectedVdom.value);
                        }
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
      
      <div className="flex gap-2 items-start mt-6">
        <Button
          onClick={handleApplyFilter}
          className="bg-[var(--filter-button-primary-bg)] text-[var(--filter-button-primary-text)] shadow-[var(--filter-button-primary-shadow)] hover:bg-[var(--filter-button-primary-hover-bg)] hover:shadow-[var(--filter-button-primary-hover-shadow)] transition-all"
        >
          Apply Filter
        </Button>
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className="bg-[var(--filter-button-secondary-bg)] text-[var(--filter-button-secondary-text)] border-[var(--filter-button-secondary-border)] hover:bg-[var(--filter-button-secondary-hover-bg)] hover:border-[var(--filter-button-secondary-hover-border)] hover:text-[var(--filter-button-secondary-hover-text)] transition-all"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}