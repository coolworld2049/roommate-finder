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
import { z } from "zod";
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
import { signin } from "@/app/actions/auth";
import Link from "next/link";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { PasswordInput } from "@/components/extension/password-input";

export default function SignInForm() {
  const schema: z.ZodType<SignInWithPasswordCredentials> = z.object({
    email: z.string(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const error = await signin(data);
    error &&
      toast({
        title: "Something went wrong",
        description: error,
        variant: "destructive",
      });
  }

  return (
    <>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email and passowrd to sign in
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
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
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
                      <PasswordInput placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Sign in</Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline">
                  Create an account
                </Link>
              </div>
              <Link
                href="/auth/forgotpassword"
                className="text-center text-sm underline"
              >
                Forgot your password?
              </Link>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
