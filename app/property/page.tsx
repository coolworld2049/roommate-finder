import { getServerUser } from "@/app/actions/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyForm from "./property-form";
import { cookies } from "next/headers";
import createClient from "@/lib/supabase/server";
import { getProfile } from "@/queries/supabase/profiles";
import RoomForm from "./room/room-form";
import { getPropertyByProfileId } from "@/queries/supabase/properties";
import { redirect } from "next/navigation";

export default async function PropertyPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: user } = await getServerUser();
  const { data: profile } = await getProfile(supabase, user.user.id);

  if (!profile) {
    redirect("/profile");
  }

  const { data: property } = await getPropertyByProfileId(supabase, profile.id);
  console.log(property)
  return (
    <Tabs defaultValue="property" className="mx-auto max-w-4xl">
      <TabsList className="grid grid-flow-col grid-cols-2">
        <TabsTrigger value="property">Property</TabsTrigger>
        <TabsTrigger value="rooms">Rooms</TabsTrigger>
      </TabsList>
      <TabsContent value="property">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">I'm offering rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm profile={profile}></PropertyForm>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="rooms">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rooms</CardTitle>
            <CardDescription>
              You can add rooms available for rent as well as those currently
              occupied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoomForm property_id={property?.id!}></RoomForm>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
