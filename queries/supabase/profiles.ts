import { TypedSupabaseClient } from "@/lib/supabase/types";
import { Database } from "../../types/database.types";

export const getProfile = (client: TypedSupabaseClient, id: string) => {
  return client.from("profiles").select("*").eq("id", id).maybeSingle();
};

export const getProfileWithRelations = (
  client: TypedSupabaseClient,
  id: string
) => {
  return client
    .from("profiles")
    .select("*,profile_universities(*)")
    .eq("id", id)
    .maybeSingle();
};

export const getInterestAreas = (client: TypedSupabaseClient) => {
  return client.from("interest_areas").select("*");
};

export const getInterestAreasByNames = (
  client: TypedSupabaseClient,
  areas: string[]
) => {
  return client.from("interest_areas").select("*").in("name", areas);
};

export const upsertProfile = (
  client: TypedSupabaseClient,
  payload: Database["public"]["Tables"]["profiles"]["Insert"]
) => {
  return client.from("profiles").upsert(payload).eq("id", payload.id!).select();
};

export const getProfileUniversity = (
  client: TypedSupabaseClient,
  profile_id: string
) => {
  return client
    .from("profile_universities")
    .select("*")
    .eq("profile_id", profile_id)
    .maybeSingle();
};

export const getUniversitiesByProfiles = (
  client: TypedSupabaseClient,
  profile_ids: string[]
) => {
  return client
    .from("profile_universities")
    .select("*")
    .in("profile_id", profile_ids);
};

export const getProfileSocials = (
  client: TypedSupabaseClient,
  profile_id: string
) => {
  return client
    .from("profile_socials")
    .select("*")
    .eq("profile_id", profile_id)
    .maybeSingle();
};

export const getHigherEducationSpecialties = (client: TypedSupabaseClient) => {
  return client.from("higher_education_specialties").select("*");
};

export const getHigherEducationSpecialtyById = (
  client: TypedSupabaseClient,
  id: number
) => {
  return client
    .from("higher_education_specialties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
};
