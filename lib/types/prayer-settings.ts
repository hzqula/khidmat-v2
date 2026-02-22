export type CountdownMinutes = 5 | 10 | 15;

export interface PrayerSettings {
  id: string;
  iqamahCountdownMinutes: CountdownMinutes;
  adhanSoundPath: string;
  iqamahSoundPath: string;
  adhanAlarmEnabled: boolean;
  iqamahAlarmEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
