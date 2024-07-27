"use server";

import createClient from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  roommateFormSchema,
  roommateWithRelationsFormSchema,
} from "@/app/_schemas/roommate";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { z } from "zod";
import { roommateInPreferencesInsertSchema } from "@/types/database.types.zod";

export async function handleUpsertRoommate(
  data: z.infer<typeof roommateWithRelationsFormSchema>
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const referer = headers().get("referer");
  const errors: [PostgrestError | null] = [null];

  const { data: roommate, error: properties_error } = await supabase
    .from("roommates")
    .upsert(roommateFormSchema.parse(data))
    .select()
    .maybeSingle();

  errors.push(properties_error);

  if (roommate) {
    const roommate_preferences = data.roommate_in_preferences.map((v) => {
      v.roommate_id = roommate.id;
      return roommateInPreferencesInsertSchema.parse(v);
    });

    const { error: roommate_preferences_error } = await supabase
      .from("roommate_in_preferences")
      .upsert(roommate_preferences);

    errors.push(roommate_preferences_error);
  }
  if (!errors.includes(null)) {
    const messages: (string | undefined)[] = [];
    errors.map((err) => {
      messages.push(err?.message);
      console.log(`handleUpsertRoommate: ${err}`);
    });
    return redirect(
      `${referer}?message=${messages.join("; ")}&variant=destructive`
    );
  }
  revalidatePath(`${referer}`);
  return redirect(`${referer}`);
}
