import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;
