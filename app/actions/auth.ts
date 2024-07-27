"use server";

import { profileFormSchema } from "@/app/_schemas/profile";
import createClient from "@/lib/supabase/server";
import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signin = async (data: SignInWithPasswordCredentials) => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.signInWithPassword({
    ...data,
  });

  if (error) {
    console.error(error);
    return error.message;
  }
  revalidatePath('/', 'layout')
  return redirect("/");
};

const signup = async (
  data: SignUpWithPasswordCredentials & {
    profile: Omit<z.infer<typeof profileFormSchema>, "id">;
  }
) => {
  const referer = headers().get("referer");
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const errors: string[] = [];

  data.options = {
    emailRedirectTo: `${referer}/auth/callback`,
  };

  const { data: user, error: user_error } = await supabase.auth.signUp(data);
  user_error && errors.push(user_error.message);
  
  if (user.user) {
    const { error: profile_error } = await supabase
      .from("profiles")
      .insert({ id: user.user.id, ...data.profile });
    profile_error && errors.push(profile_error.message);
  }

  console.error(errors);

  revalidatePath('/', 'layout')
  return errors.join(";");
};

export { signin, signup };
