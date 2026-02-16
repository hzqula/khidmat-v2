"use client";

import { Mosque } from "@/lib/types/mosque";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DevTool } from "@hookform/devtools";
import { toast } from "sonner";
import MapPicker from "@/components/map-picker";

const DashboardPage = () => {
  const form = useForm<Mosque>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      province: "",
      timezone: "Asia/Jakarta",
      latitude: 0,
      longitude: 0,
    },
  });

  const { isLoading } = useQuery({
    queryKey: ["mosque"],
    queryFn: async () => {
      const { data } = await api.get("/mosque");
      if (data) form.reset(data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newMosque: Mosque) => api.post("/mosque", newMosque),
    onSuccess: () => toast.success("Data masjid berhasil disimpan!"),
    onError: () => toast.error("Gagal menyimpan data"),
  });

  const onSubmit = (data: Mosque) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="flex flex-col p-6 bg-green-50/30 min-h-screen">
      <div className="mb-6">
        <h1 className="font-bold text-4xl font-display text-emerald-900">
          Detail Masjid
        </h1>
        <p className="text-muted-foreground">
          Atur informasi dasar dan lokasi untuk jadwal shalat.
        </p>
      </div>

      <div className="border p-6 bg-white rounded-xl shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Masjid */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Masjid</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Masjid Agung An-Nur"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alamat */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Jl. Cendana No. 10..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Koordinat */}
              <div className="md:col-span-2 space-y-3">
                <FormLabel>Lokasi Geografis (Peta)</FormLabel>
                <MapPicker
                  lat={form.watch("latitude")}
                  lng={form.watch("longitude")}
                  onChange={(lat, lng) => {
                    form.setValue("latitude", lat);
                    form.setValue("longitude", lng);
                  }}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-fit bg-emerald-600 hover:bg-emerald-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </Form>
      </div>
      <DevTool control={form.control} />
    </div>
  );
};

export default DashboardPage;
