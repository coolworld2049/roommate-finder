import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "../ui/progress";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { EditIcon, Trash } from "lucide-react";
import { Tables } from "@/types/database.types";

const ProfileAvatarForm: React.FC<
  {
    profile: Tables<"profiles">;
    uploadToSupabase: (id: string, avatar: string | null | undefined) => void;
    refetch: () => Promise<any>;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ profile, uploadToSupabase, refetch, className, ...props }) => {
  const supabase = createClient();

  const [uploadingAvatarProgrees, setUploadingAvatarProgrees] =
    useState<number>(0);

  const [dialogOpen, setDialogOpen] = useState(false);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploadingAvatarProgrees(0);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop()!;
      const pathInStorage = `${profile.id}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(pathInStorage, file, { cacheControl: "0", upsert: true });

      if (error) {
        throw error;
      }
      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(pathInStorage);

      uploadToSupabase(profile.id, publicUrl.publicUrl);
      setUploadingAvatarProgrees(100);
      toast({
        variant: "default",
        title: "Avatar updated",
      });
      window.location.reload()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading avatar",
        description: error.message,
      });
    }
    setDialogOpen(false);
    refetch();
    setUploadingAvatarProgrees(0);
  };

  const deleteAvatar = async () => {
    if (profile?.avatar) {
      const fileExt = profile.avatar.split(".").pop()!;
      const pathInStorage = `${profile.id}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .remove([pathInStorage]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error removing avatar",
          description: error.message,
        });
      }
      toast({
        variant: "default",
        title: "Avatar removed",
      });
      uploadToSupabase(profile.id, null);
      window.location.reload()
    }
    setDialogOpen(false);
    refetch();
    setUploadingAvatarProgrees(0);
  };

  return (
    <div className={cn(className)} {...props}>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="flex flex-row gap-2">
          <DialogTrigger asChild>
            <Button variant="outline">
              <EditIcon className="mr-2" strokeWidth={1} />
              Update photo
            </Button>
          </DialogTrigger>
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => {
              deleteAvatar();
            }}
          >
            <Trash strokeWidth={1} className="mr-2" />
            Delete photo
          </Button>
        </div>
        <DialogContent className={"sm:max-w-[425px]"}>
          <DialogHeader>
            <DialogTitle>Update photo</DialogTitle>
          </DialogHeader>
          {uploadingAvatarProgrees > 0 && (
            <Progress value={uploadingAvatarProgrees} className="h-1" />
          )}
          <Input
            type="file"
            onChange={(event) => {
              uploadAvatar(event);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileAvatarForm;
