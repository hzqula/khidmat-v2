"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/register";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import Link from "next/link";

const RegisterForm = () => {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-green-50/30">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-900">
            Daftar Akun Pengurus
          </h1>
          <p className="text-sm text-muted-foreground">
            Silakan isi data untuk mengelola masjid.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Ustadz Fulan"
              required
            />
          </div>

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
            {isPending ? "Mendaftarkan..." : "Daftar Sekarang"}
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-600 hover:underline font-semibold"
            >
              Masuk di sini
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
