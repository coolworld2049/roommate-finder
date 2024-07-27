import { z } from "zod";

import {
  propertiesInsertSchema,
  propertyAmenitiesInsertSchema,
  propertyInPreferencesInsertSchema,
} from "@/types/database.types.zod";

export const propertyFormSchema = propertiesInsertSchema.merge(
  z.object({
    rent_price_month: z.coerce.number().nonnegative().gt(1000),
    bathrooms_number: z.coerce.number(),
    bills_included: z.boolean().optional(),
    deposit_amount: z.coerce.number().optional().nullable(),
  })
);

export const propertyWithRelationsFieldSchema = z.object({
  property_amenities: z.array(
    propertyAmenitiesInsertSchema.partial({ property_id: true })
  ),
  property_in_preferences: z.array(
    propertyInPreferencesInsertSchema.partial({ property_id: true })
  ),
});

export const propertyWithRelationsFormSchema = propertyFormSchema.merge(
  propertyWithRelationsFieldSchema
);
