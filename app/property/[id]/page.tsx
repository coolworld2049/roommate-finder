import React from "react";
import { cookies } from "next/headers";
import createClient from "@/lib/supabase/server";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getPropertyWithRelationsById } from "@/queries/supabase/properties";
import PropertyView from "./property-view";
import YMapProvider from "@/providers/ymap-provider";

export interface PropertyPageProps {
  params: { id: number };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const queryClient = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  prefetchQuery(queryClient, getPropertyWithRelationsById(supabase, params.id));

  return (
    <YMapProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PropertyView params={params} />
      </HydrationBoundary>
    </YMapProvider>
  );
};

export default PropertyPage;
