"use client";

import { useActionState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { login } from "@/lib/actions/login";
import { Card } from "../ui/card";

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Card className="w-1/2 p-8">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@masjid.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {state?.error && (
            <div className="p-3 text-sm bg-red-100 border border-red-200 text-red-600 rounded-md">
              {state.error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? "Memproses..." : "Masuk ke Dashboard"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
