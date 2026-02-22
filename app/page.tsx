"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaMosque } from "react-icons/fa6";
import {
  Menu,
  X,
  ChevronRight,
  BellRing,
  ImagePlay,
  Banknote,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── tiny hook: is element in view ──────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── data ────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { name: "Fitur", href: "#fitur" },
  { name: "Cara Kerja", href: "#cara-kerja" },
  { name: "Tentang", href: "#tentang" },
];

const FEATURES = [
  {
    icon: BellRing,
    title: "Pengumuman Realtime",
    desc: "Buat hingga 5 pengumuman yang langsung tampil sebagai running-text di layar display masjid tanpa perlu refresh.",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    icon: ImagePlay,
    title: "Slider Gambar Display",
    desc: "Unggah hingga 10 gambar 16:9 dengan cropping langsung di browser — tampil rapi di layar tanpa distorsi.",
    color: "bg-grass/10 text-grass",
    border: "border-grass/20",
  },
  {
    icon: Banknote,
    title: "Catatan Keuangan",
    desc: "Catat infaq & pengeluaran masjid maupun anak yatim. Ringkasan mingguan otomatis tersedia di layar display.",
    color: "bg-gold/10 text-amber-600",
    border: "border-gold/20",
  },
  {
    icon: MapPin,
    title: "Jadwal Shalat Otomatis",
    desc: "Cukup pin lokasi masjid di peta — jadwal shalat dihitung secara akurat dan tampil setiap hari.",
    color: "bg-teal-50 text-teal-600",
    border: "border-teal-100",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Daftar & Login",
    desc: "Buat akun pengurus, verifikasi email, lalu masuk ke dashboard.",
  },
  {
    num: "02",
    title: "Atur Lokasi Masjid",
    desc: "Pin lokasi masjid di peta interaktif — jadwal shalat langsung dihitung.",
  },
  {
    num: "03",
    title: "Kelola Konten",
    desc: "Tambah pengumuman, unggah gambar slider, dan catat transaksi keuangan.",
  },
  {
    num: "04",
    title: "Tampilkan di Layar",
    desc: "Buka halaman /display di TV atau proyektor — semua berjalan otomatis.",
  },
];

const BENEFITS = [
  "Jadwal shalat dihitung secara lokal, akurat setiap hari",
  "Pengumuman tampil sebagai running-text yang bisa diedit kapan saja",
  "Ringkasan keuangan mingguan otomatis — transparan untuk jamaah",
  "Slider gambar dengan crop 16:9 langsung di browser",
  "Antarmuka admin yang mudah digunakan oleh pengurus masjid",
  "Tanpa biaya berlangganan, self-hosted dengan Supabase & PostgreSQL",
];

