import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const ANNOUNCEMENT_LIMIT = 5;

export interface AnnouncementRecord {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const listAnnouncements = async () => {
  const announcements = await prisma.$queryRaw<AnnouncementRecord[]>`
    SELECT id, content, "createdAt", "updatedAt"
    FROM announcements
    ORDER BY "createdAt" DESC
    LIMIT ${ANNOUNCEMENT_LIMIT}
  `;

  return announcements;
};

export const createAnnouncement = async (content: string) => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Isi pengumuman tidak boleh kosong");
  }

  const totalRows = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*)::bigint AS total FROM announcements
  `;
  const total = Number(totalRows[0]?.total ?? 0);

  if (total >= ANNOUNCEMENT_LIMIT) {
    throw new Error("Maksimal 5 pengumuman");
  }

  const created = await prisma.$queryRaw<AnnouncementRecord[]>`
    INSERT INTO announcements (id, content, "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${trimmedContent}, NOW(), NOW())
    RETURNING id, content, "createdAt", "updatedAt"
  `;

  return created[0];
};

export const deleteAnnouncement = async (id: string) => {
  await prisma.$executeRaw`
    DELETE FROM announcements
    WHERE id = ${id}
  `;
};
