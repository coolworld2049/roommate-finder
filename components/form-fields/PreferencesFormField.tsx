"use client";

import { Control, useFieldArray } from "react-hook-form";
import React from "react";
import { cn } from "@/lib/utils";
import { Database, Tables } from "@/types/database.types";
import { SelectField } from "@/components/form-fields/SelectField";
import ArrayField from "@/components/form-fields/ArrayField";

export const PreferencesFormField = <T,>({
  control,
  name,
  preferences,
  className,
}: {
  control: Control<any, any>;
  name: "roommate_in_preferences" | "property_in_preferences";
  preferences: Tables<"preferences">[];
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { fields } = useFieldArray({
    control: control,
    name: name,
    keyName: "uid",
  });

  const groupedPreferences = preferences.reduce(
    (
      acc: Record<
        Database["public"]["Enums"]["category_type"],
        Tables<"preferences">[]
      >,
      preference
    ) => {
      (acc[preference.category] = acc[preference.category] || []).push(
        preference
      );
      return acc;
    },
    {} as Record<any, any>
  );

  return (
    <>
      {Object.entries(groupedPreferences).map(([category, preferences]) => {
        let title = `Your preferences for the ${category}`;
        return (
          <div key={category}>
            <ArrayField
              title={title}
              className={cn(className, preferences.length > 3 && "grid-cols-2")}
            >
              {fields.map((item: Record<any, any>, index) => {
                const preference = preferences.find(
                  (v) => v.id === item.preference_id
                );
                return (
                  preference &&
                  preference.options && (
                    <div key={item.uid}>
                      <SelectField
                        control={control}
                        name={`${name}.${index}.value`}
                        label={preference.name.replace("_", " ")}
                        options={preference.options.map((v) => ({
                          label: v,
                          value: v,
                        }))}
                      />
                    </div>
                  )
                );
              })}
            </ArrayField>
          </div>
        );
      })}
    </>
  );
};
