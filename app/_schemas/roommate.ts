import { z } from "zod";

import {
  roommateInPreferencesInsertSchema,
  roommatesInsertSchema,
} from "@/types/database.types.zod";

export const roommateFormSchema = roommatesInsertSchema.merge(
  z.object({
    budget_month: z.coerce.number().gt(0),
    move_in_date: z.string().default(new Date().toDateString()),
  })
);

export const roommateWithRelationsFieldSchema = z.object({
  roommate_in_preferences: z.array(
    roommateInPreferencesInsertSchema.partial({ roommate_id: true })
  ),
});

export const roommateWithRelationsFormSchema = roommateFormSchema.merge(
  roommateWithRelationsFieldSchema
);
