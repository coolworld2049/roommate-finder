import React from "react";
import RoommateView from "./roommate-view";
import createClient from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getRoommateWithRelationsById } from "@/queries/supabase/roommates";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

export interface RoommatePageProps {
  params: { id: number };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const RoommatePage = async ({ params }: RoommatePageProps) => {
  const queryClient = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  prefetchQuery(queryClient, getRoommateWithRelationsById(supabase, params.id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoommateView params={params} />
    </HydrationBoundary>
  );
};

export default RoommatePage;
