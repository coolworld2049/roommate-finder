import React from "react";
import { getProfileWithRelations } from "@/queries/supabase/profiles";
import { cookies } from "next/headers";
import createClient from "@/lib/supabase/server";
import ProfileCard from "@/components/profile/ProfileCard";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getServerUser } from "@/app/actions/user";

export interface ProfilePageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const queryClient = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: user } = await getServerUser();

  prefetchQuery(queryClient, getProfileWithRelations(supabase, params.id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileCard
        params={params}
        userCanEditSelf={user.user.id == params.id}
        user={user.user}
      />
    </HydrationBoundary>
  );
};

export default ProfilePage;
