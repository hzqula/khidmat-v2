"use client";

import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { FaSpinner, FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Announcement } from "@/lib/types/announcement";
import { toast } from "sonner";

interface AnnouncementForm {
  content: string;
}

interface ErrorResponse {
  error: string;
}

const AnnouncementsPage = () => {
  const queryClient = useQueryClient();
  const form = useForm<AnnouncementForm>({
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const { data: announcementItems, isLoading } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await api.get("/admin/announcements");
      return response.data;
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (payload: AnnouncementForm) => {
      return api.post("admin/announcements", payload);
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      toast.success("Pengumuman berhasil dibuat");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.error || "Gagal membuat pengumuman");
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      toast.success("Pengumuman berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus pengumuman"),
  });

  const announcements = announcementItems ?? [];
  const contentValue = form.watch("content") ?? "";

  return (
    <div className="flex flex-col p-6 bg-green-50/30 min-h-screen gap-6">
      <div>
        <h1 className="font-bold text-4xl font-display text-emerald-900">
          Pengumuman
        </h1>
        <p className="text-muted-foreground">
          Buat pengumuman untuk berjalan di halaman display (maksimal 5 item).
        </p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <form
          onSubmit={form.handleSubmit((values) =>
            createAnnouncementMutation.mutate(values),
          )}
          className="space-y-3"
        >
          <label className="font-semibold text-sm text-emerald-900">
            Isi Pengumuman
          </label>
          <textarea
            className="w-full min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            placeholder="Contoh: Kajian ba'da Maghrib dimulai pukul 18.45 WIB"
            maxLength={200}
            {...form.register("content", {
              required: true,
              validate: (value) => value.trim().length > 0,
            })}
          />
          <div className="text-xs text-muted-foreground text-right">
            {contentValue.length}/200 karakter
          </div>

          <Button
            type="submit"
            disabled={
              createAnnouncementMutation.isPending ||
              announcements.length >= 5 ||
              !form.formState.isValid
            }
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {createAnnouncementMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin" /> Menyimpan...
              </>
            ) : (
              "Tambah Pengumuman"
            )}
          </Button>
          {announcements.length >= 5 && (
            <p className="text-sm text-red-600">
              Batas maksimal 5 pengumuman sudah tercapai. Hapus salah satu untuk
              menambah baru.
            </p>
          )}
        </form>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Daftar Pengumuman</h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-muted-foreground">Belum ada pengumuman.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    #{index + 1}
                  </p>
                  <p className="font-medium text-emerald-950">
                    {announcement.content}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={deleteAnnouncementMutation.isPending}
                  onClick={() =>
                    deleteAnnouncementMutation.mutate(announcement.id)
                  }
                >
                  <FaTrash /> Hapus
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
