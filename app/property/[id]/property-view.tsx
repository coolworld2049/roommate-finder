"use client";

import React, { useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getPropertyWithRelationsById } from "@/queries/supabase/properties";
import {
  ListingCard,
  ListingCardContent,
} from "@/components/ui/listing/listing-card";
import { H2, H4, Large, Small } from "@/components/ui/typography";
import { PropertyPageProps } from "@/app/property/[id]/page";
import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/extension/carousel";
import { DaDataAddress } from "react-dadata";
import { getProfile } from "@/queries/supabase/profiles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "date-fns";
import { Tables } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPreferences } from "@/queries/supabase/preferences";
import { GridDetailItem } from "@/components/ui/custom/GridDetailItem";
import { ListingProfileCard } from "@/components/listing/ListingProfileCard";
import useWindowDimensions from "@/hooks/window-dimension";
import {
  YMap,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapMarker,
} from "ymap3-components";
import { YMap as YMapsYMap } from "@yandex/ymaps3-types";
import { Circle } from "lucide-react";

export const PropertyImageCarousel = ({ images }: { images: string[] }) => {
  const { width } = useWindowDimensions();

  return (
    <Carousel orientation="vertical" className="flex">
      <div className="relative w-full">
        <CarouselMainContainer className="h-96 w-full">
          {images.map((image, index) => (
            <SliderMainItem key={index} className="p-0">
              <img
                src={image}
                alt={`${image}-${index}`}
                className="object-cover h-96 w-full rounded-md"
              />
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
      </div>
      {width && width > 1000 && (
        <CarouselThumbsContainer className="h-96 basis-3/4">
          <ScrollArea>
            {images.map((image, index) => (
              <SliderThumbItem
                key={index}
                index={index}
                className="rounded-md bg-transparent basis-1/4 p-0"
                containerClassName="h-56"
              >
                <span className="border border-muted flex items-center justify-center h-full w-full cursor-pointer bg-background">
                  <img
                    src={image}
                    alt={`${image}-${index}`}
                    className="object-cover w-full h-full rounded-md"
                  />
                </span>
              </SliderThumbItem>
            ))}
          </ScrollArea>
        </CarouselThumbsContainer>
      )}
    </Carousel>
  );
};

export const PropertyDetails = ({
  property,
  propertySummary,
}: {
  property: Tables<"properties">;
  propertySummary: Tables<"property_room_tenant_summary">;
}) => {
  const addressData: DaDataAddress | undefined =
    property?.address_data as Record<string, any> as DaDataAddress;

  return (
    <div className="grid grid-cols-2 items-start md:items-center justify-center">
      <GridDetailItem
        label="Location"
        value={`${addressData?.city_with_type}, ${addressData?.street_with_type}`}
      />
      <GridDetailItem
        label="Rent price"
        value={`${property.rent_price_month.toLocaleString()} RUB/month`}
      />
      {property.deposit_amount && (
        <GridDetailItem
          label="Deposit"
          value={`${property.deposit_amount.toLocaleString()} RUB/month`}
        />
      )}
      {propertySummary?.tenants_number &&
      propertySummary?.tenants_number > 0 ? (
        <GridDetailItem
          label="Rent price per tenant (with you)"
          value={`${Math.round(property.rent_price_month / (propertySummary.tenants_number + 1)).toLocaleString()} RUB/month`}
        />
      ) : undefined}
      {propertySummary?.available_from_min &&
        propertySummary?.available_from_max && (
          <GridDetailItem
            label="Available"
            value={formatDateRange({
              start: propertySummary?.available_from_min,
              end: propertySummary?.available_from_max,
            })}
          />
        )}
      <GridDetailItem label="Type" value={property.property_type} />
      <GridDetailItem
        label="Layout"
        value={`${propertySummary?.rooms_number} rooms · ${property.bathrooms_number} bath`}
      />
      <GridDetailItem
        label="Stay duration"
        value={`${property.stay_duration.replaceAll("_", " ")}`}
      />
    </div>
  );
};

const formatDateRange = ({ start, end }: { start: string; end: string }) => (
  <div className="flex flex-row flex-wrap gap-x-1 items-center">
    {start && <Large className="font-normal">{formatDate(start, "PP")}</Large>}
    {end && "-"}
    {end && <Large className="font-normal">{formatDate(end, "PP")}</Large>}
  </div>
);

export const AmenitiesList = ({
  amenities,
}: {
  amenities: { amenities: Tables<"amenities"> | null }[];
}) => (
  <div className="flex flex-row flex-wrap gap-1 items-start">
    {amenities.map(
      (amenity) =>
        amenity.amenities?.icon_svg && (
          <div
            key={amenity.amenities.id}
            className="flex flex-row items-center gap-1"
          >
            <Badge
              variant={"outline"}
              className="rounded-full flex flex-row gap-1"
            >
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(amenity.amenities.icon_svg)}`}
                className={`size-5 dark:invert`}
              />
              <Small className="">{amenity.amenities.name}</Small>
            </Badge>
          </div>
        )
    )}
  </div>
);

export const RoomTenantCard = ({
  room_tenant,
}: {
  room_tenant: Tables<"room_tenants">;
}) => (
  <div className="flex flex-row gap-3 items-center">
    <img
      src={room_tenant.avatar!}
      className="rounded-full w-10 h-10 object-cover"
    />
    <div>
      <Small className="text-md">
        {room_tenant.full_name} &#183; {room_tenant.age}
        {room_tenant.gender != "unknown" && <> &#183; {room_tenant.gender}</>}
      </Small>
    </div>
  </div>
);

export const RoomCard = ({
  room,
}: {
  room: Tables<"rooms"> & {
    room_tenants: Tables<"room_tenants">[];
  };
  index?: number;
}) => {
  const supabase = createClient();

  const { data: room_amenities } = useQuery(
    supabase
      .from("room_amenities")
      .select("room_id, amenities(*)")
      .eq("room_id", room.id)
      .eq("value", true)
  );

  return (
    <ListingCard className="flex flex-col md:flex-row items-start">
      {room.images && room.images.length > 0 ? (
        <div className="basis-1/4 w-full h-full">
          <img
            src={room.images[0]}
            className="rounded-xl w-full md:w-60 h-60 object-cover"
          />
        </div>
      ) : (
        <></>
      )}
      <ListingCardContent className="basis-3/4 max-w-3xl space-y-2">
        <H4 className="line-clamp-2">{room.title}</H4>

        <div className="flex flex-row flex-wrap items-center gap-1">
          <Badge
            variant={"default"}
            className={cn(
              "rounded-full text-black",
              room.status == "active" && "bg-green-300",
              room.status == "paused" && "bg-orange-300"
            )}
          >
            <Small>{room.status}</Small>
          </Badge>
          <Badge variant={"default"} className="rounded-full">
            {room.room_tenants.length ? (
              <Small>{room.room_tenants.length} tenants</Small>
            ) : (
              <Small>free room</Small>
            )}
          </Badge>
          <Badge variant={"default"} className="rounded-full">
            <Small>{room.room_type}</Small>
          </Badge>
        </div>

        <div>
          {room_amenities && <AmenitiesList amenities={room_amenities} />}
        </div>

        {room.status == "active" && (
          <div>
            <Small className="text-md underline">
              <span>Available from </span>
              {room.available_from && formatDate(room.available_from, "PPP")}
            </Small>
          </div>
        )}
        {room.room_tenants && room.room_tenants.length > 0 && (
          <>
            <Large className="text-muted-foreground">Tenants</Large>
            <div className="flex flex-row gap-3">
              {room.room_tenants.map((room_tenant) => {
                return <RoomTenantCard room_tenant={room_tenant} />;
              })}
            </div>
          </>
        )}
      </ListingCardContent>
    </ListingCard>
  );
};

const PropertyView = ({
  params,
}: PropertyPageProps & React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();

  const { data: property } = useQuery(
    getPropertyWithRelationsById(supabase, params.id)
  );
  const { data: profile } = useQuery(
    getProfile(supabase, property?.profile_id!)
  );

  const { data: property_rooms } = useQuery(
    supabase
      .from("rooms")
      .select("*, room_tenants(*)")
      .eq("property_id", property?.id!)
      .in("status", ["active", "paused"])
  );

  const { data: property_amenities } = useQuery(
    supabase
      .from("property_amenities")
      .select("amenities(*)")
      .eq("property_id", property?.id!)
      .eq("value", true)
  );

  const { data: property_summary } = useQuery(
    supabase
      .from("property_room_tenant_summary")
      .select("*")
      .eq("property_id", property?.id!)
      .limit(1)
      .single()
  );
  const { data: preferences } = useQuery(
    getPreferences({ client: supabase, category: ["property", "roommate"] })
  );

  return (
    <div className="container px-0 py-3 max-w-7xl">
      <div className="mb-3">
        {property?.images && (
          <PropertyImageCarousel images={property?.images} />
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start">
        <div className="w-full basis-3/4 space-y-3">
          <H2>{property?.title}</H2>
          {property && property_summary && (
            <PropertyDetails
              property={property}
              propertySummary={property_summary}
            />
          )}
          {property?.description && (
            <div>
              <Large>About the listing</Large>
              <Large className="mt-0 font-normal">{property.description}</Large>
            </div>
          )}
          <div className="space-y-2">
            <Large>Amenities in the home</Large>
            {property_amenities && (
              <AmenitiesList amenities={property_amenities} />
            )}
          </div>
          <div>
            <Large>Preferences</Large>
            <div className="grid grid-cols-2 items-start md:items-center justify-center">
              {property?.property_in_preferences.map((v) => {
                const pref = preferences?.find((p) => p.id == v.preference_id);
                return (
                  pref && (
                    <>
                      <Large className="lowercase text-muted-foreground">
                        {pref?.name.replaceAll("_", " ")}
                      </Large>
                      <Large className="font-normal">
                        {v.value.replaceAll("_", " ")}
                      </Large>
                    </>
                  )
                );
              })}
            </div>
          </div>
          <Large className="uppercase">Rooms</Large>
          {property_rooms &&
            property_rooms.map((room, i) => {
              return <RoomCard room={room} index={i + 1} />;
            })}
          {/* <div className="min-w-full min-h-full absolute">
            <YMap
              key={"property-map"}
              location={{ center: [37.64, 55.76], zoom: 9 }}
              mode="vector"
              zoomStrategy="zoomToPointer"
            >
              <YMapDefaultSchemeLayer />
              <YMapDefaultFeaturesLayer />
              {property?.geo_lon && property?.geo_lat && (
                <YMapMarker coordinates={[property.geo_lon, property.geo_lat]}>
                  <Circle
                    className={cn(
                      `cursor-pointer translate-x-[-50%] translate-y-[-50%] fill-red-200/55 stroke-red-400/55`
                    )}
                    strokeWidth={0.25}
                    size={100}
                  />
                </YMapMarker>
              )}
            </YMap>
          </div> */}
        </div>
        <div className="basis-1/4 space-y-2 md:border-l md:pl-3">
          {property?.advertising_as && (
            <H4 className="uppercase">
              {property.advertising_as.replaceAll("_", " ")}
            </H4>
          )}
          {profile && <ListingProfileCard profile={profile} />}
        </div>
      </div>
    </div>
  );
};

export default PropertyView;
