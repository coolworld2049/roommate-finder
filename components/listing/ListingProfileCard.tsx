"use client";

import React from "react";
import { Large } from "@/components/ui/typography";
import { dobToAge } from "@/utlils/convert";
import { Tables } from "@/types/database.types";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getProfileSocials } from "@/queries/supabase/profiles";
import TelegramIcon from "../icons/TelegamIcon";
import VkIcon from "../icons/VkIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

export const ListingProfileCard = ({
  profile,
}: {
  profile: Tables<"profiles">;
}) => {
  const supabase = createClient();

  const { data: profile_socials } = useQuery(
    getProfileSocials(supabase, profile.id)
  );

  return (
    <div className="flex flex-row flex-wrap gap-3 items-center">
      <Link href={`/profile/${profile.id}`}>
        <img
          src={profile.avatar!}
          className="rounded-full w-24 h-24 object-cover"
        />
      </Link>
      <div className="flex flex-col items-start gap-1">
        <Large className="font-medium">
          {profile.full_name} &#183; {dobToAge(profile.dob)}
        </Large>

        <div className="flex flex-row">
          <Dialog>
            <DialogTrigger>
              <Button>Show contacts</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contacts</DialogTitle>
              </DialogHeader>
              {profile_socials?.telegram && (
                <Link
                  href={`tg://resolve?domain=@${profile_socials.telegram}`}
                  className="flex flex-row items-center gap-1 underline"
                >
                  <TelegramIcon className="size-10" /> Telegram
                </Link>
              )}
              {profile_socials?.vk && (
                <Link
                  href={`https://vk.com/${profile_socials?.vk}`}
                  className="flex flex-row items-center gap-1 underline"
                >
                  <VkIcon className="size-10" /> VK
                </Link>
              )}
              {!profile_socials?.telegram &&
                !profile_socials?.vk &&
                "The user has not provided contact information"}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
