import { Control } from "react-hook-form";
import ArrayField, { ArrayFieldProps } from "./ArrayField";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";

export const AmenitiesArrayField = ({
  control,
  fieldName,
  fields,
  amenities,
  title,
  className,
  ...props
}: {
  control: Control<any>;
  fieldName: string;
  fields: any[];
  amenities: Tables<"amenities">[];
} & ArrayFieldProps &
  React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <ArrayField title={title} className={cn(className)} {...props}>
      {fields?.map((item, index) => {
        const amenity = amenities?.filter((v) => v.id == item.amenity_id)[0];
        return (
          <FormField
            key={item.uid}
            control={control}
            name={`${fieldName}.${index}.value`}
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={value ? true : false}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal flex flex-row items-center gap-1">
                  {amenity?.icon_svg && (
                    <div>
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(amenity?.icon_svg)}`}
                        className="w-5 h-5 dark:invert"
                      />
                    </div>
                  )}
                  {amenity?.name}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </ArrayField>
  );
};
