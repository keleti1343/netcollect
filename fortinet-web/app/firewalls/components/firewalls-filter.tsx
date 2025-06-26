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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { getFirewalls, getVdoms } from "@/services/api"
import { Label } from "@/components/ui/label"

interface FirewallsFilterProps {
  initialFirewallName?: string;
}

export function FirewallsFilter({ initialFirewallName }: FirewallsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false)
  const [firewallName, setFirewallName] = React.useState(initialFirewallName || "")
  const [firewallOptions, setFirewallOptions] = React.useState<{ label: string; value: string; vdoms: string[] }[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadFirewallOptions() {
      setLoading(true);
      try {
        const { items: firewalls } = await getFirewalls();
const options = await Promise.all(firewalls.map(async (fw) => {
  try {
    const { items: vdoms } = await getVdoms({ fw_name: fw.fw_name });
    return {
      label: fw.fw_name,
      value: fw.fw_name,
      vdoms: vdoms.length > 0 ? vdoms.map(vdom => vdom.vdom_name) : ["No VDOMs found"]
    };
  } catch (error) {
    console.error(`Failed to load vdoms for firewall ${fw.fw_name}:`, error);
    return {
      label: fw.fw_name,
      value: fw.fw_name,
      vdoms: ["No VDOMs found"]
    };
  }
}));
        setFirewallOptions(options);
      } catch (error) {
        console.error("Failed to load firewall options:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFirewallOptions();
  }, []);

  function handleApplyFilter() {
    const params = new URLSearchParams(searchParams);
    
    if (firewallName) {
      params.set("fw_name", firewallName);
    } else {
      params.delete("fw_name");
    }
    
    // Reset to page 1 when filter changes
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  }
  
  function handleClearFilter() {
    setFirewallName("");
    const params = new URLSearchParams(searchParams);
    params.delete("fw_name");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fw-name">Firewall Name</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between shadow-sm"
            >
              {firewallName
                ? firewallOptions.find((option) => option.value === firewallName)?.label
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
  <CommandItem key={option.value} value={option.value}>
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                firewallName === option.value ? "opacity-100" : "opacity-0"
              )}
            />
            {option.label}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">VDOMs</p>
            {option.vdoms.length > 0 ? (
              <ul className="list-disc list-inside">
                {option.vdoms.map((vdom, index) => (
                  <li key={index} className="text-sm">{vdom}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">No VDOMs found</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
    <div
      className="absolute inset-0"
      onClick={() => {
        setFirewallName(option.value);
        setOpen(false);
      }}
    />
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
