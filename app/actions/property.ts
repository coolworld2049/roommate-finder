"use server";

import createClient from "@/lib/supabase/server";
import { z } from "zod";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/types/database.types";
import { propertyWithRelationsFormSchema } from "../_schemas/property";
import { propertyFormSchema } from "../_schemas/property";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import {
  propertyAmenitiesInsertSchema,
  propertyInPreferencesInsertSchema,
} from "@/types/database.types.zod";

export async function handleUpsertProperty(
  data: z.infer<typeof propertyWithRelationsFormSchema>
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");
  const errors: PostgrestError[] = [];

  const { data: property, error: properties_error } = await supabase
    .from("properties")
    .upsert(propertyFormSchema.parse(data))
    .select()
    .single();

  properties_error && errors.push(properties_error);

  if (property && data.property_amenities) {
    const property_amenities = data.property_amenities.map((v) => {
      v.property_id = property.id;
      return propertyAmenitiesInsertSchema.parse(v);
    });

    const { error: property_amenities_error } = await supabase
      .from("property_amenities")
      .upsert(property_amenities);
    console.error(property_amenities_error);
  }

  if (property && data.property_in_preferences) {
    const property_preferences = data.property_in_preferences.map((v) => {
      v.property_id = property.id;
      return propertyInPreferencesInsertSchema.parse(v);
    });

    const { error: property_preferences_error } = await supabase
      .from("property_in_preferences")
      .upsert(property_preferences);
    console.error(property_preferences_error);
  }

  if (errors.length > 0) {
    const messages: (string | undefined)[] = [];
    errors.map((err) => {
      messages.push(err?.message);
      console.error(data);
      console.error(`handleUpsertProperty: %s`, err);
    });
    return { errors: messages.join("; ") };
  }
  revalidatePath(`${referer}`, "layout");
  return { errors: null };
}

export async function handleUpdatePropertyImages(
  id: Database["public"]["Tables"]["properties"]["Row"]["id"],
  images: Database["public"]["Tables"]["properties"]["Update"]["images"]
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");

  const { error } = await supabase
    .from("properties")
    .update({ images: images })
    .eq("id", id)
    .select();

  if (error) {
    console.error(`handleUpdatePropertyImages: ${error}`);
    return redirect(`${referer}?message=${error.message}&variant=destructive`);
  }

  return redirect(`${referer}`);
}
