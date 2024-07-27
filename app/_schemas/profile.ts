import { z } from "zod";

import {
  profileSocialsInsertSchema,
  profileUniversitiesInsertSchema,
  profilesInsertSchema,
} from "@/types/database.types.zod";

export const profileFormSchema = profilesInsertSchema;

export const profileUniversitiesInsertFormSchema =
  profileUniversitiesInsertSchema.merge(
    z.object({ graduation_year: z.coerce.number() })
  );

export const profileWithRelationsFieldSchema = z.object({
  profile_universities: profileUniversitiesInsertFormSchema.partial({
    profile_id: true,
  }),
  profile_socials: profileSocialsInsertSchema.partial({
    profile_id: true,
  }),
});

export const profileWithRelationsFormSchema = profileFormSchema.merge(
  profileWithRelationsFieldSchema
);
