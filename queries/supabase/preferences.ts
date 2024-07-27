import { TypedSupabaseClient } from "@/lib/supabase/types";
import { categoryTypeSchema } from "@/types/database.types.zod";
import { z } from "zod";

export const getPreferences = ({
  client,
  category,
}: {
  client: TypedSupabaseClient;
  category:
    | z.infer<typeof categoryTypeSchema>
    | z.infer<typeof categoryTypeSchema>[];
}) => {
  const q = client.from("preferences").select("*");
  return category instanceof Array
    ? q.in("category", category)
    : q.eq("category", category);
};
