"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ComboboxProps = {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ options, value, onChange, placeholder }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-[var(--combobox-height)] text-[var(--combobox-font-size)] px-[var(--combobox-padding-x)] rounded-[var(--combobox-border-radius)]"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder || "Select option..."}
            <ChevronsUpDown className="ml-[var(--combobox-trigger-gap)] h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--combobox-content-width)] p-0">
          <Command>
            <CommandInput placeholder={placeholder || "Search..."} className="h-[var(--combobox-height)]" />
            <CommandEmpty className="py-[var(--combobox-empty-padding)] text-center text-sm">
              No results found.
            </CommandEmpty>
            <CommandGroup className="max-h-[var(--combobox-content-max-height)] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className="h-[var(--combobox-item-height)] px-[var(--combobox-item-padding)]"
                >
                  <Check
                    className={cn(
                      "mr-[var(--combobox-item-gap)] h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
Combobox.displayName = "Combobox";

export const ComboboxTrigger = PopoverTrigger;
export const ComboboxContent = PopoverContent;
export const ComboboxItem = CommandItem;
export const ComboboxInput = CommandInput;
export const ComboboxList = CommandList;
export const ComboboxEmpty = CommandEmpty;
export const ComboboxGroup = CommandGroup;