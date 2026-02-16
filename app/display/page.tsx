"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaMosque, FaLocationDot, FaSun, FaCloudSun } from "react-icons/fa6";
import { RiMoonClearFill } from "react-icons/ri";
import { GiStripedSun } from "react-icons/gi";
import { PiSunHorizonFill } from "react-icons/pi";
import Image from "next/image";
import api from "@/lib/axios";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import moment from "moment-timezone";

const DisplayPage = () => {
  const [now, setNow] = useState(new Date());

  // 1. Fetch data masjid dari API yang sudah kamu buat
  const { data: mosque, isLoading } = useQuery({
    queryKey: ["mosque-settings"],
    queryFn: async () => {
      const { data } = await api.get("/public/mosque");
      return data;
    },
    refetchInterval: 600000, // Cek update tiap 10 menit
  });

  // 2. Real-time Clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Logic Perhitungan Jadwal (Adhan.js + Moment)
  const prayerData = useMemo(() => {
    if (mosque?.latitude === null || mosque?.longitude === null) return null;

    const coords = new Coordinates(mosque.latitude, mosque.longitude);
    const params = CalculationMethod.Singapore(); // Standar Kemenag
    params.fajrAngle = 20;
    params.ishaAngle = 18;

    const prayerTimes = new PrayerTimes(coords, now, params);
    const tz = mosque.timezone || "Asia/Jakarta";

    const formatTime = (date: Date) => moment(date).tz(tz).format("HH:mm");

    return [
      {
        nama: "Subuh",
        waktu: formatTime(prayerTimes.fajr),
        icon: <GiStripedSun />,
        border: "border-jewel-green",
        bgIcon: "text-jewel-green",
      },
      {
        nama: "Dzuhur",
        waktu: formatTime(prayerTimes.dhuhr),
        icon: <FaSun />,
        border: "border-jewel-yellow",
        bgIcon: "text-jewel-yellow",
      },
      {
        nama: "Ashar",
        waktu: formatTime(prayerTimes.asr),
        icon: <FaCloudSun />,
        border: "border-jewel-red",
        bgIcon: "text-jewel-red",
      },
      {
        nama: "Maghrib",
        waktu: formatTime(prayerTimes.maghrib),
        icon: <PiSunHorizonFill />,
        border: "border-jewel-blue",
        bgIcon: "text-jewel-blue",
      },
      {
        nama: "Isya",
        waktu: formatTime(prayerTimes.isha),
        icon: <RiMoonClearFill />,
        border: "border-jewel-purple",
        bgIcon: "text-jewel-purple",
      },
    ];
  }, [mosque, now.toDateString()]);

  const currentTimeStr = moment(now).format("HH:mm");
  const nextSholat =
    prayerData?.find((s) => s.waktu > currentTimeStr) || prayerData?.[0];

  if (isLoading || !prayerData)
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-900 text-white">
        Inisialisasi...
      </div>
    );

  return (
    <div className="w-screen h-screen bg-white gap-0 flex flex-col overflow-hidden">
      {/* Header Dinamis */}
      <div className="bg-emerald-deep w-full flex items-center justify-between px-8 py-4 border-b-4 border-gold shrink-0">
        <div className="flex gap-6 items-center">
          <FaMosque className="size-12 text-gold" />
          <h1 className="font-display text-6xl font-extrabold text-gold uppercase">
            {mosque.name}
          </h1>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-7xl text-white font-bold tracking-tighter">
            {moment(now).format("HH:mm:ss")}
          </div>
          <div className="flex gap-3 mt-3">
            <span className="bg-emerald-600 text-white border border-emerald-500 px-4 py-1 rounded-full text-sm font-semibold">
              {moment(now).locale("id").format("dddd, DD MMMM YYYY")}
            </span>
          </div>
        </div>
        <div className="max-w-xs text-right">
          <p className="text-gold font-bold text-lg leading-tight">
            <FaLocationDot className="inline mr-2" />
            {mosque.address}, {mosque.city}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white flex-1 grid grid-cols-[1.2fr_2.8fr] gap-0 min-h-0">
        <div className="px-4 py-8 overflow-y-auto bg-gray-50/50">
          <div className="flex flex-col gap-5">
            {prayerData.map((item) => {
              const isActive = nextSholat?.nama === item.nama;
              return (
                <div
                  key={item.nama}
                  className={`
                    ${item.border} ${isActive ? "bg-emerald-600 border-none scale-105 shadow-xl" : "bg-white"} 
                    border-3 rounded-xl p-5 flex items-center gap-5 transition-all duration-500
                  `}
                >
                  <div
                    className={`${isActive ? "text-white" : item.bgIcon} text-5xl min-w-15 text-center`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <h3
                      className={`${isActive ? "text-white text-4xl" : "text-black text-2xl"} font-bold transition-all`}
                    >
                      {item.nama}
                    </h3>
                    <p
                      className={`${isActive ? "text-white" : "text-emerald-700"} text-5xl font-black`}
                    >
                      {item.waktu}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image Slider Space */}
        <div className="p-4 h-full w-full">
          <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-inner bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            {mosque.logoUrl ? (
              <Image
                src={mosque.logoUrl}
                alt="Logo"
                fill
                className="object-cover"
              />
            ) : (
              <p className="text-gray-400 italic">
                Tempat Slider Gambar (Fitur 2)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Pengumuman */}
      <div className="w-full h-16 border-t-2 border-gray-300 px-8 flex items-center bg-white">
        <div className="bg-red-600 text-white px-4 py-1 rounded mr-4 font-bold">
          INFO
        </div>
        <div className="text-2xl font-semibold text-gray-700">
          Selamat Datang di {mosque.name} - Jagalah kebersihan masjid kita
          bersama.
        </div>
      </div>
    </div>
  );
};

export default DisplayPage;
