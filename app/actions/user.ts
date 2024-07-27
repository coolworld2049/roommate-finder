"use server";

import createClient from "@/lib/supabase/server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getServerUser = cache(async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    return redirect(`/auth/signin`);
  }
  return { data: user, error: error };
});
