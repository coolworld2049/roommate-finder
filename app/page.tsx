"use client";

import RoommateCard from "@/components/listing/RoommateCard";
import { ListingView } from "@/components/listing/ListingView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProperties } from "@/queries/supabase/properties";
import { getRoommates } from "@/queries/supabase/roommates";
import PropertyCard from "@/components/listing/PropertyCard";
import ListingMap from "@/components/listing/ListingMap";
import YMapProvider from "@/providers/ymap-provider";
import { DoorOpenIcon, UsersRoundIcon } from "lucide-react";

const Index = () => {
  return (
    <Tabs defaultValue="roommate" className="w-full">
      <TabsList className="flex flex-row items-center justify-between">
        <TabsTrigger value="roommate" className="uppercase gap-x-1 basis-1/2">
          <UsersRoundIcon />
          Roommates
        </TabsTrigger>
        <TabsTrigger value="property" className="uppercase gap-x-1 basis-1/2">
          <DoorOpenIcon />
          Rooms
        </TabsTrigger>
      </TabsList>
      <YMapProvider>
        <TabsContent value="roommate">
          <ListingView<"roommates">
            tableName="roommates"
            CardComponent={RoommateCard}
            fetchQuery={getRoommates}
            ListingMapComponent={ListingMap}
          />
        </TabsContent>
        <TabsContent value="property">
          <ListingView<"properties">
            tableName="properties"
            CardComponent={PropertyCard}
            fetchQuery={getProperties}
            ListingMapComponent={ListingMap}
          />
        </TabsContent>
      </YMapProvider>
    </Tabs>
  );
};

export default Index;
