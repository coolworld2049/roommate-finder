"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  adStatusSchema,
  advertisingAsSchema,
  propertyTypeSchema,
  stayDurationSchema,
} from "@/types/database.types.zod";
import { createClient } from "@/lib/supabase/client";
import {
  getAmeninities,
  getPropertyWithRelationsByProfileId,
} from "@/queries/supabase/properties";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  handleUpsertProperty,
  handleUpdatePropertyImages,
} from "@/app/actions/property";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { SelectField } from "@/components/form-fields/SelectField";

import { Json, Tables } from "@/types/database.types";
import { propertyWithRelationsFormSchema } from "@/app/_schemas/property";
import ImageListUploadField from "@/components/form-fields/storage/ImageListUploadField";
import { getPreferences } from "@/queries/supabase/preferences";
import React, { useEffect, useState } from "react";
import { AutosizeTextarea } from "@/components/extension/autosize-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { AmenitiesArrayField } from "@/components/form-fields/AmenitiesArrayField";
import {
  AddressSuggestions,
  DaDataAddress,
  DaDataSuggestion,
} from "react-dadata";
import { PreferencesFormField } from "@/components/form-fields/PreferencesFormField";
import StatusSelectField from "@/components/form-fields/StatusSelectField";

import { MetroStationField } from "../../components/metro-station/MetroStationField";


const PropertyAmenitiesFormField = ({
  control,
  amenities,
  className,
}: {
  control: Control<z.infer<typeof propertyWithRelationsFormSchema>, any>;
  amenities: Tables<"amenities">[];
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { fields } = useFieldArray({
    control: control,
    name: "property_amenities",
    keyName: "uid",
  });
  return (
    <AmenitiesArrayField
      control={control}
      fieldName={"property_amenities"}
      fields={fields}
      amenities={amenities}
      title={"Amenities"}
      className={className}
    />
  );
};

const PropertyForm: React.FC<{ profile: Tables<"profiles"> }> = ({
  profile,
}) => {
  const supabase = createClient();

  const { data: property, refetch: refetch } = useQuery(
    getPropertyWithRelationsByProfileId(supabase, profile?.id)
  );

  const { data: preferences } = useQuery(
    getPreferences({ client: supabase, category: "roommate" })
  );

  const { data: amenities } = useQuery(
    getAmeninities(supabase, { category: "property" })
  );

  const [depositAmountOpen, setDepositAmountOpen] =
    useState<CheckedState>("indeterminate");

  useEffect(() => {
    depositAmountOpen == "indeterminate" &&
      setDepositAmountOpen(property?.deposit_amount ? true : false);
  }, [depositAmountOpen]);

  const property_amenities = amenities?.map((v) => ({
    amenity_id: v.id,
    property_id: property?.id!,
    value: false,
    ...property?.property_amenities?.filter((pa) => pa.amenity_id == v.id)[0],
  }));

  const property_in_preferences = preferences?.map((v) => ({
    preference_id: v.id,
    property_id: property?.id!,
    value: "",
    ...property?.property_in_preferences?.filter(
      (pa) => pa.preference_id == v.id
    )[0],
  }));

  const values = {
    ...property!,
    profile_id: property ? property.profile_id : profile?.id!,
    property_amenities: property_amenities!,
    property_in_preferences: property_in_preferences!,
  } satisfies z.infer<typeof propertyWithRelationsFormSchema>;

  const form = useForm<z.infer<typeof propertyWithRelationsFormSchema>>({
    resolver: zodResolver(propertyWithRelationsFormSchema),
    values: values,
    // defaultValues: values,
  });

  async function onSubmit(
    data: z.infer<typeof propertyWithRelationsFormSchema>
  ) {
    const resp = await handleUpsertProperty(data);
    if (!resp.errors) {
      toast({ title: "Property updated" });
    } else {
      toast({
        title: "Property not updated",
        description: resp.errors,
        variant: "destructive",
      });
    }
    await refetch();
  }

  function onChangeAddressSuggestion(
    onChange: (v: any) => void,
    v: DaDataSuggestion<DaDataAddress> | undefined
  ) {
    if (v) {
      onChange(v?.value);
      form.setValue("address_data", v.data as Record<string, any> as Json);
      if (v.data.geo_lat && v.data.geo_lon) {
        form.setValue("geo_lat", Number(v.data.geo_lat));
        form.setValue("geo_lon", Number(v.data.geo_lon));
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 flex flex-col"
        >
          <StatusSelectField
            control={form.control}
            name={`status`}
            onSelect={(v) => {
              form.setValue(`status`, v as z.infer<typeof adStatusSchema>);
              onSubmit(form.getValues());
              toast({
                title: `Property status changed to ${v}`,
              });
            }}
          />
          {property && (
            <ImageListUploadField
              control={form.control}
              name={"images"}
              db_model_uid={property.id}
              storage_dir={`${property.id}`}
              bucket={"properties"}
              images={property.images}
              handleUploadToSupabase={handleUpdatePropertyImages}
              onUploaded={refetch}
            />
          )}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How would you describe your property?</FormLabel>
                <FormDescription>
                  What kind of property is this? Anything unique or special
                  about it? Where is it located? What's nearby? What kind of
                  people are the other flatmates? What sort of things do you
                  like to do?
                </FormDescription>
                <FormControl>
                  <AutosizeTextarea
                    maxHeight={200}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <AddressSuggestions
                    token={process.env.NEXT_PUBLIC_DADATA_KEY!}
                    delay={700}
                    httpCache={true}
                    httpCacheTtl={60000 * 10}
                    minChars={5}
                    onChange={(v) => onChangeAddressSuggestion(onChange, v)}
                    inputProps={{
                      className:
                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      placeholder: value || "Start typing...",
                      value: value,
                      ...rest,
                    }}
                    suggestionsClassName="text-sm font-normal border p-2 mt-1 rounded-lg space-y-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <MetroStationField
            control={form.control}
            name="nearest_metro_station"
          />
          <FormField
            control={form.control}
            name="rent_price_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rent amount (RUB)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bills_included"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-row gap-1 items-center py-2">
                  <FormLabel>Bills included</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deposit_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-row items-center gap-1">
                  Deposit included
                  <Checkbox
                    checked={depositAmountOpen}
                    onCheckedChange={(v) => {
                      v === false && field.onChange(null);
                      setDepositAmountOpen(v);
                    }}
                  />
                </FormLabel>
                {depositAmountOpen && (
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value!}
                      placeholder="Enter deposit amount"
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <SelectField
            control={form.control}
            name="stay_duration"
            label="Stay duration"
            options={stayDurationSchema.options}
          />
          <SelectField
            control={form.control}
            name="property_type"
            label="Property type"
            placeholder="Select"
            options={propertyTypeSchema.options}
          />
          <FormField
            control={form.control}
            name="bathrooms_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SelectField
            control={form.control}
            name="advertising_as"
            label="Advertising as"
            placeholder="Select"
            options={advertisingAsSchema.options}
          />
          {amenities && (
            <PropertyAmenitiesFormField
              control={form.control}
              amenities={amenities}
            />
          )}
          {preferences && (
            <PreferencesFormField
              control={form.control}
              name="property_in_preferences"
              preferences={preferences}
              className="grid-cols-1"
            />
          )}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default PropertyForm;
