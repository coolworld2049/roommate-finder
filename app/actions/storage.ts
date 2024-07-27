import { TypedSupabaseClient } from "@/lib/supabase/types";

export const uploadToStorage = async ({
  supabase,
  bucket,
  file,
  path,
}: {
  supabase: TypedSupabaseClient;
  bucket: string;
  file: File;
  path: string;
}) => {
  const pathInStorage = `${path}/${file.name}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(pathInStorage, file, { cacheControl: "0", upsert: true });

  const { data } = supabase.storage.from(bucket).getPublicUrl(pathInStorage);

  return { data, error };
};

export const removeFolderInStorage = async ({
  supabase,
  bucket,
  folder,
}: {
  supabase: TypedSupabaseClient;
  bucket: string;
  folder: string;
}) => {
  const { data: list } = await supabase.storage.from(bucket).list(folder);

  if (list) {
    const filesToRemove = list.map((x) => `${folder}/${x.name}`);
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filesToRemove);

    return { data, error };
  }
};
