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

export interface ComboboxOption {
  value: string;   // el ID real que vas a guardar
  label: string;   // lo que se muestra
  disabled?: boolean;
  extra?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;                      // el ID seleccionado
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsMessage?: string;
  className?: string;
  disabled?: boolean;
  // si querés customizar qué se busca
  getSearchValue?: (option: ComboboxOption) => string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  noResultsMessage = "No results found.",
  className,
  disabled,
  getSearchValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find(
    (option) => option.value.toLowerCase() === value?.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {selectedOption?.label ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                // esto es lo que el buscador va a usar
                const searchValue = getSearchValue
                  ? getSearchValue(option)
                  : option.label

                return (
                  <CommandItem
                    key={option.value}
                    // importante: que el search use el label
                    value={searchValue}
                    onSelect={() => {
                      // devolvemos el ID real
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      option.disabled && "text-grey-600"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
