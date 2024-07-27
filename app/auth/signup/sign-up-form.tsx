"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { boolean, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import {
  ProfileDobField,
  ProfileFullNameField,
  ProfileGenderField,
} from "@/app/profile/profile-form";
import { profileFormSchema } from "@/app/_schemas/profile";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function SignUpForm() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const schema = z.object({
    email: z.string(),
    password: z.string(),
    profile: profileFormSchema.omit({ id: true }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const error = await signup(data);
    if (error) {
      toast({ title: error, variant: "destructive" });
    } else {
      router.push("/profile");
    }
  }

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your email and passowrd to sign up
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 flex flex-col"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ProfileFullNameField
              control={form.control}
              name="profile.full_name"
            />
            <ProfileDobField control={form.control} name="profile.dob" />
            <ProfileGenderField control={form.control} name="profile.gender" />
            <div className="flex items-center space-x-2 py-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(v) =>
                  v !== "indeterminate" && setAcceptTerms(v)
                }
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept{" "}
                <Link href={"/user-agreement"} className="underline">
                  terms and conditions
                </Link>
              </label>
            </div>
            <Button type="submit" disabled={!acceptTerms}>
              Sign up
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline">
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
