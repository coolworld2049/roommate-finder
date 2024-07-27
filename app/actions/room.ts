"use server";

import createClient from "@/lib/supabase/server";
import { z } from "zod";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { roomWithRelationsFormSchema } from "@/app/_schemas/room";
import {
  roomAmenitiesInsertSchema,
  roomTenantsInsertSchema,
  roomsInsertSchema,
} from "@/types/database.types.zod";

export async function handleUpsertRoom(
  data: z.infer<typeof roomWithRelationsFormSchema>
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");

  data.rooms?.map(async (r) => {
    let errors: PostgrestError[] = [];

    const { data: room, error } = await supabase
      .from("rooms")
      .upsert(roomsInsertSchema.parse(r))
      .select()
      .limit(1)
      .single();

    error && errors.push(error);

    if (room && r.room_amenities) {
      const new_room_amenities = r.room_amenities.map((v) => {
        v.room_id = room.id;
        return roomAmenitiesInsertSchema.parse(v);
      });

      const { error: room_amenities_error } = await supabase
        .from("room_amenities")
        .upsert(new_room_amenities);
      room_amenities_error && errors.push(room_amenities_error);
    }

    if (room && r.room_tenants) {
      r.room_tenants.map(async (tenant) => {
        tenant.room_id = room.id;
        const new_room_tenant = roomTenantsInsertSchema.parse(tenant);

        const q = supabase.from("room_tenants");
        const query = tenant.id
          ? q.update(new_room_tenant).eq("id", tenant.id)
          : q.upsert(new_room_tenant);
        const { error: tenants_error } = await query;
        tenants_error && errors.push(tenants_error);
      });

      errors.length > 1 && console.error(errors);
    }
  });

  return redirect(`${referer}`);
}

export async function handleUpdateRoomImages(
  id: Database["public"]["Tables"]["properties"]["Row"]["id"],
  images: Database["public"]["Tables"]["properties"]["Update"]["images"]
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");

  const { error } = await supabase
    .from("rooms")
    .update({ images: images })
    .eq("id", id)
    .select();

  if (error) {
    console.log(`handleUpdateRoomImages: ${error}`);
    return redirect(`${referer}?message=${error.message}&variant=destructive`);
  }

  return redirect(`${referer}`);
}
