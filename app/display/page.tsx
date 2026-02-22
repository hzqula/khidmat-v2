"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaMosque, FaLocationDot, FaSun, FaCloudSun } from "react-icons/fa6";
import { RiMoonClearFill } from "react-icons/ri";
import { GiStripedSun } from "react-icons/gi";
import { PiNetworkSlash, PiSunHorizonFill } from "react-icons/pi";
import Image from "next/image";
import api from "@/lib/axios";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import moment from "moment-timezone";
import type { Announcement } from "@/lib/types/announcement";
import type { DisplayImage } from "@/lib/types/display-image";
import type { WeeklyFinanceSummary } from "@/lib/types/finance";
import type { PrayerSettings } from "@/lib/types/prayer-settings";
import type { SimMessage } from "@/app/(admin)/settings/page";

// ─────────────────────────────────────────────────────────────────────────────
const BROADCAST_CHANNEL = "khidmat-display-sim";
const PREVIEW_SECONDS = 10;

const PRAYER_STYLES = [
  { accent: "#4ade80" },
  { accent: "#fbbf24" },
  { accent: "#f97316" },
  { accent: "#60a5fa" },
  { accent: "#a78bfa" },
];

// ── Types ────────────────────────────────────────────────────────────────────
/** State iqamah countdown yang sedang tampil (real atau simulasi) */
type IqamahCountdown = {
  prayer: string;
  remaining: string; // "MM:SS"
  remainingSec: number;
  isSim?: boolean;
};

type SimStage = "preview" | "adhan-alarm" | "countdown";

type SimState = {
  stage: SimStage;
  previewLeft: number;
  prayer: string;
  remainingSec: number;
  total: number;
  adhanSoundPath: string;
  iqamahSoundPath: string;
  adhanAlarmEnabled: boolean;
  iqamahAlarmEnabled: boolean;
  iqamahAlarmFired: boolean;
};

// ── Alarm hook ────────────────────────────────────────────────────────────────
function useAlarm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  const fire = useCallback((path: string, key: string) => {
    if (firedRef.current.has(key)) return;
    firedRef.current.add(key);
    audioRef.current?.pause();
    const audio = new Audio(path);
    audioRef.current = audio;
    audio.play().catch(() => console.warn("Audio gagal diputar:", path));
  }, []);

  // Bersihkan key kemarin tiap menit
  useEffect(() => {
    const id = setInterval(() => {
      const today = moment().format("YYYY-MM-DD");
      firedRef.current.forEach((k) => {
        if (!k.endsWith(today)) firedRef.current.delete(k);
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return { fire };
}

// ── Preview badge (pojok atas slider, saat sim stage = "preview") ────────────
function PreviewBadge({ sim }: { sim: SimState }) {
  if (sim.stage !== "preview") return null;
  const pct = (sim.previewLeft / PREVIEW_SECONDS) * 100;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
      style={{ animation: "fadeSlideDown 0.5s ease-out both" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-md"
        style={{
          background: "#60a5fa22",
          border: "1px solid #60a5fa60",
          color: "#60a5fa",
        }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse bg-[#60a5fa]" />
        SIMULASI — Countdown Iqamah {sim.prayer}
      </div>
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-14 h-14 -rotate-90"
          viewBox="0 0 56 56"
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <span className="text-base font-black tabular-nums text-[#60a5fa]">
          {sim.previewLeft}
        </span>
      </div>
    </div>
  );
}

// ── Adhan alarm flash overlay (sim stage = "adhan-alarm") ───────────────────
function AdhanFlashOverlay({ sim }: { sim: SimState }) {
  if (sim.stage !== "adhan-alarm") return null;
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #fbbf2418, #fbbf2408)",
        border: "2px solid #fbbf2460",
        animation: "fadeIn 0.5s ease-out both",
      }}
    >
      <div className="absolute top-4 right-4 bg-violet-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
        SIMULASI
      </div>
      {/* Pulsing bell */}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
        style={{
          background: "radial-gradient(circle, #fbbf2430 0%, transparent 70%)",
          boxShadow: "0 0 60px #fbbf2440",
          animation: "pulseRing 1s ease-out infinite",
          color: "#fbbf24",
        }}
      >
        🔔
      </div>
      <div
        className="text-center"
        style={{ animation: "fadeSlideUp 0.5s 0.2s ease-out both" }}
      >
        <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-1">
          Waktu Azan
        </p>
        <p className="font-black text-4xl font-display text-[#fbbf24]">
          {sim.prayer}
        </p>
        <p className="text-[#fbbf24]/60 text-xs mt-2 tracking-widest">
          Countdown Iqamah dimulai…
        </p>
      </div>
    </div>
  );
}

// ── Iqamah countdown overlay ─────────────────────────────────────────────────
function IqamahCountdownOverlay({ cs }: { cs: IqamahCountdown }) {
  const accent = "#60a5fa";
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
        border: `2px solid ${accent}60`,
        animation: "fadeIn 0.8s ease-out both",
      }}
    >
      {cs.isSim && (
        <div className="absolute top-4 right-4 bg-violet-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
          SIMULASI
        </div>
      )}

      <div
        className="w-44 h-44 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          boxShadow: `0 0 80px ${accent}40`,
          animation: "pulseRing 2s ease-out infinite",
        }}
      >
        <div
          className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-2"
          style={{ borderColor: `${accent}80`, background: `${accent}15` }}
        >
          <span
            className="font-black tabular-nums leading-none"
            style={{ fontSize: "2.4rem", color: accent }}
          >
            {cs.remaining}
          </span>
          <span
            className="text-[10px] mt-1 font-semibold tracking-widest uppercase"
            style={{ color: `${accent}cc` }}
          >
            menit
          </span>
        </div>
      </div>

      <div
        className="text-center"
        style={{ animation: "fadeSlideUp 0.6s 0.3s ease-out both" }}
      >
        <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-1">
          Iqamah {cs.prayer} dalam
        </p>
        <p
          className="font-black text-4xl font-display"
          style={{ color: accent }}
        >
          {cs.prayer}
        </p>
      </div>
    </div>
  );
}

