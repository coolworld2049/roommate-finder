import { TypedSupabaseClient } from "@/lib/supabase/types";
import { categoryTypeSchema } from "@/types/database.types.zod";
import { z } from "zod";

export const getProperties = (
  client: TypedSupabaseClient,
  options?: { head?: boolean }
) => {
  return client
    .from("properties")
    .select("*", {
      count: "exact",
      head: options?.head ?? false,
    })
    .eq("status", "active")
    .order("created_at", { ascending: false });
};

export const getPropertyByProfileId = (
  client: TypedSupabaseClient,
  id: string
) => {
  return client
    .from("properties")
    .select("id,*")
    .eq("profile_id", id)
    .maybeSingle();
};

export const getPropertyWithRelationsByProfileId = (
  client: TypedSupabaseClient,
  id: string
) => {
  return client
    .from("properties")
    .select("*,property_in_preferences(*),property_amenities(*)")
    .eq("profile_id", id)
    .maybeSingle();
};

export const getPropertyWithRelationsById = (
  client: TypedSupabaseClient,
  id: number
) => {
  return (
    client
      .from("properties")
      .select("*,property_in_preferences(*),property_amenities(*)")
      .eq("id", id)
      // .in("status", ["active", "paused"])
      .filter("property_in_preferences.value", "not.eq", "")
      .maybeSingle()
  );
};

export const getAmeninities = (
  client: TypedSupabaseClient,
  {
    category,
  }: {
    category: z.infer<typeof categoryTypeSchema>;
  }
) => {
  return client.from("amenities").select("*").eq("category", category);
};

export const getPropertyAmeninities = (
  client: TypedSupabaseClient,
  property_id: number
) => {
  return client
    .from("property_amenities")
    .select("amenities(*)")
    .eq("property_id", property_id)
    .eq("value", true);
};

export const getPropertySummary = (
  client: TypedSupabaseClient,
  property_id: number
) => {
  return client
    .from("property_room_tenant_summary")
    .select("*")
    .eq("property_id", property_id)
    .maybeSingle();
};

export const getRoomWithRelationsById = (
  client: TypedSupabaseClient,
  id: number
) => {
  return client
    .from("rooms")
    .select("*,room_amenities(*),room_tenants(*)")
    .eq("id", id)
    .order("id", { referencedTable: "room_tenants" })
    .order("id")
    .maybeSingle();
};

export const getRoomsWithRelations = (client: TypedSupabaseClient) => {
  return client
    .from("rooms")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
};

export const getRoomsWithRelationsByPropertyId = (
  client: TypedSupabaseClient,
  id: number
) => {
  return client
    .from("rooms")
    .select("*,room_amenities(*),room_tenants(*)")
    .eq("property_id", id)
    .order("id", { referencedTable: "room_tenants" })
    .order("id");
};

export const getRoomTenantsNumberByPropertyId = (
  client: TypedSupabaseClient,
  id: number
) => {
  return client
    .from("rooms")
    .select("property_id,tenants_number:room_tenants(count).sum()")
    .eq("property_id", id)
    .order("property_id")
    .maybeSingle();
};
