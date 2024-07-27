"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { adStatusSchema } from "@/types/database.types.zod";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Control } from "react-hook-form";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { z } from "zod";
import { Muted, Small } from "../ui/typography";

const StatusSelectField = ({
  control,
  name,
  onSelect,
  statusDescriptions,
}: {
  control: Control<any, any>;
  name: string;
  onSelect: (value: string) => void;
  statusDescriptions?: {
    status: z.infer<typeof adStatusSchema>;
    description: string;
  }[];
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-x-2">
          <FormLabel>Status</FormLabel>
          <Popover>
            <PopoverTrigger asChild disabled={!field.value}>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  size={field.value ? "default" : "icon"}
                  className={cn("justify-between py-0 ")}
                >
                  {field.value
                    ? adStatusSchema.options.find(
                        (v) => v.value === field.value
                      )?.value
                    : ""}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandList>
                  {adStatusSchema.options.map((v) => {
                    const description = statusDescriptions?.find(
                      (d) => d.status == v.value
                    )?.description;
                    return (
                      <CommandGroup>
                        <CommandItem
                          value={v.value}
                          key={v.value}
                          onSelect={(new_v) =>
                            new_v !== field.value && onSelect(new_v)
                          }
                        >
                          <div className="flex flex-col gap-1 items-start">
                            {v.value}
                            {description && (
                              <Muted className="lowercase">{description}</Muted>
                            )}
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              v.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      </CommandGroup>
                    );
                  })}
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

export default StatusSelectField;
