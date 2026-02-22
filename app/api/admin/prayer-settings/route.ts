import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPrayerSettings,
  updatePrayerSettings,
  COUNTDOWN_OPTIONS,
  type CountdownMinutes,
} from "@/lib/prayer-settings";

const guardSession = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  return null;
};

export const GET = async () => {
  try {
    const unauthorized = await guardSession();
    if (unauthorized) return unauthorized;
    return NextResponse.json(await getPrayerSettings());
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const unauthorized = await guardSession();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const iqamahCountdown = Number(body?.iqamahCountdownMinutes);

    if (!COUNTDOWN_OPTIONS.includes(iqamahCountdown as CountdownMinutes)) {
      return NextResponse.json(
        { error: "Nilai countdown tidak valid. Pilih 5, 10, atau 15 menit." },
        { status: 400 },
      );
    }

    const updated = await updatePrayerSettings({
      iqamahCountdownMinutes: iqamahCountdown as CountdownMinutes,
      adhanSoundPath: body?.adhanSoundPath ?? "/sounds/adhan-default.mp3",
      iqamahSoundPath: body?.iqamahSoundPath ?? "/sounds/iqamah-default.mp3",
      adhanAlarmEnabled: Boolean(body?.adhanAlarmEnabled),
      iqamahAlarmEnabled: Boolean(body?.iqamahAlarmEnabled),
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 },
    );
  }
};
