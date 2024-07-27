import { Database, Tables } from "@/types/database.types";
import { User } from "@supabase/supabase-js";

export interface DatabaseTableProps<
  T extends Extract<keyof Database["public"]["Tables"], string>,
> {
  user?: User;
  data: Tables<T>;
}
