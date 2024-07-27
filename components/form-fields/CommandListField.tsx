import React, { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface CommandListFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  items: { id: number; name: string }[];
  onChange?: (id: number) => void;
}

const CommandListField = ({
  control,
  name,
  label,
  items,
  onChange,
}: CommandListFieldProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean | undefined>(
    undefined
  );
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[200px] justify-between",
                    !field.value && "text-muted-foreground",
                    "w-full text-wrap text-start font-normal"
                  )}
                >
                  {field.value
                    ? items &&
                      items.find((item) => item.id === field.value)?.name
                    : "Select"}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search..." className="h-9" />
                <CommandEmpty>Not found</CommandEmpty>
                <CommandList>
                  {items && (
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          className="max-w-xs md:max-w-xl"
                          value={item.name}
                          key={item.id}
                          onSelect={() => {
                            const isSelected = item.id === field.value;
                            if (isSelected) {
                              field.onChange(null);
                            } else {
                              field.onChange(item.id);
                              onChange && onChange(item.id!);
                            }
                            setIsPopoverOpen(false);
                          }}
                        >
                          {item.name}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              item.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CommandListField;