// ── component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroSection = useInView(0.1);
  const featuresSection = useInView(0.1);
  const stepsSection = useInView(0.1);
  const benefitsSection = useInView(0.1);
  const ctaSection = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-body text-emerald-950 overflow-x-hidden">
      {/* ══════════════════════════════ NAVBAR ══════════════════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
              <FaMosque className="text-white text-base" />
            </div>
            <span className="font-display font-bold italic text-2xl text-emerald-800 tracking-tight">
              Khidmat
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {l.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Mulai Gratis <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100 px-6 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.name}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {l.name}
              </a>
            ))}
            <div className="pt-3 border-t border-emerald-50 space-y-2">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mulai Gratis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════ HERO ════════════════════════════════ */}
      <section
        ref={heroSection.ref}
        id="beranda"
        className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      >
        {/* soft background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-150 rounded-full bg-linear-to-b from-emerald-50 to-transparent opacity-80" />
          <div className="absolute top-24 -left-32 w-72 h-72 rounded-full bg-grass/8 blur-3xl" />
          <div className="absolute top-40 -right-24 w-64 h-64 rounded-full bg-emerald-100/60 blur-3xl" />
          {/* decorative dots */}
          <svg
            className="absolute top-20 right-16 opacity-20 hidden lg:block"
            width="120"
            height="120"
            viewBox="0 0 120 120"
          >
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={c * 20 + 10}
                  cy={r * 20 + 10}
                  r="2.5"
                  fill="#17cf54"
                />
              )),
            )}
          </svg>
          <svg
            className="absolute bottom-12 left-10 opacity-15 hidden lg:block"
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 4 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={c * 20 + 10}
                  cy={r * 20 + 10}
                  r="2"
                  fill="#059669"
                />
              )),
            )}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* badge */}
          <div
            className={`inline-flex items-center gap-2 bg-grass/10 border border-grass/25 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ${
              heroSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-grass" />
            Sistem Informasi Masjid Modern
          </div>

          {/* heading */}
          <h1
            className={`font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-tight text-emerald-900 mb-6 transition-all duration-700 delay-100 ${
              heroSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Kelola Masjid{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-600">
                Lebih Mudah
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-grass/15 rounded-full z-0" />
            </span>{" "}
            & Transparan
          </h1>

          {/* sub */}
          <p
            className={`text-base md:text-lg text-emerald-700/80 max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-700 delay-200 ${
              heroSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Dari jadwal shalat otomatis, pengumuman realtime, hingga laporan
            keuangan — semua tampil rapi di layar display masjid Anda.
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-300 ${
              heroSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 px-8 font-semibold rounded-xl"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/display">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 px-8 rounded-xl"
              >
                Lihat Demo Display
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FEATURES ════════════════════════════ */}
      <section id="fitur" className="py-24 bg-green-50/40">
        <div className="max-w-6xl mx-auto px-6">
          <div
            ref={featuresSection.ref}
            className={`text-center mb-14 transition-all duration-700 ${
              featuresSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-block text-xs font-semibold text-grass tracking-widest uppercase mb-3 px-3 py-1 bg-grass/10 rounded-full border border-grass/20">
              Fitur Utama
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-emerald-900 mb-4">
              Semua yang dibutuhkan pengurus masjid
            </h2>
            <p className="text-emerald-700/70 max-w-xl mx-auto text-base">
              Dirancang khusus untuk kemudahan pengelolaan informasi dan
              transparansi kepada jamaah.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`group bg-white border ${feat.border} rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                    featuresSection.inView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-emerald-900 text-base mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-emerald-700/65 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section id="cara-kerja" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div
            ref={stepsSection.ref}
            className={`text-center mb-14 transition-all duration-700 ${
              stepsSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-block text-xs font-semibold text-emerald-600 tracking-widest uppercase mb-3 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              Cara Kerja
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-emerald-900 mb-4">
              Aktif dalam 4 langkah mudah
            </h2>
            <p className="text-emerald-700/70 max-w-xl mx-auto">
              Tidak perlu keahlian teknis. Siapapun bisa mengelola informasi
              masjid dengan Khidmat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`relative flex gap-5 p-6 rounded-2xl border border-emerald-50 bg-green-50/30 hover:border-emerald-100 hover:bg-green-50/60 transition-all duration-300 ${
                  stepsSection.inView
                    ? "opacity-100 translate-x-0"
                    : i % 2 === 0
                      ? "opacity-0 -translate-x-6"
                      : "opacity-0 translate-x-6"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* number */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-600 text-white font-display font-bold text-lg flex items-center justify-center shadow-sm shadow-emerald-200">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-emerald-900 text-base mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-emerald-700/65 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* connector line for non-last on desktop */}
                {i < STEPS.length - 2 && (
                  <div className="hidden md:block absolute bottom-0 left-11 w-px h-6 bg-emerald-100 translate-y-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ BENEFITS ════════════════════════════ */}
      <section id="tentang" className="py-24 bg-green-50/40">
        <div className="max-w-5xl mx-auto px-6">
          <div
            ref={benefitsSection.ref}
            className={`grid md:grid-cols-2 gap-14 items-center transition-all duration-700 ${
              benefitsSection.inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* left */}
            <div>
              <span className="inline-block text-xs font-semibold text-grass tracking-widest uppercase mb-3 px-3 py-1 bg-grass/10 rounded-full border border-grass/20">
                Mengapa Khidmat?
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-emerald-900 mb-4 leading-snug">
                Dibangun untuk pengurus masjid, bukan developer
              </h2>
              <p className="text-emerald-700/70 mb-8 leading-relaxed">
                Khidmat hadir sebagai solusi lengkap yang menggabungkan
                kemudahan penggunaan dengan fitur-fitur yang benar-benar
                dibutuhkan untuk operasional masjid sehari-hari.
              </p>
              <Link href="/auth/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 rounded-xl px-6">
                  Coba Sekarang <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* right: checklist */}
            <ul className="space-y-3.5">
              {BENEFITS.map((b, i) => (
                <li
                  key={b}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    benefitsSection.inView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-6"
                  }`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <CheckCircle2 className="w-5 h-5 text-grass shrink-0 mt-0.5" />
                  <span className="text-emerald-800 text-sm leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA ═════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div
          ref={ctaSection.ref}
          className={`max-w-2xl mx-auto px-6 text-center transition-all duration-700 ${
            ctaSection.inView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-6 shadow-lg shadow-emerald-200">
            <FaMosque className="text-white text-2xl" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-emerald-900 mb-4">
            Siap mendigitalisasi masjid Anda?
          </h2>
          <p className="text-emerald-700/70 mb-8 leading-relaxed">
            Bergabunglah dan kelola informasi masjid dengan lebih mudah, modern,
            dan transparan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 px-8 rounded-xl font-semibold"
              >
                Daftar Gratis — Mulai Sekarang
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 rounded-xl"
              >
                Sudah punya akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer className="border-t border-emerald-50 bg-green-50/30">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <FaMosque className="text-white text-xs" />
            </div>
            <span className="font-display font-bold italic text-emerald-800 text-lg">
              Khidmat
            </span>
            <span className="text-emerald-400 text-sm">·</span>
            <span className="text-emerald-600/60 text-xs">
              Sistem Informasi Masjid
            </span>
          </div>
          <p className="text-emerald-600/50 text-xs text-center">
            © {new Date().getFullYear()} Khidmat. Dibuat untuk kemudahan
            pengelolaan masjid.
          </p>
          <div className="flex items-center gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="text-xs text-emerald-600/60 hover:text-emerald-700 transition-colors"
              >
                {l.name}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* global style for slow marquee in hero mock */}
      <style jsx global>{`
        @keyframes marquee-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-slow {
          animation: marquee-slow 18s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
