"use client";

import {
  getHigherEducationSpecialtyById,
  getProfileWithRelations,
} from "@/queries/supabase/profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { ProfilePageProps } from "@/app/profile/[id]/page";
import { H2, H4, Large, Small } from "../ui/typography";
import { dobToAge } from "@/utlils/convert";
import { getRoommateByProfileId } from "@/queries/supabase/roommates";
import { getPropertyByProfileId } from "@/queries/supabase/properties";
import RoommateCard from "../listing/RoommateCard";
import PropertyCard from "../listing/PropertyCard";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { notFound, redirect } from "next/navigation";
import { Tables } from "@/types/database.types";
import "react-multi-carousel/lib/styles.css";
import ListingStatus from "../ui/listing/listing-status";
import { Badge } from "../ui/badge";
import { User } from "@supabase/supabase-js";

export const ProfileCardActions = <T extends "roommates" | "properties">({
  tableName,
  data,
  editLink,
  className,
  ...props
}: {
  tableName: T;
  data: Tables<T>;
  editLink: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      <Link href={editLink}>
        <Button className="w-full uppercase" variant={"secondary"}>
          <span className="flex flex-row gap-1 items-center">
            <EditIcon />
            edit
          </span>
        </Button>
      </Link>
    </div>
  );
};

export const ProfileCardUniversity = ({
  profile_universities,
  className,
  ...props
}: {
  profile_universities: Tables<"profile_universities">;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();

  const { data: he_speciality } = useQuery(
    getHigherEducationSpecialtyById(
      supabase,
      profile_universities.specialty_id!
    )
  );
  return (
    <div className={cn("grid grid-cols-2 gap-1", className)} {...props}>
      <Large className="uppercase text-muted-foreground">University</Large>
      <Large>{profile_universities.university_name}</Large>
      <Large className="uppercase text-muted-foreground">Code</Large>
      <Large>{he_speciality?.code}</Large>
      <Large className="uppercase text-muted-foreground">Area</Large>
      <Large>{he_speciality?.area}</Large>
      <Large className="uppercase text-muted-foreground">Qualification</Large>
      <Large>{he_speciality?.qualification}</Large>
      <Large className="uppercase text-muted-foreground">graduation year</Large>
      <Large>{profile_universities.graduation_year}</Large>
    </div>
  );
};

const ProfileCard = ({
  params,
  searchParams,
  userCanEditSelf,
  className,
  user,
  ...props
}: { userCanEditSelf: boolean; user?: User } & ProfilePageProps &
  React.HTMLAttributes<HTMLDivElement>) => {
  const supabase = createClient();

  const { data: profile, isFetched } = useQuery(
    getProfileWithRelations(supabase, params.id)
  );

  if (!profile && isFetched) {
    if (userCanEditSelf) {
      return redirect("/profile");
    }
    return notFound();
  }

  const { data: roommate, refetch: refetchRoommate } = useQuery(
    getRoommateByProfileId(supabase, params.id)
  );

  const { data: property, refetch: refetchProperty } = useQuery(
    getPropertyByProfileId(supabase, profile?.id!)
  );

  return (
    <div className={cn("container p-3", className)} {...props}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center gap-6 pr-0 md:pr-3">
          <Avatar className="size-64">
            <AvatarImage src={profile?.avatar!} className="object-cover" />
            <AvatarFallback />
          </Avatar>
        </div>

        <div className="flex flex-col items-center md:items-start gap-3">
          <H2>
            {profile?.full_name} &#183; {dobToAge(profile?.dob!)} &#183;{" "}
            {profile?.gender}
          </H2>
          {profile?.profile_universities && (
            <ProfileCardUniversity
              profile_universities={profile?.profile_universities}
            />
          )}
          <Large className="text-muted-foreground uppercase">
            Interest areas:
          </Large>
          <div className="flex flex-row items-center gap-1">
            {profile?.interest_areas?.map((v) => (
              <Badge className="rounded-full" variant={"outline"}>
                <Large>{v}</Large>
              </Badge>
            ))}
          </div>
          {userCanEditSelf && (
            <div className="w-full">
              <Small>
                <Link href={"/profile"}>
                  <Button
                    variant={"secondary"}
                    className="w-full"
                    type="button"
                  >
                    Edit Profile
                  </Button>
                </Link>
              </Small>
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-2 grid-cols-1 pt-6">
        {roommate && (
          <>
            <div className="flex flex-row gap-1">
              <H4 className="text-muted-foreground uppercase">Roommate</H4>
              <ListingStatus status={roommate.status} />
            </div>
            <div className="flex flex-col md:flex-row items-start gap-3">
              <RoommateCard
                data={roommate}
                className={cn(
                  userCanEditSelf ? "basis-10/12" : "",
                  "md:flex-col xl:flex-row"
                )}
              />
              {userCanEditSelf && (
                <ProfileCardActions
                  className="basis-2/12"
                  editLink={`/roommate`}
                  tableName="roommates"
                  data={roommate}
                />
              )}
            </div>
          </>
        )}
        {property && (
          <>
            <div className="flex flex-row gap-1">
              <H4 className="text-muted-foreground uppercase">Property</H4>
              <ListingStatus status={property.status} />
            </div>
            <div className="flex flex-col md:flex-row items-start gap-3">
              <PropertyCard
                data={property}
                user={user}
                className={cn(
                  userCanEditSelf ? "basis-10/12" : "",
                  "md:flex-row xl:flex-row"
                )}
              />
              {userCanEditSelf && (
                <ProfileCardActions
                  className="basis-2/12"
                  editLink={`/property`}
                  tableName="properties"
                  data={property}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
