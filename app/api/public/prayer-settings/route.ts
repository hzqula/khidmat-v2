import { NextResponse } from "next/server";
import { getPrayerSettings } from "@/lib/prayer-settings";

export const GET = async () => {
  try {
    const settings = await getPrayerSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan shalat" },
      { status: 500 },
    );
  }
};
