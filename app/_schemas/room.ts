import { z } from "zod";

import {
  adStatusSchema,
  genderSchema,
  roomAmenitiesInsertSchema,
  roomTenantsInsertSchema,
  roomTypeSchema,
  roomsInsertSchema,
} from "@/types/database.types.zod";

export const roomFormSchema = roomsInsertSchema.merge(
  z.object({
    id: z.number().optional(),
    property_id: z.number(),
    room_type: roomTypeSchema.default("private"),
    status: adStatusSchema.optional(),
    title: z.string().default("Your room title"),
  })
);

export const roomTenantsInsertFormSchema = roomTenantsInsertSchema.merge(
  z.object({
    room_id: z.number(),
    full_name: z.string().default("Set tenant name"),
    age: z.coerce.number().default(18),
    gender: genderSchema.default(genderSchema.options[2].value),
    bio: z.string().optional().nullable().default("Write about your tenant"),
  })
);

export const roomWithRelationsFieldSchema = roomFormSchema.merge(
  z.object({
    room_amenities: z
      .array(roomAmenitiesInsertSchema.partial({ room_id: true }))
      .optional(),
    room_tenants: z
      .array(roomTenantsInsertFormSchema.partial({ room_id: true }))
      .optional(),
  })
);

export const roomWithRelationsFormSchema = z.object({
  rooms: z.array(roomWithRelationsFieldSchema).max(6),
});