// ── Main Display Page ─────────────────────────────────────────────────────────
const DisplayPage = () => {
  const [now, setNow] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);
  const [tick, setTick] = useState(false);
  const [sim, setSim] = useState<SimState | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fire } = useAlarm();

  // ── BroadcastChannel: terima sinyal dari Settings tab ────────────────────
  useEffect(() => {
    const ch = new BroadcastChannel(BROADCAST_CHANNEL);

    ch.onmessage = (event: MessageEvent<SimMessage>) => {
      const msg = event.data;

      if (msg.type === "STOP_SIM") {
        if (simTimerRef.current) {
          clearInterval(simTimerRef.current);
          simTimerRef.current = null;
        }
        setSim(null);
        return;
      }

      if (msg.type === "START_SIM") {
        if (simTimerRef.current) {
          clearInterval(simTimerRef.current);
          simTimerRef.current = null;
        }

        // Fase 1: preview — 10 detik tampilan normal
        setSim({
          stage: "preview",
          previewLeft: PREVIEW_SECONDS,
          prayer: msg.prayer,
          remainingSec: msg.durationSec,
          total: msg.durationSec,
          adhanSoundPath: msg.adhanSoundPath,
          iqamahSoundPath: msg.iqamahSoundPath,
          adhanAlarmEnabled: msg.adhanAlarmEnabled,
          iqamahAlarmEnabled: msg.iqamahAlarmEnabled,
          iqamahAlarmFired: false,
        });

        simTimerRef.current = setInterval(() => {
          setSim((prev) => {
            if (!prev) return null;

            // ── FASE PREVIEW ──────────────────────────────────────────────
            if (prev.stage === "preview") {
              const next = prev.previewLeft - 1;
              if (next <= 0) {
                // Preview habis → nyalakan alarm azan, lalu masuk adhan-alarm (1.5 detik)
                if (prev.adhanAlarmEnabled) {
                  const audio = new Audio(prev.adhanSoundPath);
                  audio
                    .play()
                    .catch(() => console.warn("Alarm azan sim gagal"));
                }
                // Setelah 1.5 detik, masuk fase countdown iqamah
                setTimeout(() => {
                  setSim((s) => (s ? { ...s, stage: "countdown" } : null));
                }, 1500);
                return { ...prev, stage: "adhan-alarm", previewLeft: 0 };
              }
              return { ...prev, previewLeft: next };
            }

            // ── FASE ADHAN-ALARM (tunggu setTimeout di atas) ──────────────
            if (prev.stage === "adhan-alarm") return prev;

            // ── FASE COUNTDOWN IQAMAH ─────────────────────────────────────
            if (prev.remainingSec <= 1 && !prev.iqamahAlarmFired) {
              if (prev.iqamahAlarmEnabled) {
                const audio = new Audio(prev.iqamahSoundPath);
                audio
                  .play()
                  .catch(() => console.warn("Alarm iqamah sim gagal"));
              }
              setTimeout(() => {
                if (simTimerRef.current) {
                  clearInterval(simTimerRef.current);
                  simTimerRef.current = null;
                }
                setSim(null);
              }, 3000);
              return { ...prev, remainingSec: 0, iqamahAlarmFired: true };
            }
            if (prev.iqamahAlarmFired) return prev;
            return { ...prev, remainingSec: prev.remainingSec - 1 };
          });
        }, 1000);
      }
    };

    return () => ch.close();
  }, []);

  useEffect(
    () => () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    },
    [],
  );

  // ── Queries ───────────────────────────────────────────────────────────────
  const {
    data: mosque,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mosque-settings"],
    queryFn: async () => {
      const { data } = await api.get("/public/mosque");
      return data;
    },
    refetchInterval: 600_000,
  });
  const { data: displayImages } = useQuery<DisplayImage[]>({
    queryKey: ["public-images"],
    queryFn: async () => {
      const { data } = await api.get("/public/images");
      return data;
    },
    refetchInterval: 120_000,
  });
  const { data: announcementItems } = useQuery<Announcement[]>({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data } = await api.get("/public/announcements");
      return data;
    },
    refetchInterval: 60_000,
  });
  const { data: weeklyFinance } = useQuery<WeeklyFinanceSummary>({
    queryKey: ["public-weekly-finance"],
    queryFn: async () => {
      const { data } = await api.get("/public/finance/weekly");
      return data;
    },
    refetchInterval: 1_800_000,
  });
  const { data: prayerSettings } = useQuery<PrayerSettings>({
    queryKey: ["public-prayer-settings"],
    queryFn: async () => {
      const { data } = await api.get("/public/prayer-settings");
      return data;
    },
    refetchInterval: 300_000,
  });

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setTick((t) => !t);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Prayer times ──────────────────────────────────────────────────────────
  const prayerData = useMemo(() => {
    if (!mosque || mosque.latitude == null || mosque.longitude == null)
      return null;
    const coords = new Coordinates(mosque.latitude, mosque.longitude);
    const params = CalculationMethod.Singapore();
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    const pt = new PrayerTimes(coords, now, params);
    const tz = mosque.timezone || "Asia/Jakarta";
    const fmt = (d: Date) => moment(d).tz(tz).format("HH:mm");
    return [
      {
        nama: "Subuh",
        waktu: fmt(pt.fajr),
        rawDate: pt.fajr,
        icon: <GiStripedSun />,
      },
      {
        nama: "Dzuhur",
        waktu: fmt(pt.dhuhr),
        rawDate: pt.dhuhr,
        icon: <FaSun />,
      },
      {
        nama: "Ashar",
        waktu: fmt(pt.asr),
        rawDate: pt.asr,
        icon: <FaCloudSun />,
      },
      {
        nama: "Maghrib",
        waktu: fmt(pt.maghrib),
        rawDate: pt.maghrib,
        icon: <PiSunHorizonFill />,
      },
      {
        nama: "Isya",
        waktu: fmt(pt.isha),
        rawDate: pt.isha,
        icon: <RiMoonClearFill />,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosque, now.toDateString()]);

  // ── Real-time alarm & iqamah countdown ───────────────────────────────────
  //
  // Alur nyata:
  //   1. Tepat waktu azan (±5 detik window) → fire alarm azan
  //   2. Setelah azan s/d iqamahCountdown berlalu → tampilkan countdown iqamah
  //   3. Tepat iqamah (±5 detik) → fire alarm iqamah
  //
  const realIqamahCountdown = useMemo((): IqamahCountdown | null => {
    if (!prayerData || !prayerSettings || sim) return null;

    const iqamahMin = (prayerSettings.iqamahCountdownMinutes ?? 10) * 60;
    const nowSec = now.getTime() / 1000;

    for (const prayer of prayerData) {
      const prayerSec = prayer.rawDate.getTime() / 1000;
      const iqamahSec = prayerSec + iqamahMin;

      const diffToAdhan = nowSec - prayerSec; // positif = sudah lewat azan
      const diffToIqamah = iqamahSec - nowSec; // positif = iqamah belum tiba

      // Alarm azan: tepat saat waktu azan (window ±5 detik)
      if (
        diffToAdhan >= 0 &&
        diffToAdhan < 5 &&
        prayerSettings.adhanAlarmEnabled
      ) {
        fire(
          prayerSettings.adhanSoundPath,
          `adhan-${prayer.nama}-${moment(now).format("YYYY-MM-DD")}`,
        );
      }

      // Countdown iqamah: dari waktu azan sampai iqamah tiba
      if (diffToAdhan >= 0 && diffToIqamah > 0) {
        const m = Math.floor(diffToIqamah / 60);
        const s = Math.floor(diffToIqamah % 60);
        return {
          prayer: prayer.nama,
          remaining: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
          remainingSec: Math.floor(diffToIqamah),
        };
      }

      // Alarm iqamah: tepat saat iqamah tiba (window ±5 detik)
      if (
        diffToAdhan >= 0 &&
        diffToIqamah >= -5 &&
        diffToIqamah < 0 &&
        prayerSettings.iqamahAlarmEnabled
      ) {
        fire(
          prayerSettings.iqamahSoundPath,
          `iqamah-${prayer.nama}-${moment(now).format("YYYY-MM-DD")}`,
        );
      }
    }
    return null;
  }, [prayerData, prayerSettings, now, sim, fire]);

  // Countdown yang ditampilkan: sim takes priority
  const iqamahCountdown: IqamahCountdown | null = (() => {
    if (sim && sim.stage === "countdown") {
      return {
        prayer: sim.prayer,
        remaining: `${String(Math.floor(sim.remainingSec / 60)).padStart(2, "0")}:${String(sim.remainingSec % 60).padStart(2, "0")}`,
        remainingSec: sim.remainingSec,
        isSim: true,
      };
    }
    return realIqamahCountdown;
  })();

  // Apakah ada sesuatu yang menggelapkan slider?
  const sliderDimmed = !!iqamahCountdown || sim?.stage === "adhan-alarm";

  // ── Slide rotation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!displayImages || displayImages.length <= 1) {
      setActiveSlide(0);
      return;
    }
    const id = setInterval(
      () => setActiveSlide((p) => (p + 1) % displayImages.length),
      8000,
    );
    return () => clearInterval(id);
  }, [displayImages]);

  const currentSlide = displayImages?.length
    ? displayImages[activeSlide % displayImages.length]
    : null;
  const currentTimeStr = moment(now).format("HH:mm");
  const nextIdx = prayerData?.findIndex((s) => s.waktu > currentTimeStr) ?? -1;
  const nextName =
    nextIdx >= 0 ? prayerData?.[nextIdx]?.nama : prayerData?.[0]?.nama;

  // Running text
  const financeText = weeklyFinance
    ? (() => {
        const rp = (v: number) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(v);
        const sm =
          weeklyFinance.totalMasukMasjid - weeklyFinance.totalKeluarMasjid;
        const sy =
          weeklyFinance.totalMasukYatim - weeklyFinance.totalKeluarYatim;
        return `KEUANGAN PEKAN INI — KAS MASJID: SALDO ${rp(sm)} (MASUK ${rp(weeklyFinance.totalMasukMasjid)}, KELUAR ${rp(weeklyFinance.totalKeluarMasjid)}) · KAS YATIM: SALDO ${rp(sy)} (MASUK ${rp(weeklyFinance.totalMasukYatim)}, KELUAR ${rp(weeklyFinance.totalKeluarYatim)})`;
      })()
    : "";
  const runningText = announcementItems?.length
    ? announcementItems
        .map((a, i) => `${i + 1}. ${a.content.toUpperCase()}`)
        .join("   ✦   ") + (financeText ? `   ✦   ${financeText}` : "")
    : `SELAMAT DATANG DI ${(mosque?.name ?? "MASJID").toUpperCase()} — JAGALAH KEBERSIHAN MASJID KITA BERSAMA.${financeText ? `   ✦   ${financeText}` : ""}`;

  // ── Loading / error screens ───────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0a1f14] gap-4">
        <FaMosque className="text-6xl text-gold animate-pulse" />
        <p className="text-xl font-semibold tracking-widest uppercase text-gold">
          Inisialisasi…
        </p>
      </div>
    );

  const ErrorScreen = ({ title, desc }: { title: string; desc: string }) => (
    <div className="w-screen h-screen bg-[#0a1f14] text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full border border-gold/30 bg-white/5 backdrop-blur-md rounded-3xl p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-5xl">
          <PiNetworkSlash />
        </div>
        <h2 className="text-4xl font-bold mb-3 text-gold">{title}</h2>
        <p className="text-lg text-emerald-100 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
  if (isError)
    return (
      <ErrorScreen
        title="Koneksi Bermasalah"
        desc="Gagal memuat data masjid. Silakan cek koneksi jaringan."
      />
    );
  if (!prayerData)
    return (
      <ErrorScreen
        title="Koordinat Belum Diatur"
        desc="Buka dashboard admin dan pilih lokasi pada peta."
      />
    );

  return (
    <>
      <style>{`
        @keyframes fadeIn        { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateX(-50%) translateY(-16px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
        @keyframes fadeSlideUp   { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulseRing     { 0%,100% { opacity: 0.8 } 50% { opacity: 1 } }
      `}</style>

      <div className="w-screen h-screen bg-[#071410] overflow-hidden flex flex-col select-none">
        {/* ═══ HEADER ══════════════════════════════════════════════════════ */}
        <header className="relative bg-linear-to-r from-[#0d2b1a] via-[#0f3320] to-[#0d2b1a] border-b-2 border-gold/60 shrink-0 px-8 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-gold/10 border border-gold/40 rounded-xl p-2.5 shrink-0">
              <FaMosque className="text-gold text-4xl" />
            </div>
            <h1 className="text-gold font-display font-extrabold text-5xl leading-tight tracking-wide truncate">
              {mosque.name}
            </h1>
          </div>

          <div className="flex flex-col items-center shrink-0 mr-48">
            <div
              className="text-white font-black tracking-tight"
              style={{ fontSize: "5rem", lineHeight: 1 }}
            >
              {moment(now).format("HH")}
              <span
                className="transition-opacity duration-200"
                style={{ opacity: tick ? 1 : 0.2 }}
              >
                :
              </span>
              {moment(now).format("mm")}
              <span
                className="text-gold/70 ml-2"
                style={{ fontSize: "2.5rem" }}
              >
                {moment(now).format("ss")}
              </span>
            </div>
            <div className="mt-1 bg-gold/10 border border-gold/30 px-5 py-1 rounded-full">
              <span className="text-gold text-sm font-semibold tracking-widest">
                {moment(now).locale("id").format("dddd, DD MMMM YYYY")}
              </span>
            </div>
          </div>

          <div className="text-right max-w-xs shrink-0">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase font-medium mb-1">
              Lokasi
            </p>
            <p className="text-white font-semibold text-base leading-snug">
              <FaLocationDot className="inline mr-1.5 text-gold" />
              {mosque.address}
            </p>
            <p className="text-gold/80 text-sm mt-0.5">{mosque.city}</p>
          </div>
        </header>

        {/* ═══ BODY ════════════════════════════════════════════════════════ */}
        <div className="flex-1 grid grid-cols-[460px_1fr] min-h-0">
          {/* ── Jadwal Sholat ── */}
          <aside className="relative bg-linear-to-b from-[#0d2b1a] to-[#071410] border-r border-gold/20 flex flex-col px-5 py-5 gap-4 overflow-hidden">
            <div className="text-center">
              <p className="text-gold/50 text-xs tracking-[0.4em] uppercase font-semibold">
                Jadwal Sholat
              </p>
              <p className="text-gold/30 text-xs mt-0.5">
                {moment(now).locale("id").format("DD MMMM YYYY")}
              </p>
            </div>
            {prayerData.map((item, idx) => {
              const isNext = nextName === item.nama;
              const style = PRAYER_STYLES[idx];
              return (
                <div
                  key={item.nama}
                  className={`relative flex items-center gap-5 rounded-2xl px-6 py-5 transition-all duration-500 ${isNext ? "" : "bg-white/3 border border-white/10"}`}
                  style={
                    isNext
                      ? {
                          background: `linear-gradient(135deg, ${style.accent}22, ${style.accent}08)`,
                          border: `1.5px solid ${style.accent}80`,
                        }
                      : {}
                  }
                >
                  <div
                    className="absolute left-0 top-4 bottom-4 w-1.5 rounded-full"
                    style={{
                      background: isNext ? style.accent : `${style.accent}40`,
                    }}
                  />
                  <div
                    className="text-5xl shrink-0"
                    style={{
                      color: isNext ? style.accent : `${style.accent}80`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-bold leading-none"
                      style={{
                        fontSize: "1.5rem",
                        color: isNext ? "#fff" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {item.nama}
                    </p>
                    {isNext && (
                      <p
                        className="text-xs mt-1 tracking-[0.2em] uppercase"
                        style={{ color: style.accent }}
                      >
                        Berikutnya
                      </p>
                    )}
                  </div>
                  <p
                    className="font-black tabular-nums tracking-tight"
                    style={{
                      fontSize: isNext ? "3rem" : "2.5rem",
                      color: isNext ? style.accent : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {item.waktu}
                  </p>
                </div>
              );
            })}
            <div className="mt-auto border-t border-gold/15 pt-3 text-center">
              <p className="text-gold/30 text-lg tracking-widest">﷽</p>
            </div>
          </aside>

          {/* ── Slider area ── */}
          <main className="relative p-8">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gold/20 bg-[#0a1f14] shadow-2xl">
              {/* Preview badge saat sim.stage === "preview" */}
              {sim && <PreviewBadge sim={sim} />}

              {/* Adhan flash overlay saat sim.stage === "adhan-alarm" */}
              {sim && <AdhanFlashOverlay sim={sim} />}

              {/* Iqamah countdown overlay */}
              {iqamahCountdown && (
                <IqamahCountdownOverlay cs={iqamahCountdown} />
              )}

              {/* Slider image */}
              {currentSlide ? (
                <>
                  <Image
                    key={currentSlide.id}
                    src={currentSlide.imageUrl}
                    alt="Slide Display"
                    fill
                    className={`object-cover transition-opacity duration-1000 ${sliderDimmed ? "opacity-20" : "opacity-100"}`}
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                  {displayImages &&
                    displayImages.length > 1 &&
                    !sliderDimmed &&
                    !sim && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {displayImages.map((img, idx) => (
                          <span
                            key={img.id}
                            className="block rounded-full transition-all duration-500"
                            style={{
                              width: idx === activeSlide ? 28 : 8,
                              height: 8,
                              background:
                                idx === activeSlide
                                  ? "#d4af37"
                                  : "rgba(212,175,55,0.35)",
                            }}
                          />
                        ))}
                      </div>
                    )}
                </>
              ) : mosque?.logoUrl ? (
                <Image
                  src={mosque.logoUrl}
                  alt="Logo Masjid"
                  fill
                  className="object-contain p-12"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <FaMosque className="text-gold/30 text-8xl" />
                  <p className="text-gold/40 text-sm italic text-center px-8">
                    Belum ada gambar slider. Unggah dari dashboard admin.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer className="relative shrink-0 h-16 bg-linear-to-r from-[#0d2b1a] via-[#0f3320] to-[#0d2b1a] border-t border-gold/40 flex items-center overflow-hidden">
          <div className="shrink-0 flex items-center h-full">
            <div className="bg-gold h-full px-6 flex items-center">
              <span className="text-[#0d2b1a] font-black text-sm tracking-[0.25em] uppercase">
                📢 Pengumuman
              </span>
            </div>
            <div
              className="w-0 h-0 shrink-0"
              style={{
                borderTop: "32px solid transparent",
                borderBottom: "32px solid transparent",
                borderLeft: "18px solid #d4af37",
              }}
            />
          </div>
          <div className="w-3 h-3 rounded-full bg-gold/40 mx-4 shrink-0" />
          <div className="flex-1 overflow-hidden h-full flex items-center">
            <div
              className="marquee-run text-gold font-bold whitespace-nowrap tracking-wider text-2xl"
              style={{
                animationDuration: `${Math.max(25, runningText.length * 0.3)}s`,
              }}
            >
              {runningText}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;{runningText}
              &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DisplayPage;
