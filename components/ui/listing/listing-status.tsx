import { cn } from "@/lib/utils";
import { Badge } from "../badge";
import { Small } from "../typography";

export default function ListingStatus({ status }: { status: string }) {
  return (
    <Badge
      variant={"default"}
      className={cn(
        "rounded-full text-black",
        status == "active" && "bg-green-300",
        status == "paused" && "bg-orange-300",
        status == "inactive" && "bg-red-300"
      )}
    >
      <Small>{status}</Small>
    </Badge>
  );
}
