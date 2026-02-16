export type Mosque = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  timezone: string;
  description?: string | null;
  logoUrl?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  updatedAt: Date;
};
