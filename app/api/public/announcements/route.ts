import { NextResponse } from "next/server";
import { listAnnouncements } from "@/lib/announcement";

export const GET = async () => {
  try {
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
