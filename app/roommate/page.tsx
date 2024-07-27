import { getServerUser } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoommateForm from "./roommate-form";
import { cookies } from "next/headers";
import createClient from "@/lib/supabase/server";
import { getProfile } from "@/queries/supabase/profiles";
import { redirect } from "next/navigation";

export default async function RoommatePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: user } = await getServerUser();
  const { data: profile } = await getProfile(supabase, user.user.id);

  if (!profile) {
    redirect("/profile");
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">I'm looking for room</CardTitle>
      </CardHeader>
      <CardContent>
        <RoommateForm profile={profile}></RoommateForm>
      </CardContent>
    </Card>
  );
}
