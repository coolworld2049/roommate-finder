"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/extension/multi-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { genderSchema } from "@/types/database.types.zod";
import React from "react";
import { User } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@/lib/supabase/client";
import {
  getHigherEducationSpecialties,
  getInterestAreas,
  getProfile,
  getProfileSocials,
  getProfileUniversity,
  getProfileWithRelations,
} from "@/queries/supabase/profiles";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  handleUpdateProfileImage,
  handleUpsertProfile,
} from "@/app/actions/profile";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { SelectField } from "@/components/form-fields/SelectField";
import ProfileAvatarForm from "@/components/profile/ProfileAvatarForm";
import { AutosizeTextarea } from "@/components/extension/autosize-textarea";
import { Tables } from "@/types/database.types";
import { profileWithRelationsFormSchema } from "../_schemas/profile";
import { PartySuggestions } from "react-dadata";
import CommandListField from "@/components/form-fields/CommandListField";
import TelegramIcon from "@/components/icons/TelegamIcon";
import VkIcon from "@/components/icons/VkIcon";
import { Label } from "@/components/ui/label";

export const ProfileFullNameField = ({
  control,
  name,
}: {
  control: Control<any>;
  name?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name ?? "full_name"}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ProfileDobField = ({
  control,
  name,
}: {
  control: Control<any>;
  name?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name ?? "dob"}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date of birth</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                captionLayout="dropdown-buttons"
                selected={new Date(field.value)}
                onSelect={(v) => v && field.onChange(v.toDateString())}
                fromYear={1960}
                toYear={new Date().getFullYear() - 19}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ProfileGenderField = ({
  control,
  name,
}: {
  control: Control<any>;
  name?: string;
}) => {
  return (
    <SelectField
      control={control}
      name={name ?? "gender"}
      label="Gender"
      placeholder="Select gender"
      options={genderSchema.options}
    />
  );
};

export const ProfileInterestAreasField = ({
  control,
  interest_areas,
  max,
  ...props
}: {
  control: Control<z.infer<typeof profileWithRelationsFormSchema>, any>;
  interest_areas: Tables<"interest_areas">[];
  max?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const selectLimit = max ?? 3;
  return (
    <FormField
      control={control}
      name="interest_areas"
      render={({ field }) => (
        <FormItem {...props}>
          <FormLabel className="capitalize">Interests</FormLabel>
          <MultiSelector
            values={field.value ?? []}
            onValuesChange={field.onChange}
          >
            <MultiSelectorTrigger className="text-sm">
              <MultiSelectorInput placeholder="Select items" />
            </MultiSelectorTrigger>
            <MultiSelectorContent>
              <MultiSelectorList className="-translate-y-[118%]">
                {interest_areas.map((item, index) => {
                  return (
                    <MultiSelectorItem
                      key={index}
                      value={item.name}
                      disabled={
                        !field.value?.includes(item.name) &&
                        field.value?.length &&
                        field.value?.length >= selectLimit
                          ? true
                          : false
                      }
                    >
                      <div className="flex flex-row gap-1 items-center">
                        {item.icon_svg && (
                          <img
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(item.icon_svg)}`}
                            className="w-5 h-5 dark:invert"
                          />
                        )}
                        {item.name}
                      </div>
                    </MultiSelectorItem>
                  );
                })}
              </MultiSelectorList>
            </MultiSelectorContent>
          </MultiSelector>
        </FormItem>
      )}
    />
  );
};

const ProfileForm = ({ user }: { user: User }) => {
  const supabase = createClient();
  const today = new Date();

  const { data: profile, refetch } = useQuery(getProfile(supabase, user.id));

  const { data: profile_universities } = useQuery(
    getProfileUniversity(supabase, user.id)
  );

  const { data: profile_socials } = useQuery(
    getProfileSocials(supabase, user.id)
  );

  const { data: specialties } = useQuery(
    getHigherEducationSpecialties(supabase)
  );

  const { data: interest_areas } = useQuery(getInterestAreas(supabase));

  const form = useForm<z.infer<typeof profileWithRelationsFormSchema>>({
    resolver: zodResolver(profileWithRelationsFormSchema),
    values: {
      ...profile!,
      id: user.id,
      interest_areas: profile?.interest_areas ?? [],
      profile_universities: profile_universities!,
      profile_socials: profile_socials!,
    },
    defaultValues: {
      ...profile!,
      id: user.id,
      interest_areas: profile?.interest_areas ?? [],
      profile_universities: profile_universities!,
      profile_socials: profile_socials!,
    },
  });

  async function onSubmit(
    data: z.infer<typeof profileWithRelationsFormSchema>
  ) {
    const { errors } = await handleUpsertProfile(data);

    await refetch();

    if (errors.length < 1) {
      toast({ title: "Profile updated" });
    } else {
      toast({
        title: "Profile not updated",
        description:
          process.env.NODE_ENV == "development" &&
          errors.map((v) => v.message).join("\n"),
        variant: "destructive",
      });
    }
  }
  const university_graduation_year_options = Array.from(
    { length: 10 },
    (_, i) => today.getFullYear() + i
  ).map((v) => ({ label: v.toString(), value: v.toString() }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 flex flex-col"
      >
        <div className="flex flex-col justify-center items-center gap-3 mb-3">
          <Avatar className="w-64 h-64">
            <AvatarImage src={profile?.avatar!} className="object-cover" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          {profile && (
            <ProfileAvatarForm
              profile={profile}
              uploadToSupabase={handleUpdateProfileImage}
              refetch={refetch}
            />
          )}
        </div>
        <ProfileFullNameField control={form.control} />
        <ProfileDobField control={form.control} />
        <ProfileGenderField control={form.control} />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <AutosizeTextarea
                  maxHeight={200}
                  placeholder="Tell us a little bit about yourself"
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
          name="profile_universities"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>University</FormLabel>
              <FormControl>
                <PartySuggestions
                  token={process.env.NEXT_PUBLIC_DADATA_KEY!}
                  delay={700}
                  httpCache={true}
                  httpCacheTtl={60000 * 10}
                  minChars={3}
                  onChange={(v) => {
                    if (v) {
                      form.setValue(
                        "profile_universities.university_name",
                        v.data.name.short
                      );
                      form.setValue(
                        "profile_universities.university_address",
                        v.data.address.value
                      );
                      form.setValue(
                        "profile_universities.geo_lat",
                        v.data.address.data.geo_lat
                          ? Number(v.data.address.data.geo_lat)
                          : undefined
                      );
                      form.setValue(
                        "profile_universities.geo_lon",
                        v.data.address.data.geo_lon
                          ? Number(v.data.address.data.geo_lon)
                          : undefined
                      );
                    }
                  }}
                  inputProps={{
                    className:
                      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    placeholder: value && value.university_name,
                    ...rest,
                  }}
                  renderOption={(s) => {
                    return (
                      <div className="flex flex-col items-start">
                        <div>{s.data.name.short}</div>
                        <div className="text-gray-500 dark:invert">
                          {s.data.address.value}
                        </div>
                      </div>
                    );
                  }}
                  suggestionsClassName="text-sm font-normal border rounded-lg p-2 mt-1 flex flex-col items-start gap-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CommandListField
          control={form.control}
          name="profile_universities.specialty_id"
          label="Specialty"
          items={
            specialties?.map((v) => ({
              id: v.id,
              name: `${v.code} ${v.area}`.concat(
                ["Бакалавр", "Магистр"].includes(v.qualification)
                  ? ` (${v.qualification})`
                  : ""
              ),
            }))!
          }
        />
        <SelectField
          control={form.control}
          name="profile_universities.graduation_year"
          label="Year of graduation"
          placeholder={profile_universities?.graduation_year!.toString()}
          options={university_graduation_year_options}
        />
        {interest_areas && (
          <ProfileInterestAreasField
            control={form.control}
            interest_areas={interest_areas}
          />
        )}
        <div className="space-y-2">
          <Label>Socials</Label>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <FormField
              control={form.control}
              name={"profile_socials.telegram"}
              render={({ field }) => (
                <FormItem className=" w-full">
                  <FormLabel className="flex flex-row items-center gap-1">
                    <TelegramIcon className="w-6 h-6" />
                    <span>Telegram</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value!}
                      placeholder="username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"profile_socials.vk"}
              render={({ field }) => (
                <FormItem className=" w-full">
                  <FormLabel className="flex flex-row items-center gap-1">
                    <VkIcon className="w-6 h-6" />
                    <span>VK</span>
                  </FormLabel>{" "}
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value!}
                      placeholder="username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
