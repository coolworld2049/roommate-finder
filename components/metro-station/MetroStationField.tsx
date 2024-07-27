"use client";

import { Control } from "react-hook-form";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { DaDataMetroStation } from "../../lib/dadata/types";
import { MetroStationIcon } from "./MetroStationIcon";
import { dadataSuggestMetro } from "@/lib/dadata/suggest-metro";
import { z } from "zod";
import { propertyWithRelationsFormSchema } from "@/app/_schemas/property";

export const MetroStationField = ({
  control,
  name,
  filters,
  onChangeMetroStation,
  ...props
}: {
  control: Control<z.infer<typeof propertyWithRelationsFormSchema>, any>;
  filters?: Record<string, string>[];
  name: "nearest_metro_station";
  onChangeMetroStation?: (lat: number, lon: number) => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [metroStations, setMetroStations] = useState<DaDataMetroStation[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounce(
    searchTerm,
    process.env.NODE_ENV == "development" ? 1000 : 500
  );

  useEffect(() => {
    const func = async () => {
      if (
        debouncedSearchTerm &&
        debouncedSearchTerm != "" &&
        debouncedSearchTerm.length >= 2
      ) {
        const { suggestions } = await dadataSuggestMetro(
          debouncedSearchTerm,
          filters
        );
        setMetroStations(suggestions);
        setDebouncedSearchTerm("");
      }
    };
    func();
  }, [debouncedSearchTerm]);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean | undefined>(
    false
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as DaDataMetroStation["data"];
        return (
          <FormItem className="flex flex-col" {...props}>
            <FormLabel>Nearest Metro Station</FormLabel>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !value && "text-muted-foreground",
                      "w-full text-wrap text-start font-normal"
                    )}
                  >
                    {value ? (
                      <MetroStationIcon color={value.color}>
                        {value.name} ({value.line_name})
                      </MetroStationIcon>
                    ) : (
                      "Select"
                    )}

                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Start typing metro station..."
                    className="h-9"
                    onValueChange={setSearchTerm}
                  />
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandList>
                    {metroStations && (
                      <CommandGroup>
                        {metroStations.map((item, index) => {
                          const uid = `${item.data.name}-${item.data.line_name}`;
                          return (
                            <CommandItem
                              className="max-w-xs md:max-w-xl"
                              value={uid}
                              key={index}
                              onSelect={() => {
                                const isSelected =
                                  item.data.name === value?.name;
                                if (isSelected) {
                                  field.onChange(null);
                                } else {
                                  onChangeMetroStation &&
                                    onChangeMetroStation(
                                      item.data.geo_lat,
                                      item.data.geo_lon
                                    );
                                  field.onChange(item.data);
                                }
                                setIsPopoverOpen(false);
                              }}
                            >
                              <MetroStationIcon color={item.data.color}>
                                {item.data.name} ({item.data.line_name})
                              </MetroStationIcon>
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  uid === `${value?.name}-${value?.line_name}`
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
