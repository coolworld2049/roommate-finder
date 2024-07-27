"use server";

import createClient from "@/lib/supabase/server";
import {
  profileSocialsInsertSchema,
  profileUniversitiesInsertSchema,
} from "@/types/database.types.zod";
import { z } from "zod";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/types/database.types";
import {
  profileFormSchema,
  profileWithRelationsFormSchema,
} from "@/app/_schemas/profile";
import { PostgrestError } from "@supabase/supabase-js";

export async function handleUpsertProfile(
  data: z.infer<typeof profileWithRelationsFormSchema>
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const errors: PostgrestError[] = [];

  const { data: profile, error: error_profiles } = await supabase
    .from("profiles")
    .upsert(profileFormSchema.parse(data))
    .select()
    .maybeSingle();

  error_profiles && errors.push(error_profiles);

  if (profile) {
    data.profile_universities.profile_id = profile?.id;
    const { error: error_profile_universities } = await supabase
      .from("profile_universities")
      .upsert(profileUniversitiesInsertSchema.parse(data.profile_universities));
    error_profile_universities && errors.push(error_profile_universities);

    if (data.profile_socials) {
      data.profile_socials.profile_id = profile?.id;
      await supabase
        .from("profile_socials")
        .upsert(profileSocialsInsertSchema.parse(data.profile_socials));
    }
  }

  if (errors.length > 1) {
    console.error(`handleUpsertProfile: ${errors}`);
  }

  return { errors };
}

export async function handleUpdateProfileImage(
  id: Database["public"]["Tables"]["profiles"]["Row"]["id"],
  avatar: Database["public"]["Tables"]["profiles"]["Update"]["avatar"]
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar: avatar })
    .eq("id", id)
    .select();

  if (error) {
    console.log(`handleUpdatePropertyImages: ${error}`);
    return redirect(`${referer}?message=${error.message}&variant=destructive`);
  }

  return redirect(`${referer}`);
}
