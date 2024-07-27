"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRoommateWithRelationsByProfileId } from "@/queries/supabase/roommates";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { handleUpsertRoommate } from "@/app/actions/roommate";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { Json, Tables } from "@/types/database.types";
import { getPreferences } from "@/queries/supabase/preferences";
import { roommateWithRelationsFormSchema } from "../_schemas/roommate";
import { AutosizeTextarea } from "@/components/extension/autosize-textarea";
import { AddressSuggestions, DaDataAddress } from "react-dadata";
import { Label } from "@/components/ui/label";
import { PreferencesFormField } from "../../components/form-fields/PreferencesFormField";
import StatusSelectField from "@/components/form-fields/StatusSelectField";
import { adStatusSchema } from "@/types/database.types.zod";
import { DualSlider } from "@/components/extension/dual-slider";

const RoommateForm = ({ profile }: { profile: Tables<"profiles"> }) => {
  const supabase = createClient();
  const { data: roommate, refetch: refetchRoommate } = useQuery(
    getRoommateWithRelationsByProfileId(supabase, profile?.id!)
  );

  const { data: preferences } = useQuery(
    getPreferences({ client: supabase, category: ["property", "roommate"] })
  );

  const roommate_in_preferences = preferences?.map((v) => ({
    preference_id: v.id,
    roommate_id: roommate?.id,
    value: "",
    ...roommate?.roommate_in_preferences?.find(
      (rp) => rp.preference_id == v.id
    ),
  }))!;

  const form = useForm<z.infer<typeof roommateWithRelationsFormSchema>>({
    resolver: zodResolver(roommateWithRelationsFormSchema),
    mode: "onSubmit",
    values: {
      ...roommate!,
      profile_id: profile.id,
      roommate_in_preferences: roommate_in_preferences,
    },
    defaultValues: {
      profile_id: profile.id,
      roommate_in_preferences: roommate_in_preferences,
    },
  });

  const [regionFiasId, setRegionFiasId] = useState<string | null>(null);

  function onSubmit(data: z.infer<typeof roommateWithRelationsFormSchema>) {
    handleUpsertRoommate(data);
    refetchRoommate();
    toast({ title: "Roommate updated" });
  }

  const inputProps = {
    className:
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:oparegion_fias_id-50",
    placeholder: "Start typing...",
  };

  const suggestionsClassName =
    "text-sm font-normal border p-2 mt-1 rounded-lg space-y-2 flex flex-col items-start w-full";
  const suggestionCache = {
    httpCache: true,
    httpCacheTtl: 60000 * 10,
  };

  return (
    <>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <AutosizeTextarea
                    maxHeight={200}
                    {...field}
                    value={field.value ?? ""}
                    className="h-28"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormDescription>
                  The area where you would like to find accommodation
                </FormDescription>
                <FormControl className="border p-3 rounded-md">
                  <div className="flex flex-col md:flex-row gap-3 justify-between">
                    <div className="w-full basis-1/2 space-y-2">
                      <Label>Region</Label>
                      <AddressSuggestions
                        token={process.env.NEXT_PUBLIC_DADATA_KEY!}
                        delay={700}
                        {...(process.env.NODE_ENV == "production" &&
                          suggestionCache)}
                        minChars={3}
                        onChange={(v) => {
                          if (v) {
                            setRegionFiasId(v.data.region_fias_id);
                          }
                        }}
                        inputProps={{
                          ...inputProps,
                          placeholder:
                            (roommate?.address_data &&
                              (
                                roommate?.address_data as Record<
                                  string,
                                  any
                                > as DaDataAddress
                              ).region) ||
                            "Start typing region...",
                          ...rest,
                        }}
                        suggestionsClassName={suggestionsClassName}
                        filterFromBound="region"
                        filterToBound="region"
                      />
                    </div>
                    <div className="w-full space-y-2">
                      <Label>Preffered location</Label>
                      <AddressSuggestions
                        token={process.env.NEXT_PUBLIC_DADATA_KEY!}
                        delay={500}
                        {...(process.env.NODE_ENV == "production" &&
                          suggestionCache)}
                        minChars={3}
                        onChange={(v) => {
                          if (v) {
                            onChange(v?.value);
                            form.setValue(
                              "address_data",
                              v.data as Record<string, any> as Json
                            );
                            if (v.data.geo_lat && v.data.geo_lon) {
                              form.setValue("geo_lat", Number(v.data.geo_lat));
                              form.setValue("geo_lon", Number(v.data.geo_lon));
                            }
                          }
                        }}
                        inputProps={{
                          ...inputProps,
                          placeholder:
                            roommate?.address || "Start typing area...",
                          ...rest,
                          disabled: !regionFiasId,
                        }}
                        suggestionsClassName={suggestionsClassName}
                        filterLocations={[{ region_fias_id: regionFiasId }]}
                        filterRestrictValue={true}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="move_in_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Move in</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 oparegion_fias_id-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={(v) => field.onChange(v?.toDateString())}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget per month (RUB)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rooms_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rooms number</FormLabel>
                <FormControl className="pb-4">
                  <DualSlider
                    value={field.value!}
                    onValueChange={field.onChange}
                    ref={field.ref}
                    min={1}
                    max={10}
                    step={1}
                    minStepsBetweenThumbs={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenants_number"
            render={({ field }) => (
              <FormItem className="pb-4">
                <FormLabel>Tenants number</FormLabel>
                <FormControl>
                  <DualSlider
                    value={field.value!}
                    onValueChange={field.onChange}
                    ref={field.ref}
                    min={0}
                    max={10}
                    step={1}
                    minStepsBetweenThumbs={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenants_age"
            render={({ field }) => (
              <FormItem className="pb-4">
                <FormLabel>Tenants age</FormLabel>
                <FormControl>
                  <DualSlider
                    value={field.value!}
                    onValueChange={field.onChange}
                    ref={field.ref}
                    min={18}
                    max={100}
                    step={1}
                    minStepsBetweenThumbs={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {preferences && (
            <PreferencesFormField
              control={form.control}
              name="roommate_in_preferences"
              preferences={preferences}
              className="grid-cols-1"
            />
          )}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
};

export default RoommateForm;
