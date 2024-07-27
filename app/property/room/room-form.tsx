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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  adStatusSchema,
  roomSizeSchema,
  roomTypeSchema,
} from "@/types/database.types.zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React, { PropsWithChildren, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRoomsWithRelationsByPropertyId } from "@/queries/supabase/properties";
import { toast } from "@/components/ui/use-toast";
import { Button, ButtonProps } from "@/components/ui/button";
import { CalendarIcon, CaretSortIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { SelectField } from "@/components/form-fields/SelectField";
import { DeleteIcon, ListPlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { handleUpdateRoomImages, handleUpsertRoom } from "@/app/actions/room";
import ImageListUploadField from "@/components/form-fields/storage/ImageListUploadField";
import { removeFolderInStorage } from "@/app/actions/storage";
import { Tables } from "@/types/database.types";
import {
  roomFormSchema,
  roomWithRelationsFormSchema,
} from "@/app/_schemas/room";
import { AmenitiesArrayField } from "@/components/form-fields/AmenitiesArrayField";
import { getAmeninities } from "@/queries/supabase/properties";
import { AutosizeTextarea } from "@/components/extension/autosize-textarea";
import { Badge } from "@/components/ui/badge";
import { RoomTenantsFormField } from "./room-tenants-form-field";
import StatusSelectField from "@/components/form-fields/StatusSelectField";
import { Large, Small } from "@/components/ui/typography";

export const RoomFormCardHeader = ({
  children,
  index,
  deleteButtonProps,
  className,
  ...props
}: {
  index: number;
  deleteButtonProps: ButtonProps & React.RefAttributes<HTMLButtonElement>;
} & PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <CardHeader>
      <div
        className={cn(
          "flex flex-row gap-1 justify-between items-center",
          "text-lg font-bold",
          className
        )}
        {...props}
      >
        <div className="flex flex-row items-center gap-2">
          <CardTitle>
            <span className="capitalize">#{index + 1}</span>
          </CardTitle>
          {children}
        </div>
        <Button
          type="button"
          size={"icon"}
          variant={"ghost"}
          {...deleteButtonProps}
        >
          <DeleteIcon className="mr-1 text-destructive" />
        </Button>
      </div>
    </CardHeader>
  );
};

const RoomAmenitiesFormField = ({
  control,
  name,
  amenities,
  room_id,
  className,
  ...props
}: {
  control: Control<z.infer<typeof roomWithRelationsFormSchema>, any>;
  name: `rooms.${number}.room_amenities`;
  amenities: Tables<"amenities">[];
  room_id?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { fields } = useFieldArray({
    control: control,
    name: name,
    keyName: "uid",
  });

  return (
    <AmenitiesArrayField
      control={control}
      fieldName={name}
      fields={fields}
      amenities={amenities}
      title={"Amenities"}
      className={className}
      {...props}
    />
  );
};

const AppendButton = ({
  children,
  ...props
}: ButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  return (
    <Card className="border border-dashed h-20">
      <Button
        type="button"
        variant={"ghost"}
        className="w-full h-full text-md flex flex-row items-center"
        {...props}
      >
        <ListPlusIcon className="mr-1" size={26} />
        {children}
      </Button>
    </Card>
  );
};

const RoomForm: React.FC<{ property_id: number }> = ({ property_id }) => {
  const supabase = createClient();

  const { data: rooms, refetch: refetchRoom } = useQuery(
    getRoomsWithRelationsByPropertyId(supabase, property_id)
  );

  const { data: amenities } = useQuery(
    getAmeninities(supabase, { category: "room" })
  );

  const form = useForm<z.infer<typeof roomWithRelationsFormSchema>>({
    resolver: zodResolver(roomWithRelationsFormSchema),
    values: {
      rooms: rooms!,
    },
    defaultValues: {
      rooms: rooms?.map((room) => {
        const room_amenities = amenities?.map((v) => ({
          ...{ amenity_id: v.id, property_id: room?.id!, value: false },
          ...room?.room_amenities?.find((pa) => pa.amenity_id == v.id)!,
        }))!;
        room.room_amenities = room_amenities;
        return room;
      }),
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "rooms",
    control: form.control,
    keyName: "uid",
  });

  async function onSubmit(data: z.infer<typeof roomWithRelationsFormSchema>) {
    await handleUpsertRoom(data);
    setTimeout(async () => {
      await refetchRoom();
      toast({ title: "Rooms updated" });
    }, 1000);
    toast({ title: "Rooms updated" });
  }

  const handleAppendRoom = useCallback(async () => {
    const placeholder = roomFormSchema.parse({
      property_id: property_id,
      title: "Room",
      status: adStatusSchema.options[2].value,
    });
    append(placeholder);
    const { error } = await supabase.from("rooms").upsert(placeholder);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    }
    setTimeout(async () => {
      await refetchRoom();
    }, 500);
  }, [fields]);

  const handleRemoveRoom = useCallback(
    async (room_id: number) => {
      const { error } = await supabase.from("rooms").delete().eq("id", room_id);
      if (error) {
        toast({
          title: `#${room_id} Room  can't be deleted`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        await removeFolderInStorage({
          supabase: supabase,
          bucket: "rooms",
          folder: `property_id-${property_id}__room_id-${room_id}`,
        });
        toast({ title: `#${room_id} Room deleted` });
      }
      await refetchRoom();
    },
    [fields]
  );

  const statusDescriptions: {
    status: z.infer<typeof adStatusSchema>;
    description: string;
  }[] = [
    {
      status: "active",
      description: "Room available for accommodation",
    },
    {
      status: "inactive",
      description: "The room is occupied",
    },
    {
      status: "paused",
      description: "The room is temporarily unavailable for accommodation",
    },
  ];
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        {fields.map((room, index) => {
          room.property_id = property_id;

          return (
            <Collapsible defaultOpen={room.id ? false : true}>
              <Card key={index}>
                <RoomFormCardHeader
                  index={index}
                  deleteButtonProps={{
                    disabled: form.formState.isSubmitting,
                    onClick: () => {
                      room.id && handleRemoveRoom(room.id);
                      remove(index);
                    },
                  }}
                >
                  {room.id && (
                    <div className="flex flex-col md:flex-row gap-1">
                      <Large className="line-clamp-1 max-w-xs">
                        {room.title}
                      </Large>
                      <Badge
                        variant={"outline"}
                        className={cn(
                          room.status == "active" &&
                            "bg-green-400 dark:text-black",
                          room.status == "paused" &&
                            "bg-orange-400 dark:text-black",
                          room.status == "inactive" &&
                            "bg-red-400 dark:text-black"
                        )}
                      >
                        {room.status}
                      </Badge>
                      <Badge variant={"outline"}>
                        <span>{room.room_tenants?.length || 0} tenants</span>
                      </Badge>
                    </div>
                  )}
                  <CollapsibleTrigger>
                    <Button variant="secondary" size="icon" type="button">
                      <CaretSortIcon className="w-6 h-6" />
                    </Button>
                  </CollapsibleTrigger>
                </RoomFormCardHeader>
                <CollapsibleContent>
                  <CardContent className="flex flex-col gap-1">
                    {room.id && (
                      <ImageListUploadField
                        control={form.control}
                        name={`rooms.${index}.images`}
                        db_model_uid={room.id}
                        storage_dir={`property_id-${property_id}__room_id-${room.id}`}
                        bucket={"rooms"}
                        images={room.images}
                        handleUploadToSupabase={handleUpdateRoomImages}
                        onUploaded={refetchRoom}
                        dropzoneOptions={{ maxFiles: 3 }}
                      />
                    )}
                    <div className="flex flex-col items-start gap-1">
                      <StatusSelectField
                        control={form.control}
                        name={`rooms.${index}.status`}
                        onSelect={(v) => {
                          form.setValue(
                            `rooms.${index}.status`,
                            v as z.infer<typeof adStatusSchema>
                          );
                          v != "active" &&
                            form.setValue(
                              `rooms.${index}.available_from`,
                              null
                            );
                          onSubmit(form.getValues());
                          toast({
                            title: `#${room.id} Room status changed to ${v}`,
                          });
                        }}
                        statusDescriptions={statusDescriptions}
                      />
                      {room.status == "active" && (
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.available_from`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available from</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl className="flex flex-wrap gap-1 w-full">
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
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : new Date()
                                    }
                                    onSelect={(v) =>
                                      v && field.onChange(v.toDateString())
                                    }
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.title`}
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
                      name={`rooms.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormDescription>
                            What does the room look like? Does it have any
                            special features? What's included with the room?
                            Describe any other costs or conditions attached to
                            this room
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
                    <SelectField
                      control={form.control}
                      name={`rooms.${index}.room_type`}
                      label="Room type"
                      options={roomTypeSchema.options}
                    />
                    <SelectField
                      control={form.control}
                      name={`rooms.${index}.room_size`}
                      label="Room size"
                      options={roomSizeSchema.options}
                    />
                    {amenities && (
                      <RoomAmenitiesFormField
                        control={form.control}
                        name={`rooms.${index}.room_amenities`}
                        amenities={amenities}
                        room_id={room.id}
                      />
                    )}
                    <RoomTenantsFormField
                      control={form.control}
                      name={`rooms.${index}.room_tenants`}
                      room_id={room.id}
                      refetchRoom={refetchRoom}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
        <div className="flex flex-col space-y-3">
          <AppendButton
            disabled={
              !property_id ||
              form.formState.isSubmitting ||
              (rooms && rooms?.length >= 6)
                ? true
                : false
            }
            onClick={handleAppendRoom}
          >
            Add room
          </AppendButton>
          <Button type="submit" disabled={!property_id} className="mt-3">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomForm;
