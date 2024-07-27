"use client";

import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import RoommateCard from "../listing/RoommateCard";
import PropertyCard from "../listing/PropertyCard";
import { H2, H3, H4, Large, Muted, Small } from "../ui/typography";
import { Badge } from "../ui/badge";
import React, { FunctionComponent } from "react";
import { DatabaseTableProps } from "@/types/database.table.types";
import { cn } from "@/lib/utils";
import { SpinnerCenter } from "../extension/spinner";

const ItemCard = <T extends "roommates" | "properties">({
  ChildrenComponent,
  data,
  recommendations,
  findByKey,
  childrenComponentClassName,
  className,
  carouselProps,
  ...props
}: {
  ChildrenComponent: FunctionComponent<
    DatabaseTableProps<T> &
      React.HTMLAttributes<HTMLDivElement> & {
        carouselProps?: React.HTMLAttributes<HTMLDivElement>;
      }
  >;
  data: Tables<T>[];
  recommendations: Record<string, any>[];
  findByKey: string;
  carouselProps?: React.HTMLAttributes<HTMLDivElement>;
  childrenComponentClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("grid grid-cols-1 xl:grid-cols-2 gap-3", className)}
      {...props}
    >
      {recommendations?.map((rec) => {
        const data_element = data?.find((v) => v.id == rec[findByKey]);
        return (
          data_element && (
            <div className="flex flex-col gap-1.5">
              <Badge className="rounded-full w-fit" variant={"outline"}>
                <Large>Match {Number(rec.score * 100).toFixed(0)}%</Large>
              </Badge>
              <ChildrenComponent
                data={data_element}
                className={cn(childrenComponentClassName)}
                carouselProps={carouselProps}
              />
            </div>
          )
        );
      })}
    </div>
  );
};

export const Recomendation = ({
  roommate_id,
  property_id,
}: {
  roommate_id?: Tables<"roommates">["id"] | null;
  property_id?: Tables<"properties">["id"] | null;
}) => {
  const supabase = createClient();

  const { data: property_recommendations_view } = useQuery(
    supabase
      .from("property_recommendations_view")
      .select("*")
      .eq("property_id", property_id!)
      .maybeSingle()
  );
  const pr_recommendations = property_recommendations_view?.recommendations
    ? (property_recommendations_view?.recommendations as Record<string, any>[])
    : [];

  const { data: roommate_recommendations_view } = useQuery(
    supabase
      .from("roommate_recommendations_view")
      .select("*")
      .eq("roommate_id", roommate_id!)
      .maybeSingle()
  );
  const rm_recommendations = roommate_recommendations_view?.recommendations
    ? (roommate_recommendations_view?.recommendations as Record<string, any>[])
    : [];

  const { data: roommates, isLoading: isLoadingRoommates } = useQuery(
    supabase
      .from("roommates")
      .select("*")
      .in(
        "id",
        pr_recommendations?.map((v) => v.roommate_id)
      )
  );

  const { data: properties, isLoading: isLoadingProperties } = useQuery(
    supabase
      .from("properties")
      .select("*")
      .in(
        "id",
        rm_recommendations?.map((v) => v.property_id)
      )
  );
  if (isLoadingRoommates || isLoadingProperties) return <SpinnerCenter />;

  return (
    <div className="flex flex-col gap-3">
      <H3 className="uppercase">
        Matched {pr_recommendations.length > 0 ? "roommates" : "properties"}
      </H3>
      <ItemCard<"roommates">
        data={roommates!}
        recommendations={pr_recommendations}
        ChildrenComponent={RoommateCard}
        findByKey="roommate_id"
        className="xl:grid-cols-2"
        childrenComponentClassName="md:flex-row"
      />
      <ItemCard<"properties">
        data={properties!}
        recommendations={rm_recommendations}
        ChildrenComponent={PropertyCard}
        findByKey="property_id"
        className="grid-cols-1 xl:grid-cols-1"
        childrenComponentClassName="flex-row md:flex-row xl:flex-row flex-nowrap"
      />
    </div>
  );
};
