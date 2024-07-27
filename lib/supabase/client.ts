import { Database } from "@/types/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";
import { TypedSupabaseClient } from "./types";

function _createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as TypedSupabaseClient;
  return client;
}

function createClient() {
  return useMemo(_createClient, []);
}

export { createClient };
