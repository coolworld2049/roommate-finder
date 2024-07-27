import { TypedSupabaseClient } from "@/lib/supabase/types";

export const getRoommates = (
  client: TypedSupabaseClient,
  options?: { head?: boolean }
) => {
  return client
    .from("roommates")
    .select(
      "*",
      {
        count: "exact",
        head: options?.head ?? false,
      }
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });
};

export const getRoommateByProfileId = (
  client: TypedSupabaseClient,
  id: string
) => {
  return client.from("roommates").select().eq("profile_id", id).maybeSingle();
};

export const getRoommateWithRelationsById = (
  client: TypedSupabaseClient,
  id: number
) => {
  return (
    client
      .from("roommates")
      .select("*,roommate_in_preferences(*)")
      .eq("id", id)
      // .in("status", ["active", "paused"])
      .filter("roommate_in_preferences.value", "not.eq", "")
      .maybeSingle()
  );
};

export const getRoommateWithRelationsByProfileId = (
  client: TypedSupabaseClient,
  id: string
) => {
  return client
    .from("roommates")
    .select("*,roommate_in_preferences(*)")
    .eq("profile_id", id)
    .maybeSingle();
};
