import { api } from "./api";

export interface CatalogCompany {
  id: string;
  name: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
}

export interface CatalogFailureType {
  id: number;
  name: string;
  priority: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
}

interface CompaniesResponse {
  success: boolean;
  data: { companies: CatalogCompany[] };
}

interface CategoriesResponse {
  success: boolean;
  data: { categories: CatalogCategory[] };
}

interface FailureTypesResponse {
  success: boolean;
  data: { failureTypes: CatalogFailureType[] };
}

export const catalogService = {
  getCompanies: () =>
    api.get<CompaniesResponse>("/api/companies"),

  getCompaniesByCategory: (categoryName: string) =>
    api.get<CompaniesResponse>(`/api/companies/category/${encodeURIComponent(categoryName)}`),

  getCategories: () =>
    api.get<CategoriesResponse>("/api/categories"),

  getFailureTypesByCategory: (categoryId: string) =>
    api.get<FailureTypesResponse>(`/api/failure-types/category/${categoryId}`),
};
