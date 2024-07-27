"use client";
import { Badge } from "../ui/badge";
import {
  getInterestAreasByNames,
  getProfileWithRelations,
} from "@/queries/supabase/profiles";
import {
  GraduationCapIcon,
  MapIcon,
  TruckIcon,
  UserCircle2,
  WalletIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { DatabaseTableProps } from "../../types/database.table.types";
import {
  ListingCard,
  ListingCardContent,
  ListingCardHeader,
  ListingCardWithIcon,
} from "../ui/listing/listing-card";
import { Large, Muted, Small } from "../ui/typography";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import React from "react";
import Link from "next/link";
import { DaDataAddress } from "react-dadata";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { dobToAge } from "@/utlils/convert";

export const RoommateCard = ({
  data: roommate,
  className,
  ...props
}: DatabaseTableProps<"roommates"> & React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();

  const { data: profile } = useQuery(
    getProfileWithRelations(supabase, roommate.profile_id)
  );

  const { data: interest_areas } = useQuery(
    getInterestAreasByNames(supabase, profile?.interest_areas!)
  );

  let addressData = roommate.address_data as Record<
    string,
    any
  > as DaDataAddress;

  const badgeIconSize = 16;

  return (
    <ListingCard {...props} className={cn("items-center", className)}>
      <ListingCardHeader className="items-center p-3">
        <Avatar className={cn("w-56 h-56 rounded-full")}>
          <AvatarImage src={profile?.avatar!} className="object-cover" />
          <AvatarFallback>
            <UserCircle2
              className="w-full h-full text-muted-foreground"
              strokeWidth={0.5}
            />
          </AvatarFallback>
        </Avatar>
        <Large className="max-w-xl">
          {profile?.full_name} &#183; {dobToAge(profile?.dob!)}
        </Large>
      </ListingCardHeader>
      <Link href={`/roommate/${roommate.id}`}>
        <ListingCardContent className="max-w-2xl min-w-2xl w-full">
          <Large className="line-clamp-1 max-w-xl">{roommate.title}</Large>
          <div className="flex flex-row flex-wrap gap-x-1.5 gap-y-1 items-start">
            {profile?.profile_universities && (
              <ListingCardWithIcon
                icon={<GraduationCapIcon size={badgeIconSize + 6} />}
              >
                <Small>{profile?.profile_universities?.university_name}</Small>
              </ListingCardWithIcon>
            )}
            {interest_areas &&
              interest_areas.length > 0 &&
              interest_areas.map((interest) => (
                <div className="flex flex-row gap-1 items-center">
                  <Badge variant={"outline"}>
                    <ListingCardWithIcon
                      icon={
                        interest.icon_svg && (
                          <img
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(interest.icon_svg)}`}
                            className="size-4 dark:invert"
                          />
                        )
                      }
                    >
                      <Small>{interest.name}</Small>
                    </ListingCardWithIcon>
                  </Badge>
                </div>
              ))}
          </div>
          <div className="py-1">
            <Muted className="line-clamp-3">{roommate.description}</Muted>
          </div>
          <div className="flex flex-row flex-wrap gap-1 items-center">
            <Badge
              variant={"outline"}
              className="flex fles-row gap-1 text-lg rounded-lg"
            >
              <ListingCardWithIcon
                icon={<WalletIcon size={badgeIconSize + 2} />}
              >
                <Large className="flex flex-row items-center gap-1 justify-start">
                  {roommate.budget_month.toLocaleString()}
                  <Muted>RUB/month</Muted>
                </Large>
              </ListingCardWithIcon>
            </Badge>
            <Badge variant={"default"}>
              <ListingCardWithIcon
                icon={<TruckIcon size={badgeIconSize + 2} />}
              >
                <Small>Move in {formatDate(roommate.move_in_date, "PP")}</Small>
              </ListingCardWithIcon>
            </Badge>
          </div>
          <div>
            <Badge variant={"secondary"} className="rounded-full">
              <ListingCardWithIcon icon={<MapIcon size={badgeIconSize} />}>
                <>Looking in</>
                <Small className="underline">
                  {addressData.city_with_type}{" "}
                  {addressData.city_district_with_type}
                  {addressData.street_with_type}
                </Small>
              </ListingCardWithIcon>
            </Badge>
          </div>
        </ListingCardContent>
      </Link>
    </ListingCard>
  );
};

export default RoommateCard;
