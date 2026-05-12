import { api } from './api';

export interface Neighborhood {
  id: number;
  name: string;
}

export const neighborhoodsService = {
  getAll: (): Promise<{ success: boolean; data: Neighborhood[] }> =>
    api.get('/api/reports/neighborhoods'),
};
