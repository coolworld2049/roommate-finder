import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import createClient from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import ProfileAvatar from "./profile/ProfileAvatar";
import ThemeToggle from "./ThemeToggle";
import { SquarePlusIcon } from "lucide-react";
import { Small } from "./ui/typography";

const NavMenu = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: user } = await supabase.auth.getUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full w-14 h-14"
        >
          <ProfileAvatar profile_id={user.user?.id} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        {!user.user && (
          <Link href={`/auth/signin`}>
            <Button className="w-full">
              <Small>Sign in</Small>
            </Button>
          </Link>
        )}
        {user.user && (
          <Link href={`/create`}>
            <DropdownMenuItem>
              <Button variant={"secondary"} className="w-full">
                <SquarePlusIcon className="mr-1" size={18} />
                <Small>Create an ad</Small>
              </Button>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <Link href={user.user ? `/profile/${user.user?.id}` : "/profile"}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </Link>
        <Link href={`/matches`}>
          <DropdownMenuItem>Matches</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <ThemeToggle />
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <Button variant={"secondary"} type={"submit"} className="w-full">
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavMenu;
