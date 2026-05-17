import { useQuery } from "@tanstack/react-query";
import { catalogService, type FullCategory } from "../services/catalog.service";
import { reportsService } from "../services/reports.service";
import { authService } from "../services/auth.service";
import { neighborhoodsService, type Neighborhood } from "../services/neighborhoods.service";

// ── Query Key Factories ────────────────────────────────────────────────────────
// Centralizar las keys garantiza que dos componentes que piden lo mismo
// siempre compartan la misma entrada en caché.
export const queryKeys = {
  reports: {
    all: (params?: {
      categoryName?: string;
      companyName?: string;
      assignedManagerId?: string;
      limit?: number;
    }) => ["reports", "all", params ?? {}] as const,
    byUser: (userId: string) => ["reports", "user", userId] as const,
    assigned: () => ["reports", "assigned"] as const,
  },
  catalog: {
    categories: (includeInactive = false) =>
      ["catalog", "categories", includeInactive] as const,
    companies: () => ["catalog", "companies"] as const,
    companiesByCategory: (categoryName: string) =>
      ["catalog", "companies", "by-category", categoryName] as const,
    failureTypesByCategory: (categoryId: string) =>
      ["catalog", "failure-types", categoryId] as const,
    allFailureTypes: () => ["catalog", "failure-types", "all"] as const,
    neighborhoods: () => ["catalog", "neighborhoods"] as const,
  },
  users: {
    workers: (companyName?: string) =>
      ["users", "workers", companyName ?? "all"] as const,
    citizens: () => ["users", "citizens"] as const,
  },
};

// Nota sobre `select`: api.get() ya extrae res.data de Axios, por lo que
// el queryFn recibe directamente el body del backend: { success, data: { ... } }.
// Por eso el path en select es res.data.X (un solo nivel de data).

// ── Catalog hooks ──────────────────────────────────────────────────────────────
// staleTime: Infinity → estos datos solo cambian cuando el admin actúa.
// La invalidación explícita post-mutación es suficiente.

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: queryKeys.catalog.categories(includeInactive),
    queryFn: () => catalogService.getCategories(includeInactive),
    // Backend incluye isActive aunque el tipo base sea CatalogCategory; cast a FullCategory
    select: (res) => res.data.categories as FullCategory[],
    staleTime: Infinity,
  });
}

export function useCompaniesByCategory(categoryName: string) {
  return useQuery({
    queryKey: queryKeys.catalog.companiesByCategory(categoryName),
    queryFn: () => catalogService.getCompaniesByCategory(categoryName),
    select: (res) => res.data.companies,
    staleTime: Infinity,
    enabled: !!categoryName,
  });
}

export function useFailureTypesByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.catalog.failureTypesByCategory(categoryId),
    queryFn: () => catalogService.getFailureTypesByCategory(categoryId),
    select: (res) => res.data.failureTypes,
    staleTime: Infinity,
    enabled: !!categoryId,
  });
}

export function useAllFailureTypes() {
  return useQuery({
    queryKey: queryKeys.catalog.allFailureTypes(),
    queryFn: () => catalogService.getAllFailureTypes(),
    select: (res) => res.data.failureTypes,
    staleTime: Infinity,
  });
}

export function useAllCompanies() {
  return useQuery({
    queryKey: queryKeys.catalog.companies(),
    queryFn: () => catalogService.getAllCompanies(),
    select: (res) => res.data.companies,
    staleTime: Infinity,
  });
}

export function useNeighborhoods() {
  return useQuery({
    queryKey: queryKeys.catalog.neighborhoods(),
    queryFn: neighborhoodsService.getAll,
    select: (res) => res.data as Neighborhood[],
    staleTime: Infinity,
  });
}

// ── Reports hooks ──────────────────────────────────────────────────────────────
// staleTime: 30 s → los reportes cambian con frecuencia; 30 s evita
// re-fetches en navegación rápida sin sacrificar frescura.

export function useAllReports(
  params?: {
    categoryName?: string;
    companyName?: string;
    assignedManagerId?: string;
    limit?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.reports.all(params),
    queryFn: () => reportsService.getAll(params),
    select: (res) => res.data.reports,
    staleTime: 30_000,
    enabled,
  });
}

export function useReportsByUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.reports.byUser(userId),
    queryFn: () => reportsService.getByUser(userId),
    select: (res) => res.data.reports,
    staleTime: 30_000,
    enabled: !!userId,
  });
}

export function useAssignedReports(enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.assigned(),
    queryFn: () => reportsService.getAssigned(),
    select: (res) => res.data.reports,
    staleTime: 60_000,
    enabled,
  });
}

// ── Users hooks ────────────────────────────────────────────────────────────────
// staleTime: 5 min → la lista de usuarios cambia con poca frecuencia.

export function useWorkers(companyName?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.workers(companyName),
    queryFn: () =>
      authService.getUsers({ role: "WORKER", companyName, limit: 100 }),
    select: (res) => res.data.users,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useCitizens() {
  return useQuery({
    queryKey: queryKeys.users.citizens(),
    queryFn: () => authService.getUsers({ role: "CITIZEN", limit: 200 }),
    select: (res) => res.data.users,
    staleTime: 5 * 60_000,
  });
}
