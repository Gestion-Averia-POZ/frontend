export interface HeatmapPoint {
  lat: number;
  lng: number;
  category: string;
}

export interface HeatmapData {
  updatedAt: string;
  totals: {
    total: number;
    byServiceType: { luz: number; agua: number; aseo: number };
    byCategory: Record<string, number>;
  };
  points: HeatmapPoint[];
}
