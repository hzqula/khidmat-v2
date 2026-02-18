import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAnnouncement, listAnnouncements } from "@/lib/announcement";

export const GET = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const announcements = await listAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil pengumuman" },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const body = await req.json();
    const created = await createAnnouncement(body?.content ?? "");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Isi pengumuman tidak boleh kosong" ||
        error.message === "Maksimal 5 pengumuman"
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error(error);
    return NextResponse.json(
      { error: "Gagal membuat pengumuman" },
      { status: 500 },
    );
  }
};
