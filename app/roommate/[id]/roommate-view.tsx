"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { H1, H2, H3, H4, Large } from "@/components/ui/typography";
import { RoommatePageProps } from "@/app/roommate/[id]/page";
import { DaDataAddress } from "react-dadata";
import { getProfileWithRelations } from "@/queries/supabase/profiles";
import { formatDate } from "date-fns";
import { Tables } from "@/types/database.types";
import { getRoommateWithRelationsById } from "@/queries/supabase/roommates";

import { getPreferences } from "@/queries/supabase/preferences";
import { ListingProfileCard } from "../../../components/listing/ListingProfileCard";
import { GridDetailItem } from "../../../components/ui/custom/GridDetailItem";

export const RoommateDetails = ({
  roommate,
}: {
  roommate: Tables<"roommates">;
}) => {
  const addressData: DaDataAddress | undefined =
    roommate?.address_data as Record<string, any> as DaDataAddress;

  return (
    <div className="grid grid-cols-2 items-start md:items-center justify-center">
      <GridDetailItem
        label="Looking in"
        value={`${addressData?.city_with_type ?? ""}, ${addressData?.street_with_type ?? ""}`}
      />
      <GridDetailItem
        label="Budget"
        value={`${roommate.budget_month.toLocaleString()} RUB/month`}
      />
      <GridDetailItem
        label="Move in"
        value={formatDate(roommate.move_in_date, "PP")}
      />
    </div>
  );
};

const RoommateView = ({
  params,
}: RoommatePageProps & React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();

  const { data: roommate } = useQuery(
    getRoommateWithRelationsById(supabase, params.id)
  );
  const { data: profile } = useQuery(
    getProfileWithRelations(supabase, roommate?.profile_id!)
  );
  const { data: preferences } = useQuery(
    getPreferences({ client: supabase, category: ["property", "roommate"] })
  );

  function formatArray(arr: number[]) {
    return `${arr[0]} - ${arr[1]}`;
  }

  return (
    <div className="container px-0 py-3 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start">
        <div className="w-full basis-3/4 space-y-3">
          <H2>{roommate?.title}</H2>
          {roommate && <RoommateDetails roommate={roommate} />}
          {roommate?.description && (
            <div className="">
              <Large>About the listing</Large>
              <Large className="mt-0 font-normal">{roommate.description}</Large>
            </div>
          )}
          <Large>Preferences to property</Large>
          <div className="grid grid-cols-2 items-start md:items-center justify-center">
            {roommate?.rooms_number && (
              <>
                <Large className="lowercase text-muted-foreground">
                  Rooms number
                </Large>
                <Large className="font-normal">
                  {formatArray(roommate?.rooms_number)}
                </Large>
              </>
            )}
            {roommate?.tenants_number && (
              <>
                <Large className="lowercase text-muted-foreground">
                  Tenants number
                </Large>
                <Large className="font-normal">
                  {formatArray(roommate?.tenants_number)}
                </Large>
              </>
            )}
            {roommate?.tenants_age && (
              <>
                <Large className="lowercase text-muted-foreground">
                  Tenants age
                </Large>
                <Large className="font-normal">
                  {formatArray(roommate?.tenants_age)}
                </Large>
              </>
            )}
            {roommate?.roommate_in_preferences.map((v) => {
              const pref = preferences?.find((p) => p.id == v.preference_id);
              return (
                pref &&
                v.value != "" &&
                pref.category == "property" && (
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
          <Large>Preferences to roommate</Large>
          <div className="grid grid-cols-2 items-start md:items-center justify-center">
            {roommate?.roommate_in_preferences.map((v) => {
              const pref = preferences?.find((p) => p.id == v.preference_id);
              return (
                pref &&
                pref.category == "roommate" && (
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
        <div className="basis-1/4 space-y-2 md:border-l md:pl-3">
          {profile && <ListingProfileCard profile={profile} />}
        </div>
      </div>
    </div>
  );
};

export default RoommateView;
