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
      <div ref={ref}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder || "Select..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
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