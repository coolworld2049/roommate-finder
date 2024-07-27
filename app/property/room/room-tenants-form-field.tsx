"use client";

import { Control, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { genderSchema } from "@/types/database.types.zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React, { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { SelectField } from "@/components/form-fields/SelectField";
import { UserPlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  roomTenantsInsertFormSchema,
  roomWithRelationsFormSchema,
} from "@/app/_schemas/room";
import { AutosizeTextarea } from "@/components/extension/autosize-textarea";
import { RoomFormCardHeader } from "./room-form";

export const RoomTenantsFormField = ({
  control,
  name,
  room_id,
  refetchRoom,
  className,
  ...props
}: {
  control: Control<z.infer<typeof roomWithRelationsFormSchema>, any>;
  room_id?: number;
  refetchRoom: () => Promise<any>;
  name: `rooms.${number}.room_tenants`;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: name,
    keyName: "uid",
  });
  const supabase = createClient();

  const handleAppendRoomTenant = useCallback(async () => {
    const placeholder = roomTenantsInsertFormSchema.parse({ room_id: room_id });
    append(placeholder);
    await supabase.from("room_tenants").upsert(placeholder);
    setTimeout(async () => {
      await refetchRoom();
    }, 300);
  }, [fields]);

  const handleRemoveRoomTenant = useCallback(
    async (id: number, full_name: string) => {
      const { error } = await supabase
        .from("room_tenants")
        .delete()
        .eq("id", id);
      if (error) {
        toast({
          title: `#${id} Tenant  can't be deleted`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: `Tenant #${id} ${full_name}  deleted` });
      }
      refetchRoom();
    },
    [fields]
  );

  return (
    <Collapsible defaultOpen={fields.length < 1 ? true : false}>
      <CardHeader className="font-semibold text-xl pl-0 flex flex-row items-center space-y-0 gap-1.5">
        <CardTitle>Tenants ({fields.length})</CardTitle>
        <CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="flex items-center"
          >
            <CaretSortIcon className="w-6 h-6" />
          </Button>
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent
        className={cn("flex flex-col gap-3", className)}
        {...props}
      >
        {fields?.map((item, index) => {
          item.room_id = room_id;
          return (
            <Card key={index}>
              <RoomFormCardHeader
                index={index}
                deleteButtonProps={{
                  onClick: () => {
                    remove(index);
                    item.id && handleRemoveRoomTenant(item.id, item.full_name);
                  },
                }}
              >
                {item.id && <h3>{item.full_name}</h3>}
              </RoomFormCardHeader>
              <CardContent className="space-y-2">
                <FormField
                  control={control}
                  name={`${name}.${index}.full_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={"Tenant name"}
                          className="capitalize"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.age`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SelectField
                  control={control}
                  name={`${name}.${index}.gender`}
                  label={"Gender"}
                  options={genderSchema.options}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.bio`}
                  render={({ field: { value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <AutosizeTextarea
                          maxHeight={200}
                          placeholder={value!}
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
        <Button
          type="button"
          variant={"outline"}
          className="border border-dashed"
          disabled={!room_id ? true : false}
          onClick={handleAppendRoomTenant}
        >
          <UserPlusIcon className="mr-1" />
          Add tenant
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
};
