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
import { getFirewalls, getVdoms } from "@/services/api"
import { FirewallResponse, VDOMResponse } from "@/types"

interface VdomsFilterProps {
  firewalls: FirewallResponse[];
  initialFwName?: string;
  initialVdomName?: string;
}

export function VdomsFilter({ firewalls, initialFwName, initialVdomName }: VdomsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fwNameOpen, setFwNameOpen] = React.useState(false);
  const [selectedFwName, setSelectedFwName] = React.useState(initialFwName || "");
  const [vdomName, setVdomName] = React.useState(initialVdomName || "");
  const [vdomsOpen, setVdomsOpen] = React.useState(false);
  const [vdomOptions, setVdomOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [isLoadingVdoms, setIsLoadingVdoms] = React.useState(false);

  const firewallOptions = firewalls.map((fw: FirewallResponse) => ({
    label: fw.fw_name,
    value: fw.fw_name,
  }));

  function handleApplyFilter() {
    const params = new URLSearchParams(searchParams);
    
    if (selectedFwName) {
      params.set("fw_name", selectedFwName);
    } else {
      params.delete("fw_name");
    }

    if (vdomName) {
      params.set("vdom_name", vdomName);
    } else {
      params.delete("vdom_name");
    }
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }
  
  function handleClearFilter() {
    setSelectedFwName("");
    setVdomName("");
    const params = new URLSearchParams(searchParams);
    params.delete("fw_name");
    params.delete("vdom_name");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }


  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fw-name-filter">Firewall Name</Label>
        <Popover open={fwNameOpen} onOpenChange={setFwNameOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="combobox"
              role="combobox"
              aria-expanded={fwNameOpen}
              className={cn(
                "w-[250px] justify-between shadow-sm",
                selectedFwName && "bg-[var(--combobox-item-hover-bg)] text-accent-foreground"
              )}
              id="fw-name-filter"
            >
              {selectedFwName
                ? firewallOptions.find((option) => option.value === selectedFwName)?.label
                : "Select firewall..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search firewall..." />
              <CommandList>
                <CommandEmpty>No firewall found.</CommandEmpty>
                <CommandGroup>
                  {firewallOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={async (currentValue) => {
                        const newValue = currentValue === selectedFwName ? "" : currentValue;
                        setSelectedFwName(newValue);
                        setFwNameOpen(false);

                        // Reset VDOM selection when firewall changes
                        setVdomName("");

                        if (newValue) {
                          // Fetch VDOMs for the selected firewall
                          setIsLoadingVdoms(true);
                          try {
                            const vdomsResponse = await getVdoms({ fw_name: newValue });
                            const vdoms = vdomsResponse.items;
                            setVdomOptions(vdoms.map((vdom: VDOMResponse) => ({
                              label: vdom.vdom_name,
                              value: vdom.vdom_name,
                            })));
                          } catch (error) {
                            console.error("Failed to fetch VDOMs:", error);
                            setVdomOptions([]);
                          } finally {
                            setIsLoadingVdoms(false);
                          }
                        } else {
                          // Clear VDOM options when no firewall is selected
                          setVdomOptions([]);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedFwName === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="vdom-name-filter">VDOM Name</Label>
        <Popover open={vdomsOpen} onOpenChange={setVdomsOpen}>
          <PopoverTrigger asChild disabled={!selectedFwName || isLoadingVdoms}>
            <Button
              variant="combobox"
              role="combobox"
              aria-expanded={vdomsOpen}
              className={cn(
                "w-[250px] justify-between shadow-sm",
                vdomName && "bg-[var(--combobox-item-hover-bg)] text-accent-foreground"
              )}
              id="vdom-name-filter"
            >
              {isLoadingVdoms ? (
                "Loading VDOMs..."
              ) : vdomName ? (
                vdomOptions.find((option) => option.value === vdomName)?.label || vdomName
              ) : (
                "Select VDOM..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search VDOM..." />
              <CommandList>
                <CommandEmpty>No VDOM found.</CommandEmpty>
                <CommandGroup>
                  {vdomOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setVdomName(currentValue === vdomName ? "" : currentValue);
                        setVdomsOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          vdomName === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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