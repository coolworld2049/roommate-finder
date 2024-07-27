import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Large, Small } from "@/components/ui/typography";
import { DualSlider } from "../extension/dual-slider";
import { Label } from "../ui/label";
import { createClient } from "@/lib/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import { ListingViewProps } from "./ListingView";
import { Input } from "../ui/input";
import { FilterIcon, FilterXIcon, SearchIcon } from "lucide-react";

type fetchQueryReturnType<T extends "properties" | "rooms" | "roommates"> =
  ReturnType<ListingViewProps<T>["fetchQuery"]>;

const ListingFilters = <T extends "properties" | "rooms" | "roommates">({
  tableName,
  fetchQuery,
  applyFilters,
  children,
}: {
  tableName: ListingViewProps<T>["tableName"];
  fetchQuery: ListingViewProps<T>["fetchQuery"];
  applyFilters: (newFn: fetchQueryReturnType<T>) => void;
  children?: React.ReactNode;
}) => {
  const supabase = createClient();
  const date = new Date();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [price, setPrice] = useState<number[] | null>(null);
  const [moveInDate, setMoveInDate] = useState<Date | null>();
  const [availableFromDate, setAvailableFromDate] = useState<Date | null>();
  const [searchQuery, setSearchQuery] = useState("");

  function buildFilterChain() {
    let filterChain = fetchQuery(supabase);
    let searchQueryNew = searchQuery.replaceAll("-", "_") + "%";
    let sq = `address_data->>city.ilike.${searchQueryNew},`;

    if (tableName == "roommates") {
      let fc = filterChain as ReturnType<
        ListingViewProps<"roommates">["fetchQuery"]
      >;
      if (price) {
        fc.gte("budget_month", price[0]).lte("budget_month", price[1]);
      }
      if (moveInDate) {
        fc.gte("move_in_date", moveInDate.toDateString()).order(
          "move_in_date",
          {
            ascending: true,
          }
        );
      }
      if (searchQuery.length > 0) {
        fc.or(sq);
      }
    } else if (tableName == "properties") {
      let fc = filterChain as ReturnType<
        ListingViewProps<"properties">["fetchQuery"]
      >;
      if (price) {
        fc.gte("rent_price_month", price[0]).lte("rent_price_month", price[1]);
      }
      if (searchQuery.length > 0) {
        sq += `,nearest_metro_station->>name.ilike.${searchQueryNew}`;
        fc.or(sq);
      }
    }
    if (process.env.NODE_ENV == "development") {
      console.log(filterChain["url"].searchParams.toString());
    }
    return filterChain as ReturnType<ListingViewProps<T>["fetchQuery"]>;
  }

  function applyAll() {
    applyFilters(buildFilterChain());
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-row flex-wrap w-full items-start gap-2">
      <Input
        className="rounded-full shadow-md w-full md:max-w-xs"
        placeholder="Type city, metro"
        onKeyDown={(e) => e.key == "Enter" && applyAll()}
        onChangeCapture={(v) => {
          if (v.currentTarget.value.length > 0) {
            setSearchQuery(v.currentTarget.value);
          } else {
            applyFilters(fetchQuery(supabase));
          }
        }}
      />
      <Button onClick={applyAll} size={"icon"} variant={"ghost"}>
        <SearchIcon />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>
          <Button size={"icon"} variant={"ghost"}>
            <FilterIcon />
          </Button>
        </DialogTrigger>
        <DialogContent dialogOverlayClassName="bg-black/0">
          <div className="grid grid-cols-1 gap-4 items-center p-3">
            <Label>
              <Large>Price</Large>
            </Label>
            <DualSlider
              min={tableName == "roommates" ? 1000 : 10000}
              max={tableName == "roommates" ? 100000 : 200000}
              minStepsBetweenThumbs={2}
              step={1000}
              onValueChange={setPrice}
            />
            {tableName == "roommates" && (
              <>
                <Label>
                  <Large>Move in after</Large>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("pl-3 text-left font-normal")}
                    >
                      {moveInDate ? formatDate(moveInDate, "PPP") : ""}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      onSelect={(v) => v && setMoveInDate(v)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
            {tableName == "properties" && (
              <>
                <Label>
                  <Large>Available from</Large>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal",
                        !availableFromDate && "text-muted-foreground"
                      )}
                    >
                      {availableFromDate ? (
                        formatDate(new Date(availableFromDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      selected={availableFromDate ?? date}
                      fromDate={date}
                      onSelect={(v) => v && setMoveInDate(v)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
          <div className="flex flex-row gap-1 pt-3 w-full">
            <Button className="w-full" onClick={applyAll}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => applyFilters(fetchQuery(supabase))}
        size={"icon"}
        variant={"ghost"}
      >
        <FilterXIcon />
      </Button>
      {children}
    </div>
  );
};

export default ListingFilters;
