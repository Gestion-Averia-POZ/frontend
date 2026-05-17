import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { metricsService, type MetricsData } from "../services/metrics.service";
import { useCategories, useNeighborhoods } from "../hooks/useQueryHooks";
import { catalogService } from "../services/catalog.service";
import { authService } from "../services/auth.service";

type Period = "7d" | "30d" | "3m" | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 días",  value: "7d"  },
  { label: "30 días", value: "30d" },
  { label: "3 meses", value: "3m"  },
  { label: "Todo",    value: "all" },
];

const STATUS_ORDER = ["PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO"];

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE:  "#94A3B8",
  EN_PROCESO: "#D97706",
  COMPLETADO: "#16A34A",
  CANCELADO:  "#DC2626",
};

const PRIORITY_COLORS: Record<string, string> = {
  ALTA:  "#EF4444",
  MEDIA: "#F97316",
  BAJA:  "#22C55E",
};

function periodToRange(period: Period): { startDate?: string; endDate?: string } {
  if (period === "all") return {};
  const now = new Date();
  const start = new Date(now);
  if (period === "7d")  start.setDate(now.getDate() - 7);
  if (period === "30d") start.setDate(now.getDate() - 30);
  if (period === "3m")  start.setMonth(now.getMonth() - 3);
  return { startDate: start.toISOString(), endDate: now.toISOString() };
}

function todayString(): string {
  const d = new Date();
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromString(dateStr: string, endOfDay = false): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d,  0,  0,  0,   0);
}

export default function DetallesMetrica() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "citizen") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Which preset button is active — null when a custom range is applied
  const [activePeriod, setActivePeriod] = useState<Period | null>("30d");

  // Date inputs (YYYY-MM-DD strings)
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]     = useState(todayString());

  // The range actually sent to the API — drives the useEffect
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>(
    periodToRange("30d"),
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("");

  const { data: allCategories = [] } = useCategories();
  const { data: neighborhoods = [] } = useNeighborhoods();

  // Para company/worker: solo las categorías de su empresa
  const [companyCategories, setCompanyCategories] = useState<{ id: string; name: string }[] | null>(null);

  useEffect(() => {
    if (!user || user.role === "admin" || user.role === "citizen") return;
    if (user.role === "company" && user.companyId) {
      catalogService
        .getCompanyById(user.companyId)
        .then((res) => setCompanyCategories(res.data.company.categories ?? []))
        .catch(console.error);
    } else if (user.role === "worker") {
      authService
        .getUserById(user.id)
        .then((res) => {
          const companyId = res.data.user.company?.id;
          if (!companyId) return;
          return catalogService.getCompanyById(companyId);
        })
        .then((res) => {
          if (res) setCompanyCategories(res.data.company.categories ?? []);
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const categories = companyCategories ?? allCategories;

  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role === "citizen") return;
    setLoading(true);
    setError(null);
    metricsService
      .getMetrics({
        ...dateRange,
        ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
        ...(selectedNeighborhoodId ? { neighborhoodId: parseInt(selectedNeighborhoodId, 10) } : {}),
      })
      .then((res) => {
        const data = res.data;
        data.byStatus = [...data.byStatus].sort(
          (a, b) => STATUS_ORDER.indexOf(a.state) - STATUS_ORDER.indexOf(b.state),
        );
        setMetrics(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dateRange, selectedCategoryId, selectedNeighborhoodId, user]);

  function handlePeriodClick(p: Period) {
    setActivePeriod(p);
    setCustomStart("");
    setCustomEnd(todayString());
    setDateRange(periodToRange(p));
  }

  function handleApplyCustom() {
    if (!customStart) return;
    const start = localDateFromString(customStart, false);
    const end   = localDateFromString(customEnd || todayString(), true);
    setActivePeriod(null);
    setDateRange({ startDate: start.toISOString(), endDate: end.toISOString() });
  }

  if (!user || user.role === "citizen") return null;

  const customApplyDisabled = !customStart;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métricas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Indicadores de rendimiento del sistema de reportes
          </p>
        </div>

        {/* Filters — preset pills + custom date range */}
        <div className="flex flex-col gap-2 items-end">

          {/* Preset period buttons */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriodClick(value)}
                className={`px-4 py-2 transition-colors ${
                  activePeriod === value
                    ? "bg-[#1e293b] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs">Personalizado:</span>
            <input
              type="date"
              value={customStart}
              max={customEnd || todayString()}
              onChange={(e) => setCustomStart(e.target.value)}
              className={`border rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition ${
                activePeriod === null ? "border-[#1e293b]" : "border-gray-200"
              }`}
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={customEnd}
              min={customStart || undefined}
              max={todayString()}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={`border rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition ${
                activePeriod === null ? "border-[#1e293b]" : "border-gray-200"
              }`}
            />
            <button
              onClick={handleApplyCustom}
              disabled={customApplyDisabled}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1e293b] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#334155] transition-colors"
            >
              Aplicar
            </button>
          </div>

          {/* Category + Sector selects */}
          <div className="flex items-center gap-2 text-sm">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition bg-white"
            >
              <option value="">Todos los sectores</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-700 text-sm">
          Error al cargar las métricas: {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && metrics && (
        <div className="flex flex-col gap-6">

          {/* Row 1: KPI card + Priority donut */}
          <div className="grid grid-cols-3 gap-4">

            {/* KPI: Tasa de Resolución */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Tasa de Resolución
              </p>
              <p className="text-5xl font-bold" style={{ color: "#16A34A" }}>
                {metrics.resolutionRate.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(metrics.resolutionRate, 100)}%`,
                    backgroundColor: "#16A34A",
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Reportes completados sobre el total activos
              </p>
            </div>

            {/* Distribución por Prioridad */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Distribución por Prioridad
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={metrics.byPriority}
                    dataKey="count"
                    nameKey="priority"
                    cx="40%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    label={({ percent }) =>
                      percent && percent > 0.03 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  >
                    {metrics.byPriority.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PRIORITY_COLORS[entry.priority] ?? "#94A3B8"}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-600">{value}</span>
                    )}
                  />
                  <Tooltip formatter={(value) => [`${value} reportes`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Reportes por Estado */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Totales por Estado
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.byStatus} barSize={52} margin={{ left: 16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{
                    value: "Reportes",
                    angle: -90,
                    position: "insideLeft",
                    offset: -4,
                    style: { fontSize: 10, fill: "#94a3b8" },
                  }}
                />
                <Tooltip formatter={(value) => [`${value} reportes`, "Total"]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {metrics.byStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.state] ?? "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row 3: Top Failure Types + Critical Sectors */}
          <div className="grid grid-cols-2 gap-4">

            {/* Top 5 Tipos de Avería */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Top 5 Tipos de Avería
              </h3>
              {metrics.topFailureTypes.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={metrics.topFailureTypes}
                    layout="vertical"
                    barSize={18}
                    margin={{ left: 8, bottom: 22 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      label={{
                        value: "Cantidad de reportes",
                        position: "insideBottom",
                        offset: -12,
                        style: { fontSize: 10, fill: "#94a3b8" },
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip formatter={(value) => [`${value} reportes`, ""]} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top 5 Sectores Críticos */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Sectores Críticos (Pendientes)
              </h3>
              {metrics.criticalSectors.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={metrics.criticalSectors}
                    layout="vertical"
                    barSize={18}
                    margin={{ left: 8, bottom: 22 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      label={{
                        value: "Reportes pendientes",
                        position: "insideBottom",
                        offset: -12,
                        style: { fontSize: 10, fill: "#94a3b8" },
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="sector"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip formatter={(value) => [`${value} pendientes`, ""]} />
                    <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
