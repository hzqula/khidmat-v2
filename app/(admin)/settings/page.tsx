"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellOff,
  Clock,
  Loader2,
  Play,
  Volume2,
  Timer,
  MicVocal,
  FlaskConical,
  Radio,
  StopCircle,
} from "lucide-react";
import { PrayerSettings } from "@/lib/types/prayer-settings";

// ── Daftar suara di /public/sounds/ ──────────────────────────────────────────
const ADHAN_SOUNDS: { label: string; path: string }[] = [
  { label: "Alarm 1", path: "/sounds/alarm1.wav" },
  { label: "Alarm 2", path: "/sounds/alarm2.wav" },
  { label: "Alarm 3", path: "/sounds/alarm3.wav" },
];

const IQAMAH_SOUNDS: { label: string; path: string }[] = [
  { label: "Alarm 1", path: "/sounds/alarm1.wav" },
  { label: "Alarm 2", path: "/sounds/alarm2.wav" },
  { label: "Alarm 3", path: "/sounds/alarm3.wav" },
];

const PRAYER_NAMES = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"] as const;
type PrayerName = (typeof PRAYER_NAMES)[number];

const COUNTDOWN_OPTIONS = [5, 10, 15] as const;

export const BROADCAST_CHANNEL = "khidmat-display-sim";

// ── Types ────────────────────────────────────────────────────────────────────
type FormValues = {
  iqamahCountdownMinutes: 5 | 10 | 15;
  adhanSoundPath: string;
  iqamahSoundPath: string;
  adhanAlarmEnabled: boolean;
  iqamahAlarmEnabled: boolean;
};

/**
 * Pesan simulasi ke display tab.
 * Phase sekarang selalu "iqamah" — tidak ada countdown azan.
 */
export type SimMessage =
  | {
      type: "START_SIM";
      prayer: PrayerName;
      durationSec: number;
      adhanSoundPath: string;
      iqamahSoundPath: string;
      adhanAlarmEnabled: boolean;
      iqamahAlarmEnabled: boolean;
    }
  | { type: "STOP_SIM" };

interface ErrorResponse {
  error: string;
}

// ── Hooks ────────────────────────────────────────────────────────────────────
function useSoundPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const play = (path: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      if (playing === path) {
        setPlaying(null);
        return;
      }
    }
    const audio = new Audio(path);
    audioRef.current = audio;
    setPlaying(path);
    audio
      .play()
      .catch(() => toast.error("File suara tidak ditemukan: " + path));
    audio.onended = () => {
      setPlaying(null);
      audioRef.current = null;
    };
  };

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );
  return { play, playing };
}

function useBroadcast() {
  const chRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    chRef.current = new BroadcastChannel(BROADCAST_CHANNEL);
    return () => chRef.current?.close();
  }, []);
  const send = useCallback((msg: SimMessage) => {
    chRef.current?.postMessage(msg);
  }, []);
  return { send };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CountdownPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: 5 | 10 | 15) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {COUNTDOWN_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={[
            "relative flex flex-col items-center justify-center w-20 h-16 rounded-xl border-2",
            "font-semibold transition-all duration-200 select-none focus:outline-none",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-emerald-400",
            value === opt
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
              : "border-gray-200 bg-white text-gray-500",
          ].join(" ")}
        >
          <span className="text-xl font-bold leading-none">{opt}</span>
          <span className="text-[10px] font-normal mt-0.5 opacity-70">
            menit
          </span>
          {value === opt && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      ))}
    </div>
  );
}

