import { getServerUser } from "@/app/actions/user";
import { Recomendation } from "@/components/recommendation/Recomendation";
import createClient from "@/lib/supabase/server";
import { fetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";

export default async function Matches() {
  const queryClient = new QueryClient();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: user } = await getServerUser();

  const { data: property } = await fetchQuery(
    queryClient,
    supabase
      .from("properties")
      .select("id")
      .eq("profile_id", user.user.id)
      .maybeSingle()
  );
  const { data: roommate } = await fetchQuery(
    queryClient,
    supabase
      .from("roommates")
      .select("id")
      .eq("profile_id", user.user.id)
      .maybeSingle()
  );

  return (
    <div className="container py-3">
      <Recomendation property_id={property?.id} roommate_id={roommate?.id} />
    </div>
  );
}
