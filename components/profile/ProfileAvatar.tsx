"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LucideCircleUserRound } from "lucide-react";
import { Tables } from "@/types/database.types";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/queries/supabase/profiles";

const ProfileAvatar = ({
  profile_id,
}: {
  profile_id?: Tables<"profiles">["id"];
}) => {
  const supabase = createClient();

  const { data: profile } = useQuery(getProfile(supabase, profile_id!));

  return (
    <Avatar className="w-14 h-14">
      <AvatarImage
        src={profile?.avatar!}
        className="avatar-image object-cover"
      />
      <AvatarFallback>
        <LucideCircleUserRound className="w-full h-full" strokeWidth={0.5} />
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
