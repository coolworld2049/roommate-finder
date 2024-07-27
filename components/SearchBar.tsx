"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const SearchBar = () => {
  return (
    <div className="flex flex-row border p-1.5 rounded-full mx-auto max-w-3xl">
      <Input className="rounded-full shadow-none border-none" />
      <div>
        <Separator orientation="vertical" className="mx-3" />
      </div>
      <div className="flex flex-row flex-nowrap gap-1">
        <Button className="rounded-full">Renters</Button>
        <Button className="rounded-full">Rooms</Button>
        <Button className="rounded-full">Filters</Button>
        <Button className="rounded-full">Map</Button>
      </div>
    </div>
  );
};

export default SearchBar;
