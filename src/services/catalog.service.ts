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

// Extended types for admin views
export interface FullCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface FullFailureType {
  id: number;
  name: string;
  description?: string;
  priority: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  categoryId?: string;
  category?: { id: string; name: string };
  isActive: boolean;
}

export interface FullCompany {
  id: string;
  name: string;
  description?: string;
  rif?: string;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  categories?: { id: string; name: string }[];
}

interface CompaniesResponse {
  success: boolean;
  data: { companies: CatalogCompany[] };
}

interface FullCompaniesResponse {
  success: boolean;
  data: { companies: FullCompany[] };
}

interface CategoriesResponse {
  success: boolean;
  data: { categories: CatalogCategory[] };
}

interface FullCategoriesResponse {
  success: boolean;
  data: { categories: FullCategory[] };
}

interface FailureTypesResponse {
  success: boolean;
  data: { failureTypes: CatalogFailureType[] };
}

interface FullFailureTypesResponse {
  success: boolean;
  data: { failureTypes: FullFailureType[] };
}

interface SingleCategoryResponse {
  success: boolean;
  data: { category: FullCategory };
}

interface SingleCompanyResponse {
  success: boolean;
  data: { company: FullCompany };
}

export const catalogService = {
  // --- Catalog reads (used by all roles) ---
  getCompanies: () =>
    api.get<CompaniesResponse>("/api/companies"),

  getCompaniesByCategory: (categoryName: string) =>
    api.get<CompaniesResponse>(`/api/companies/category/${encodeURIComponent(categoryName)}`),

  getCategories: (includeInactive = false) =>
    api.get<CategoriesResponse>(
      includeInactive ? "/api/categories?includeInactive=true" : "/api/categories"
    ),

  getFailureTypesByCategory: (categoryId: string) =>
    api.get<FailureTypesResponse>(`/api/failure-types/category/${categoryId}`),

  // --- Admin: companies CRUD ---
  getAllCompanies: () =>
    api.get<FullCompaniesResponse>("/api/companies"),

  getCompanyById: (id: string) =>
    api.get<SingleCompanyResponse>(`/api/companies/${id}`),

  createCompany: (data: { name: string; description?: string; rif?: string; address?: string }) =>
    api.post<SingleCompanyResponse>("/api/companies", data),

  updateCompany: (id: string, data: { name?: string; description?: string; rif?: string; address?: string }) =>
    api.patch<SingleCompanyResponse>(`/api/companies/${id}`, data),

  deleteCompany: (id: string) =>
    api.delete<{ success: boolean }>(`/api/companies/${id}`),

  // --- Admin: categories CRUD ---
  createCategory: (name: string) =>
    api.post<SingleCategoryResponse>("/api/categories", { name }),

  updateCategory: (id: string, data: { name?: string; isActive?: boolean }) =>
    api.patch<SingleCategoryResponse>(`/api/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<{ success: boolean }>(`/api/categories/${id}`),

  // --- Admin: failure types CRUD ---
  getAllFailureTypes: () =>
    api.get<FullFailureTypesResponse>("/api/failure-types"),

  createFailureType: (data: { name: string; description?: string; priority: string; categoryId: string }) =>
    api.post<{ success: boolean; data: { failureType: FullFailureType } }>("/api/failure-types", data),

  updateFailureType: (id: number, data: { name?: string; description?: string; priority?: string; categoryId?: string }) =>
    api.patch<{ success: boolean; data: { failureType: FullFailureType } }>(`/api/failure-types/${id}`, data),

  deleteFailureType: (id: number) =>
    api.delete<{ success: boolean }>(`/api/failure-types/${id}`),
};
