import { getServerUser } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "./profile-form";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
  getHigherEducationSpecialties,
  getProfile,
  getProfileSocials,
  getProfileUniversity,
} from "@/queries/supabase/profiles";
import createClient from "@/lib/supabase/server";

export default async function Profile() {
  const { data: user } = await getServerUser();
  const queryClient = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  prefetchQuery(queryClient, getProfile(supabase, user.user.id));
  prefetchQuery(queryClient, getProfileUniversity(supabase, user.user.id));
  prefetchQuery(queryClient, getProfileSocials(supabase, user.user.id));
  prefetchQuery(queryClient, getProfileSocials(supabase, user.user.id));
  prefetchQuery(queryClient, getHigherEducationSpecialties(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container max-w-3xl">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user.user}></ProfileForm>
          </CardContent>
        </Card>
      </div>
    </HydrationBoundary>
  );
}
