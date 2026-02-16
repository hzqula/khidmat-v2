"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function login(prevState: unknown, formData: FormData) {
  // Tambahkan prevState di sini
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau Password salah" };
  }

  redirect("/dashboard");
}
