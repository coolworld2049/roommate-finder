"use client";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ForgottenPassword } from "@supabase/auth-ui-react";
import { classAppearance } from "@/app/auth/forgotpassword/form-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordForm() {
  const supabase = createClientComponentClient();

  return (
    <>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Looks like you&apos;ve forgotten your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgottenPassword
            supabaseClient={supabase}
            appearance={classAppearance}
            localization={{
              variables: {
                forgotten_password: {
                  email_label: "Email",
                  button_label: "Send",
                },
              },
            }}
          />
          <div className="mt-2 text-center text-sm">
            Not registered yet?{" "}
            <Link href="/auth/signup" className="underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
