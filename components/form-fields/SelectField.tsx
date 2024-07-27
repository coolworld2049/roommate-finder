import React from "react";
import { Control, ControllerRenderProps, useController } from "react-hook-form";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  options: { label?: string; value: string }[];
}

export const SelectField = ({
  control,
  name,
  label,
  placeholder,
  options,
  className,
  ...props
}: SelectFieldProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <FormItem className={cn(className)} {...props}>
          <FormLabel asChild>
            <span className="capitalize">{label}</span>
          </FormLabel>
          <FormControl>
            <Select onValueChange={onChange} defaultValue={value} name={name}>
              <SelectTrigger>
                <SelectValue placeholder={value ?? placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, i) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label ?? option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
