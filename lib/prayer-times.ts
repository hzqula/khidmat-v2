import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import moment from "moment-timezone";

export const getPrayerTimesByCoords = (
  lat: number,
  lng: number,
  timezone: string,
  date: Date = new Date(),
) => {
  const coords = new Coordinates(lat, lng);

  const params = CalculationMethod.Singapore();
  params.fajrAngle = 20;
  params.ishaAngle = 18;

  const prayerTimes = new PrayerTimes(coords, date, params);

  const format = (d: Date) => moment(d).tz(timezone).format("HH:mm");

  return {
    subuh: format(prayerTimes.fajr),
    dzuhur: format(prayerTimes.dhuhr),
    ashar: format(prayerTimes.asr),
    maghrib: format(prayerTimes.maghrib),
    isya: format(prayerTimes.isha),
    imsak: format(moment(prayerTimes.fajr).subtract(10, "minutes").toDate()), // Imsak biasanya -10 menit
  };
};
