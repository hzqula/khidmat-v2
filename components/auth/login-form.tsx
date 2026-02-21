"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/login";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { FaMosque } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null);

  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-green-50/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4">
            <FaMosque className="text-white text-3xl" />
          </div>
          <h1 className="font-bold text-3xl font-display text-emerald-900">
            Dashboard Masjid
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Masuk untuk mengelola informasi masjid
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@masjid.com"
                          required
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
                        <Input type="password" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {state?.error && (
                  <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {state.error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Memproses..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
