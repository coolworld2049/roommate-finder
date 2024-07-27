import { Button } from "@/components/ui/button";
import {
  fetchQuery,
  prefetchQuery,
} from "@supabase-cache-helpers/postgrest-react-query";
import { QueryClient } from "@tanstack/react-query";
import { DoorOpenIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { getServerUser } from "../actions/user";
import createClient from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getProfile } from "@/queries/supabase/profiles";
import { Muted } from "@/components/ui/typography";



const CreateListingPage = async () => {
  const qc = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: user } = await getServerUser();

  await prefetchQuery(qc, getProfile(supabase, user.user.id));

  const { count: propertyCount } = await fetchQuery(
    qc,
    supabase
      .from("properties")
      .select("id", { count: "exact" })
      .eq("profile_id", user.user.id)
      .eq("status", "active")
  );

  const { count: roommateCount } = await fetchQuery(
    qc,
    supabase
      .from("roommates")
      .select("id", { count: "exact" })
      .eq("profile_id", user.user.id)
      .eq("status", "active")
  );
  const roommateDisabled = propertyCount && propertyCount > 0 ? true : false;
  const propertyDisabled = roommateCount && roommateCount > 0 ? true : false;

  const messageDisbled = (
    <Muted className="text-destructive">
      Remove another ad or change its status to inactive
    </Muted>
  );

  return (
    <div className="container flex flex-col gap-3 items-center justify-start my-56 ">
      <h3 className="font-bold text-3xl">What do you want to create</h3>
      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <div className="flex flex-col gap-3 items-center">
          <DoorOpenIcon className="mr-1" size={64} strokeWidth={1} />
          <Button
            className="text-lg"
            size={"lg"}
            variant={"outline"}
            disabled={roommateDisabled}
          >
            <Link href="roommate">I'm looking for a room</Link>
          </Button>
          {roommateDisabled && messageDisbled}
        </div>
        <div className="flex flex-col gap-3 items-center">
          <UsersIcon className="mr-1" size={64} strokeWidth={1} />
          <Button
            className="text-lg"
            size={"lg"}
            variant={"outline"}
            disabled={propertyDisabled}
          >
            <Link href="property">I`m looking for roommates</Link>
          </Button>
          {propertyDisabled && messageDisbled}
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
