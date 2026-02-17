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
} from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DevTool } from "@hookform/devtools";
import { toast } from "sonner";
import MapPicker from "@/components/map-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { FaSpinner } from "react-icons/fa6";

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
      const { data } = await api.get("/admin/mosque");
      if (data)
        form.reset({
          ...data,
          district: data.district ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
        });
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: (newMosque: Mosque) => api.post("/admin/mosque", newMosque),
    onSuccess: () => toast.success("Data masjid berhasil disimpan!"),
    onError: () => toast.error("Gagal menyimpan data"),
  });

  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({
      lat,
      lng,
    }: {
      lat: number;
      lng: number;
    }): Promise<ReverseGeocodeResult> => {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(lat),
        lon: String(lng),
        "accept-language": "id",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data wilayah");
      }

      const result = await response.json();
      const address = result?.address ?? {};

      return {
        district:
          address.suburb ??
          address.city_district ??
          address.township ??
          address.village ??
          "",
        city:
          address.city ??
          address.county ??
          address.town ??
          address.state_district ??
          "",
        province: address.state ?? "",
      };
    },

    onSuccess: ({ district, city, province }) => {
      if (district) form.setValue("district", district, { shouldDirty: true });
      if (city) form.setValue("city", city, { shouldDirty: true });
      if (province) form.setValue("province", province, { shouldDirty: true });
      toast.success("Berhasil mendapatkan koordinat");
    },
    onError: () => {
      toast.error("Koordinat tersimpan, tapi autofill wilayah gagal.");
    },
  });

  const onSubmit = (data: Mosque) => {
    mutation.mutate(data);
  };

  if (isLoading)
    return (
      <div className="flex flex-col p-6 bg-green-50/30 min-h-screen gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="border p-6 bg-white rounded-xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="md:col-span-2 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-h-80 w-full rounded-lg" />
            </div>
          </div>

          <Skeleton className="h-10 w-full md:w-40" />
        </div>
      </div>
    );

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
                        value={field.value ?? ""}
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
                      <Input
                        placeholder="Jl. Cendana No. 10..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Koordinat */}

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Mandau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kabupaten / Kota</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Kota Pekanbaru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Provinsi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Riau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 space-y-3">
                <FormLabel>Lokasi Geografis (Peta)</FormLabel>
                <MapPicker
                  lat={form.watch("latitude") ?? 0.507068}
                  lng={form.watch("longitude") ?? 101.447779}
                  onChange={(lat, lng) => {
                    form.setValue("latitude", lat, { shouldDirty: true });
                    form.setValue("longitude", lng, { shouldDirty: true });
                    reverseGeocodeMutation.mutate({ lat, lng });
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Klik peta untuk memilih lokasi. Kecamatan, kabupaten/kota, dan
                  provinsi akan dicoba diisi otomatis dan tetap bisa Anda edit.
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="-mb-2">Latitude</FormLabel>
                  <FormControl className="border-none pl-1 py-0">
                    <Input
                      className="borde-none shadow-none"
                      {...field}
                      type="text"
                      readOnly
                      value={field.value ?? ""}
                    />
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
                  <FormLabel className="-mb-2">Longitude</FormLabel>
                  <FormControl className="border-none pl-1 py-0">
                    <Input
                      className="borde-none shadow-none"
                      {...field}
                      type="text"
                      readOnly
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-fit bg-emerald-600 hover:bg-emerald-700"
              disabled={mutation.isPending || reverseGeocodeMutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </Form>
      </div>
      <DevTool control={form.control} />
    </div>
  );
};

export default DashboardPage;
