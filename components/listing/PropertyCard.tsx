"use client";

import {
  Building,
  CalendarDaysIcon,
  ChevronDownIcon,
  DoorOpenIcon,
  FootprintsIcon,
  MapPinIcon,
  ReceiptTextIcon,
  RulerIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import ListingCardCarousel from "../ui/listing/listing-card-carousel";
import React from "react";
import { DatabaseTableProps } from "../../types/database.table.types";
import {
  ListingCard,
  ListingCardContent,
  ListingCardWithIcon,
} from "../ui/listing/listing-card";
import { H1, H2, H3, H4, Large, Muted, Small } from "../ui/typography";
import { formatDate } from "date-fns";
import { MetroStationIcon } from "@/components/metro-station/MetroStationIcon";
import { DaDataMetroStation } from "@/lib/dadata/types";
import Link from "next/link";
import {
  getPropertyAmeninities,
  getPropertySummary,
} from "@/queries/supabase/properties";
import { DaDataAddress } from "react-dadata";
import { cn } from "@/lib/utils";
import { getDistance } from "geolib";
import { getProfileUniversity } from "@/queries/supabase/profiles";

const PropertyCard = ({
  user,
  data: property,
  carouselProps,
  imageMaxHeigth,
  imageMinHeigth,
  className,
  ...props
}: DatabaseTableProps<"properties"> & {
  carouselProps?: React.HTMLAttributes<HTMLDivElement>;
  imageMaxHeigth?: number;
  imageMinHeigth?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();
  const { data: current_user_university } = useQuery(
    getProfileUniversity(supabase, user?.id!)
  );
  const { data: property_amenities } = useQuery(
    getPropertyAmeninities(supabase, property.id)
  );

  const { data: property_summary } = useQuery(
    getPropertySummary(supabase, property.id)
  );

  let addressData = property.address_data as Record<
    string,
    any
  > as DaDataAddress;

  let nearest_metro_station = property.nearest_metro_station as Record<
    string,
    any
  >;

  const distanceToCurrentUserUniversity =
    property.geo_lat &&
    property.geo_lon &&
    current_user_university?.geo_lat &&
    current_user_university?.geo_lon &&
    getDistance(
      { lat: property.geo_lat, lon: property.geo_lon },
      {
        lat: current_user_university?.geo_lat,
        lon: current_user_university?.geo_lon,
      }
    ) / 1000;

  const badgeIconSize = 16;

  const hasRentPerTenant = user?.id != property.profile_id ? 1 : 0;

  return (
    <ListingCard
      className={cn("flex-wrap", className)}
      {...props}
      key={props.id}
    >
      {property?.images && (
        <ListingCardCarousel
          images={property?.images}
          className={cn(carouselProps?.className)}
          {...carouselProps}
        />
      )}
      <Link href={`/property/${property.id}`}>
        <ListingCardContent className="max-w-xl">
          <H4 className="line-clamp-1">{property?.title}</H4>
          <ListingCardWithIcon icon={<MapPinIcon size={badgeIconSize} />}>
            {addressData.city_with_type}, {addressData.street_with_type}
            {distanceToCurrentUserUniversity && (
              <ListingCardWithIcon icon={<RulerIcon size={badgeIconSize} />}>
                <Small>
                  {Number(
                    distanceToCurrentUserUniversity?.toFixed(0)
                  ).toLocaleString()}{" "}
                  km to{" "}
                  <span className="underline">
                    {current_user_university.university_name}
                  </span>
                </Small>
              </ListingCardWithIcon>
            )}
          </ListingCardWithIcon>
          {property.nearest_metro_station && (
            <div className="flex flex-row items-center">
              <ListingCardWithIcon
                icon={
                  <MetroStationIcon
                    color={
                      (
                        property.nearest_metro_station as DaDataMetroStation["data"]
                      ).color
                    }
                  />
                }
              >
                {
                  (property.nearest_metro_station as DaDataMetroStation["data"])
                    .name
                }
              </ListingCardWithIcon>
              {property.geo_lat && property.geo_lon && (
                <ListingCardWithIcon
                  icon={<FootprintsIcon size={badgeIconSize + 4} />}
                  className="ml-3"
                >
                  <Small>
                    {Number(
                      (
                        getDistance(
                          { lat: property.geo_lat, lon: property.geo_lon },
                          {
                            lat: nearest_metro_station?.geo_lat,
                            lon: nearest_metro_station?.geo_lon,
                          }
                        ) / 1000
                      )?.toFixed(0)
                    ).toLocaleString()}{" "}
                    km
                  </Small>
                </ListingCardWithIcon>
              )}
            </div>
          )}
          <Large className="flex flex-row flex-wrap items-center gap-1 justify-start">
            {property_summary?.tenants_number &&
            property_summary?.tenants_number > 0 ? (
              <Badge
                className="flex fles-row gap-1 text-lg"
                variant={"outline"}
              >
                {Math.round(
                  property?.rent_price_month /
                    (property_summary?.tenants_number + hasRentPerTenant)
                ).toLocaleString()}
                <Muted> RUB/tenant</Muted>
              </Badge>
            ) : (
              <></>
            )}
            {property?.rent_price_month.toLocaleString()}
            <Muted> RUB/month</Muted>
            {property?.bills_included && (
              <Small className="underline">bills included</Small>
            )}
            {property?.deposit_amount !== null && (
              <Small className="underline">deposit required</Small>
            )}
          </Large>
          {property_amenities && property_amenities.length > 0 && (
            <div className="flex flex-row flex-wrap gap-x-1.5 gap-y-1 items-start">
              {property_amenities.map((v) => {
                return (
                  v.amenities?.icon_svg && (
                    <div className="flex flex-row items-center gap-1">
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(v.amenities?.icon_svg)}`}
                        className={`size-4 dark:invert`}
                      />
                      <Small>{v.amenities?.name}</Small>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <Badge>
              <ListingCardWithIcon icon={<Building size={badgeIconSize} />}>
                {property?.property_type}
              </ListingCardWithIcon>
            </Badge>

            {property_summary?.rooms_number != 0 && (
              <Badge>
                <ListingCardWithIcon
                  icon={<DoorOpenIcon size={badgeIconSize} />}
                >
                  <span className="underline">
                    {property_summary?.rooms_number} rooms
                  </span>
                </ListingCardWithIcon>
              </Badge>
            )}
            {property_summary?.tenants_number != 0 && (
              <Badge>
                <UsersIcon className="mr-1" size={badgeIconSize} />
                <Small>
                  {property_summary?.tenants_number} tenants {"("}
                  {property_summary?.tenants_age_min !=
                  property_summary?.tenants_age_max ? (
                    <span>
                      {property_summary?.tenants_age_min} -{" "}
                      {property_summary?.tenants_age_max}
                    </span>
                  ) : (
                    <span>{property_summary?.tenants_age_min}</span>
                  )}{" "}
                  age{")"}
                </Small>
              </Badge>
            )}
            {property_summary?.available_from_min && (
              <Badge
                variant={"secondary"}
                className="rounded-full flex flex-row items-center gap-1"
              >
                <CalendarDaysIcon size={badgeIconSize} />
                <Small>
                  Available{" "}
                  {property_summary.available_from_max &&
                  property_summary.available_from_min !=
                    property_summary.available_from_max
                    ? `${formatDate(property_summary.available_from_min, "PP")} - ${formatDate(property_summary.available_from_max!, "PP")}`
                    : formatDate(property_summary.available_from_min, "PP")}
                </Small>
              </Badge>
            )}
          </div>
        </ListingCardContent>
      </Link>
    </ListingCard>
  );
};

export default PropertyCard;
