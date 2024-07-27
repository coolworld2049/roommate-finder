"use client";

import { CopyIcon } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { toast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

const ButtonClipboard: React.FC<
  {
    label?: string;
    link: string;
  } & ButtonProps &
    React.RefAttributes<HTMLButtonElement>
> = ({ label, link, className, ...props }) => {
  return (
    <Button
      variant="link"
      size={"icon"}
      {...props}
      onClick={() =>
        navigator.clipboard
          .writeText(link)
          .then(() => {
            toast({ title: "Copied to clipboard", description: link });
          })
          .catch(() => {
            toast({
              title: "Something went wrong",
              variant: "destructive",
              description: link,
            });
          })
      }
    >
      {label}
      <CopyIcon className={cn(label ? "ml-2" : "")} size={20} />
    </Button>
  );
};

export default ButtonClipboard;
