import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profile } from "console";

export const POST = async (req: Request) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...mosqueData } = body;
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { mosqueId: true },
    });

    let mosque;

    if (profile?.mosqueId) {
      mosque = await prisma.mosque.update({
        where: { id: profile.mosqueId },
        data: mosqueData,
      });
    } else {
      mosque = await prisma.mosque.create({
        data: mosqueData,
      });
      await prisma.profile.update({
        where: { id: user.id },
        data: { mosqueId: mosque.id },
      });
    }

    return NextResponse.json(mosque);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
};

export const GET = async (req: Request) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { mosqueId: true },
    });

    if (!profile?.mosqueId) {
      return NextResponse.json({ error: "Mosque not found" }, { status: 404 });
    }

    const mosque = await prisma.mosque.findUnique({
      where: { id: profile.mosqueId },
    });

    return NextResponse.json(mosque);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
};