function SoundPicker({
  options,
  value,
  onChange,
  disabled,
  playing,
  onPreview,
}: {
  options: { label: string; path: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  playing: string | null;
  onPreview: (path: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = value === opt.path;
        const isPlaying = playing === opt.path;
        return (
          <div
            key={opt.path}
            onClick={() => !disabled && onChange(opt.path)}
            className={[
              "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-emerald-300",
              isSelected
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-100 bg-white",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${isSelected ? "text-emerald-800" : "text-gray-700"}`}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {opt.path}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onPreview(opt.path);
              }}
              className={[
                "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all",
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700",
                isPlaying
                  ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                  : "bg-gray-50 border-gray-200 text-gray-500",
              ].join(" ")}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Preview
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function QuickSoundButton({ label, path }: { label: string; path: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const audio = new Audio(path);
    audioRef.current = audio;
    setPlaying(true);
    audio.play().catch(() => toast.error("File tidak ditemukan: " + path));
    audio.onended = () => {
      setPlaying(false);
      audioRef.current = null;
    };
  };
  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );
  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
        playing
          ? "bg-emerald-100 border-emerald-400 text-emerald-700"
          : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700",
      ].join(" ")}
    >
      {playing ? (
        <>
          <Volume2 className="w-4 h-4 animate-pulse" />
          Stop
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}

// ── Simulation Panel ──────────────────────────────────────────────────────────
function SimulationPanel({
  settings,
}: {
  settings: PrayerSettings | undefined;
}) {
  const { send } = useBroadcast();

  const SIM_DURATIONS = [
    { label: "30 detik", value: 30 },
    { label: "1 menit", value: 60 },
    { label: "2 menit", value: 120 },
  ];

  const [simDuration, setSimDuration] = useState(30);
  const [simPrayer, setSimPrayer] = useState<PrayerName>("Dzuhur");
  const [activeSim, setActiveSim] = useState<{
    prayer: PrayerName;
    remaining: number;
    total: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSim = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveSim(null);
    send({ type: "STOP_SIM" });
  }, [send]);

  const startSim = useCallback(() => {
    if (!settings) {
      toast.error("Simpan pengaturan terlebih dahulu");
      return;
    }
    stopSim();

    send({
      type: "START_SIM",
      prayer: simPrayer,
      durationSec: simDuration,
      adhanSoundPath: settings.adhanSoundPath,
      iqamahSoundPath: settings.iqamahSoundPath,
      adhanAlarmEnabled: settings.adhanAlarmEnabled,
      iqamahAlarmEnabled: settings.iqamahAlarmEnabled,
    });

    setActiveSim({
      prayer: simPrayer,
      remaining: simDuration,
      total: simDuration,
    });
    timerRef.current = setInterval(() => {
      setActiveSim((prev) => {
        if (!prev) return null;
        if (prev.remaining <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setTimeout(() => {
            send({ type: "STOP_SIM" });
            setActiveSim(null);
          }, 2000);
          return { ...prev, remaining: 0 };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  }, [settings, simPrayer, simDuration, send, stopSim]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const pct = activeSim ? (activeSim.remaining / activeSim.total) * 100 : 0;
  const mins = activeSim
    ? String(Math.floor(activeSim.remaining / 60)).padStart(2, "0")
    : "00";
  const secs = activeSim
    ? String(activeSim.remaining % 60).padStart(2, "0")
    : "00";

  return (
    <Card className="border-violet-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-violet-600" />
          </div>
          Mode Simulasi & Pengujian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Alur simulasi */}
        <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 flex items-start gap-3">
          <Radio className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="text-xs text-violet-700 leading-relaxed space-y-1">
            <p>
              Simulasi mengirim sinyal ke tab{" "}
              <code className="bg-violet-100 px-1 rounded font-mono">
                /display
              </code>
              . Pastikan tab display sudah terbuka di{" "}
              <strong>browser yang sama</strong>.
            </p>
            <p>
              Alur yang disimulasikan: <strong>Alarm Azan berbunyi</strong> → 10
              detik preview → <strong>Countdown Iqamah</strong> berjalan →{" "}
              <strong>Alarm Iqamah berbunyi</strong>.
            </p>
          </div>
        </div>

        {/* Pilihan */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Pilih shalat */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-900">Waktu Shalat</p>
            <div className="flex flex-col gap-1.5">
              {PRAYER_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  disabled={!!activeSim}
                  onClick={() => setSimPrayer(name)}
                  className={[
                    "text-left px-3 py-2 rounded-lg border text-sm transition-all",
                    activeSim
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:border-emerald-300",
                    simPrayer === name
                      ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800"
                      : "border-gray-100 text-gray-600",
                  ].join(" ")}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Pilih durasi */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-900">
              Durasi Countdown Iqamah
            </p>
            <div className="flex flex-col gap-1.5">
              {SIM_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  disabled={!!activeSim}
                  onClick={() => setSimDuration(d.value)}
                  className={[
                    "text-left px-3 py-2 rounded-lg border text-sm transition-all",
                    activeSim
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:border-emerald-300",
                    simDuration === d.value
                      ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800"
                      : "border-gray-100 text-gray-600",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Durasi ini hanya untuk keperluan simulasi. Countdown nyata
              mengikuti pengaturan di atas.
            </p>
          </div>
        </div>

        <Separator />

        {/* Progress bar saat simulasi aktif */}
        {activeSim && (
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-500 uppercase tracking-widest font-semibold mb-0.5">
                  Simulasi Berjalan
                </p>
                <p className="font-bold text-violet-900">
                  Countdown Iqamah — {activeSim.prayer}
                </p>
              </div>
              <span className="font-black text-3xl text-violet-700 tabular-nums">
                {mins}:{secs}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-violet-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-violet-500 text-center">
              Lihat tab <strong>/display</strong> — alarm azan berbunyi lalu
              countdown iqamah tampil
            </p>
          </div>
        )}

        {/* Tombol */}
        <div className="flex gap-3">
          {!activeSim ? (
            <Button
              type="button"
              onClick={startSim}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <Radio className="w-4 h-4" />
              Mulai Simulasi di Display
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={stopSim}
              className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
            >
              <StopCircle className="w-4 h-4" />
              Hentikan Simulasi
            </Button>
          )}
        </div>

        {/* Test suara langsung */}
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-900">
            Test Suara Cepat
          </p>
          <p className="text-xs text-muted-foreground">
            Bunyikan alarm langsung tanpa countdown — untuk memastikan file
            audio terpasang benar.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {settings?.adhanAlarmEnabled && (
              <QuickSoundButton
                label="🔔 Test Alarm Azan"
                path={settings.adhanSoundPath}
              />
            )}
            {settings?.iqamahAlarmEnabled && (
              <QuickSoundButton
                label="📿 Test Alarm Iqamah"
                path={settings.iqamahSoundPath}
              />
            )}
            {!settings?.adhanAlarmEnabled && !settings?.iqamahAlarmEnabled && (
              <p className="text-xs text-muted-foreground italic">
                Semua alarm nonaktif. Aktifkan di bagian pengaturan di atas.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="flex flex-col p-6 bg-green-50/30 min-h-screen gap-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { play, playing } = useSoundPreview();

  const { data: settings, isLoading } = useQuery<PrayerSettings>({
    queryKey: ["prayer-settings"],
    queryFn: async () => {
      const { data } = await api.get("/admin/prayer-settings");
      return data;
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      iqamahCountdownMinutes: 10,
      adhanSoundPath: "/sounds/adhan-default.mp3",
      iqamahSoundPath: "/sounds/iqamah-default.mp3",
      adhanAlarmEnabled: true,
      iqamahAlarmEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        iqamahCountdownMinutes: settings.iqamahCountdownMinutes,
        adhanSoundPath: settings.adhanSoundPath,
        iqamahSoundPath: settings.iqamahSoundPath,
        adhanAlarmEnabled: settings.adhanAlarmEnabled,
        iqamahAlarmEnabled: settings.iqamahAlarmEnabled,
      });
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post("/admin/prayer-settings", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-prayer-settings"] });
      toast.success("Pengaturan shalat berhasil disimpan");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.error || "Gagal menyimpan pengaturan");
    },
  });

  const adhanEnabled = form.watch("adhanAlarmEnabled");
  const iqamahEnabled = form.watch("iqamahAlarmEnabled");

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="flex flex-col p-6 bg-green-50/30 min-h-screen gap-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-4xl font-display text-emerald-900">
          Pengaturan
        </h1>
        <p className="text-muted-foreground mt-1">
          Konfigurasi alarm azan, countdown iqamah, dan suara untuk layar
          display.
        </p>
      </div>

      {/* Alur info banner */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 shrink-0">
          <Bell className="w-4 h-4 text-amber-500" />
          Alarm Azan
        </div>
        <div className="w-8 h-px bg-emerald-300 shrink-0" />
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 shrink-0">
          <Timer className="w-4 h-4 text-emerald-600" />
          Countdown Iqamah
        </div>
        <div className="w-8 h-px bg-emerald-300 shrink-0" />
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 shrink-0">
          <Bell className="w-4 h-4 text-purple-500" />
          Alarm Iqamah
        </div>
        <p className="text-xs text-emerald-600 ml-auto">
          Urutan alur pada layar display
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-6"
      >
        {/* ── 1. Countdown Iqamah ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Timer className="w-4 h-4 text-emerald-600" />
              </div>
              Durasi Countdown Iqamah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Setelah alarm azan berbunyi, countdown iqamah langsung tampil di
              layar display selama durasi ini — memberi tahu jamaah untuk segera
              merapatkan shaf.
            </p>
            <Controller
              control={form.control}
              name="iqamahCountdownMinutes"
              render={({ field }) => (
                <CountdownPicker
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                Contoh: azan Maghrib pukul 18:03, durasi iqamah{" "}
                <strong>{form.watch("iqamahCountdownMinutes")} menit</strong> →
                iqamah dan alarm iqamah berbunyi pukul{" "}
                <strong>
                  {(() => {
                    const d = new Date();
                    d.setHours(18, 3 + form.watch("iqamahCountdownMinutes"), 0);
                    return d.toTimeString().slice(0, 5);
                  })()}
                </strong>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Alarm Azan ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                Alarm Azan
              </div>
              <Controller
                control={form.control}
                name="adhanAlarmEnabled"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    {field.value ? (
                      <Bell className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <Label
                      htmlFor="adhan-toggle"
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      {field.value ? "Aktif" : "Nonaktif"}
                    </Label>
                    <Switch
                      id="adhan-toggle"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p
              className={`text-sm text-muted-foreground ${!adhanEnabled ? "opacity-50" : ""}`}
            >
              Suara yang diputar <strong>tepat saat waktu azan tiba</strong>.
              Setelah alarm ini berbunyi, countdown iqamah langsung dimulai di
              layar display.
            </p>
            <Controller
              control={form.control}
              name="adhanSoundPath"
              render={({ field }) => (
                <SoundPicker
                  options={ADHAN_SOUNDS}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!adhanEnabled}
                  playing={playing}
                  onPreview={play}
                />
              )}
            />
            {!adhanEnabled && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-3">
                <BellOff className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-xs text-gray-400">
                  Alarm azan nonaktif. Countdown iqamah tetap berjalan tapi
                  tidak ada suara azan.
                </p>
              </div>
            )}
            <Separator />
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
              <MicVocal className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-700 leading-relaxed space-y-1">
                <p>
                  Letakkan file audio di{" "}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">
                    public/sounds/
                  </code>
                  .
                </p>
                <p>
                  Format: <strong>MP3</strong>, <strong>OGG</strong>,{" "}
                  <strong>WAV</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 3. Alarm Iqamah ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-600" />
                </div>
                Alarm Iqamah
              </div>
              <Controller
                control={form.control}
                name="iqamahAlarmEnabled"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    {field.value ? (
                      <Bell className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <Label
                      htmlFor="iqamah-toggle"
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      {field.value ? "Aktif" : "Nonaktif"}
                    </Label>
                    <Switch
                      id="iqamah-toggle"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                )}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p
              className={`text-sm text-muted-foreground ${!iqamahEnabled ? "opacity-50" : ""}`}
            >
              Suara yang diputar <strong>saat countdown iqamah habis</strong> —
              menandai jamaah untuk segera berdiri dan merapatkan shaf.
            </p>
            <Controller
              control={form.control}
              name="iqamahSoundPath"
              render={({ field }) => (
                <SoundPicker
                  options={IQAMAH_SOUNDS}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!iqamahEnabled}
                  playing={playing}
                  onPreview={play}
                />
              )}
            />
            {!iqamahEnabled && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-3">
                <BellOff className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-xs text-gray-400">Alarm iqamah nonaktif.</p>
              </div>
            )}
            <Separator />
            <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 flex items-start gap-3">
              <MicVocal className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
              <div className="text-xs text-purple-700 leading-relaxed space-y-1">
                <p>
                  Letakkan file audio di{" "}
                  <code className="bg-purple-100 px-1 py-0.5 rounded font-mono">
                    public/sounds/
                  </code>
                  .
                </p>
                <p>
                  Format: <strong>MP3</strong>, <strong>OGG</strong>,{" "}
                  <strong>WAV</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Ringkasan ─────────────────────────────────────────────────────── */}
        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="text-emerald-800 text-base">
              Ringkasan Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                {
                  label: "Countdown Iqamah",
                  value: `${form.watch("iqamahCountdownMinutes")} menit setelah azan`,
                  icon: Timer,
                  color: "text-emerald-600",
                },
                {
                  label: "Alarm Azan",
                  value: adhanEnabled
                    ? (ADHAN_SOUNDS.find(
                        (s) => s.path === form.watch("adhanSoundPath"),
                      )?.label ?? "—")
                    : "Nonaktif",
                  icon: adhanEnabled ? Bell : BellOff,
                  color: adhanEnabled ? "text-amber-600" : "text-gray-400",
                },
                {
                  label: "Alarm Iqamah",
                  value: iqamahEnabled
                    ? (IQAMAH_SOUNDS.find(
                        (s) => s.path === form.watch("iqamahSoundPath"),
                      )?.label ?? "—")
                    : "Nonaktif",
                  icon: iqamahEnabled ? Bell : BellOff,
                  color: iqamahEnabled ? "text-purple-600" : "text-gray-400",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-emerald-100"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-medium text-emerald-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full md:w-fit bg-emerald-600 hover:bg-emerald-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mutation.isPending ? "Menyimpan…" : "Simpan Pengaturan"}
          </Button>
        </div>
      </form>

      {/* Simulasi — di luar form agar tidak trigger submit */}
      <SimulationPanel settings={settings} />
    </div>
  );
};

export default SettingsPage;
