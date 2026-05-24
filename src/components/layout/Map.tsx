import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Zap, Droplet, Trash2, MapPin, Check, X, Locate } from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import type { BackendReport } from "../../services/reports.service";
import { useAllReports } from "../../hooks/useQueryHooks";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type TipoServicio = "luz" | "agua" | "aseo";
type Filtro = "todos" | TipoServicio;
type Priority = "ALTA" | "MEDIA" | "BAJA";

interface SectorData {
  name: string;
  coords: [number, number];
  tipo: TipoServicio;
  reportes: { total: number; alta: number; media: number; baja: number };
  categorias: string[];
}

interface TooltipState {
  marker: SectorData;
  x: number;
  y: number;
}

interface PendingPin {
  coords: [number, number];
  x: number;
  y: number;
}

interface MapProps {
  servicio?: string;
  pinCoords?: [number, number];
  editPin?: boolean;
  onPinChange?: (coords: [number, number] | null) => void;
  externalReports?: BackendReport[];
}

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE TIPOS DE SERVICIO
// ─────────────────────────────────────────────

const TIPOS_SERVICIO: Record<
  TipoServicio,
  { label: string; Icon: React.ElementType; color: string }
> = {
  luz:  { label: "Electricidad", Icon: Zap,    color: "#f0a31d" },
  agua: { label: "Agua",         Icon: Droplet, color: "#3b82f6" },
  aseo: { label: "Aseo Urbano",  Icon: Trash2,  color: "#835911" },
};

const SERVICIO_TO_FILTRO: Record<string, Filtro> = {
  Electricidad:  "luz",
  Agua:          "agua",
  "Aseo Urbano": "aseo",
};


// ─────────────────────────────────────────────
// HELPERS DE DATOS REALES
// ─────────────────────────────────────────────

function categoryToFiltro(catName: string): TipoServicio | null {
  const n = catName.toLowerCase();
  if (n.includes("electric") || n === "luz") return "luz";
  if (n.includes("agua")) return "agua";
  if (n.includes("aseo") || n.includes("urban") || n.includes("basura")) return "aseo";
  return null;
}

const PRIORITY_CFG: Record<Priority, { label: string; bg: string; text: string }> = {
  ALTA:  { label: "Alta",  bg: "#DC2626", text: "#DC2626" },
  MEDIA: { label: "Media", bg: "#D97706", text: "#D97706" },
  BAJA:  { label: "Baja",  bg: "#16A34A", text: "#16A34A" },
};

function buildSectors(
  reports: BackendReport[],
  filtro: Filtro,
  prioridades: Set<string>,
  barrio: string,
): SectorData[] {
  const filtered = reports.filter((r) => {
    if (filtro !== "todos" && categoryToFiltro(r.category.name) !== filtro) return false;
    if (prioridades.size > 0 && !prioridades.has(r.priority)) return false;
    if (barrio !== "todos" && r.neighborhood.name !== barrio) return false;
    return true;
  });

  const grouped: Record<
    string,
    { reports: BackendReport[]; lats: number[]; lngs: number[]; tipo: TipoServicio }
  > = {};

  filtered.forEach((r) => {
    if (r.latitude === undefined || r.longitude === undefined) return;
    const tipo = categoryToFiltro(r.category.name);
    if (!tipo) return;
    const key = `${r.neighborhood.name}__${tipo}`;
    if (!grouped[key]) grouped[key] = { reports: [], lats: [], lngs: [], tipo };
    const g = grouped[key];
    g.reports.push(r);
    g.lats.push(r.latitude);
    g.lngs.push(r.longitude);
  });

  return Object.entries(grouped).map(([key, g]) => {
    const name = key.split("__")[0];
    const avgLat = g.lats.reduce((a, b) => a + b, 0) / g.lats.length;
    const avgLng = g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length;
    const categorias = [...new Set(g.reports.map((r) => r.category.name))];

    return {
      name,
      coords: [avgLng, avgLat] as [number, number],
      tipo: g.tipo,
      reportes: {
        total: g.reports.length,
        alta:  g.reports.filter((r) => r.priority === "ALTA").length,
        media: g.reports.filter((r) => r.priority === "MEDIA").length,
        baja:  g.reports.filter((r) => r.priority === "BAJA").length,
      },
      categorias,
    };
  });
}

function buildRealGeoJSON(sectors: SectorData[]) {
  return {
    type: "FeatureCollection" as const,
    features: sectors.map((s) => ({
      type: "Feature" as const,
      properties: { intensidad: Math.min(s.reportes.total, 10) },
      geometry: { type: "Point" as const, coordinates: s.coords },
    })),
  };
}

// Crea un elemento DOM con ícono MapPin para modos de pin
function createPinEl(color: string): { el: HTMLDivElement; root: Root } {
  const el = document.createElement("div");
  Object.assign(el.style, {
    width: "32px",
    height: "40px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    cursor: "pointer",
    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
  });
  const root = createRoot(el);
  root.render(<MapPin size={36} color={color} fill={color} fillOpacity={0.2} strokeWidth={2} />);
  return { el, root };
}

// ─────────────────────────────────────────────
// COMPONENTE MAP
// ─────────────────────────────────────────────

export default function Map({ servicio, pinCoords, editPin, onPinChange, externalReports }: MapProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReadonly = !editPin && !pinCoords && (
    user?.role === "citizen" ||
    (user?.role === "company" && !externalReports) ||
    (user?.role === "worker" && !externalReports)
  );
  const isReadonlyRef = useRef(isReadonly);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [filtroActual, setFiltroActual] = useState<Filtro>("todos");
  const filtroActivo: Filtro = servicio
    ? (SERVICIO_TO_FILTRO[servicio] ?? "todos")
    : filtroActual;
  const [filtroPrioridades, setFiltroPrioridades] = useState<Set<Priority>>(new Set());
  const [filtroBarrio, setFiltroBarrio] = useState<string>("todos");

  // Real reports data — cacheado por TanStack Query; solo se fetch si no hay
  // externalReports, ni pin de edición ni pin de vista.
  const { data: allReports = [] } = useAllReports(
    { limit: 1000 },
    !editPin && !pinCoords && !externalReports,
  );

  // Barrios disponibles derivados de los reportes cargados
  const availableBarrios = useMemo<string[]>(() => {
    const active = externalReports ?? allReports;
    return [...new Set(active.map((r) => r.neighborhood.name))].sort();
  }, [allReports, externalReports]);

  // Filtros disponibles: en modo externalReports solo las categorías presentes en esos reportes
  const availableFiltros = useMemo<Filtro[]>(() => {
    if (!externalReports) return ["todos", "luz", "agua", "aseo"];
    const tipos = new Set(
      externalReports
        .map((r) => categoryToFiltro(r.category.name))
        .filter((t): t is TipoServicio => t !== null),
    );
    return ["todos", ...(["luz", "agua", "aseo"] as TipoServicio[]).filter((t) => tipos.has(t))];
  }, [externalReports]);

  // Resetear todos los filtros al cambiar entre Mi Empresa y Vista Global
  useEffect(() => {
    setFiltroActual("todos");
    setFiltroPrioridades(new Set());
    setFiltroBarrio("todos");
  }, [externalReports]);

  // Cluster tooltip
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // editPin state
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [confirmedPin, setConfirmedPin] = useState<[number, number] | null>(null);
  const pendingTooltipRef = useRef<HTMLDivElement>(null);

  // Refs para marcadores de pin (cleanup seguro)
  const pendingMarkerRef = useRef<maplibregl.Marker | null>(null);
  const pendingRootRef = useRef<Root | null>(null);
  const confirmedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const confirmedRootRef = useRef<Root | null>(null);
  const viewPinRootRef = useRef<Root | null>(null);

  // Refs estables para leer desde dentro del useEffect de inicialización
  const pinCoordsRef = useRef(pinCoords);
  const editPinRef = useRef(editPin);
  const onPinChangeRef = useRef(onPinChange);
  useEffect(() => { editPinRef.current = editPin; }, [editPin]);
  useEffect(() => { onPinChangeRef.current = onPinChange; }, [onPinChange]);
  useEffect(() => { isReadonlyRef.current = isReadonly; }, [isReadonly]);

  const marcadoresRef = useRef<
    Array<{ marker: maplibregl.Marker; tipo: TipoServicio; root: Root }>
  >([]);

  const byServicio = useMemo(() => {
    const active = externalReports ?? allReports;
    return {
      luz:  active.filter((r) => categoryToFiltro(r.category.name) === "luz").length,
      agua: active.filter((r) => categoryToFiltro(r.category.name) === "agua").length,
      aseo: active.filter((r) => categoryToFiltro(r.category.name) === "aseo").length,
    };
  }, [allReports, externalReports]);

  const PZO_BOUNDS: [[number, number], [number, number]] = [
    [-62.83, 8.23],
    [-62.65, 8.35],
  ];

  // ── Cierra cluster tooltip al hacer click fuera ──
  useEffect(() => {
    if (!tooltip) return;
    function handleOutside(e: MouseEvent) {
      if (tooltipRef.current?.contains(e.target as Node)) return;
      setTooltip(null);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [tooltip]);

  // ── Inicialización del mapa ──────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: pinCoordsRef.current ?? [-62.713, 8.296],
      zoom: pinCoordsRef.current ? 16 : 13,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-left");
    mapRef.current.on("movestart", () => {
      setTooltip(null);
      setPendingPin(null);
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      // ── Modo pin único (view de reporte) ──────────
      if (pinCoordsRef.current) {
        const { el, root } = createPinEl("#0040DF");
        new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(pinCoordsRef.current)
          .addTo(mapRef.current!);
        viewPinRootRef.current = root;
        mapRef.current.resize();
        setMapLoaded(true);
        return;
      }

      mapRef.current.setMaxBounds(PZO_BOUNDS);

      // ── Modo edición de pin ──
      if (editPinRef.current) {
        mapRef.current.on("click", (e) => {
          const containerRect = mapContainerRef.current!.getBoundingClientRect();
          const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          setPendingPin({
            coords,
            x: containerRect.left + e.point.x,
            y: containerRect.top + e.point.y,
          });
        });
        mapRef.current.resize();
        setMapLoaded(true);
        return;
      }

      // ── Modo dashboard: fuente vacía + heatmap ──
      mapRef.current.addSource("averias-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      mapRef.current.addLayer({
        id: "averias-heat",
        type: "heatmap",
        source: "averias-source",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "intensidad"], 1, 0.2, 10, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 3],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 50, 14, 120],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0,    "rgba(0,0,0,0)",
            0.15, "rgba(0,0,255,0.4)",
            0.4,  "rgb(255,255,0)",
            0.7,  "rgb(255,140,0)",
            1,    "rgb(220,0,0)",
          ],
          "heatmap-opacity": 0.72,
        },
      });

      mapRef.current.resize();
      setMapLoaded(true);
    });

    return () => {
      marcadoresRef.current.forEach(({ root }) => root.unmount());
      marcadoresRef.current = [];
      viewPinRootRef.current?.unmount();
      pendingMarkerRef.current?.remove();
      pendingRootRef.current?.unmount();
      confirmedMarkerRef.current?.remove();
      confirmedRootRef.current?.unmount();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Actualiza heatmap + marcadores cuando cambian reportes o filtro ──
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || editPin || pinCoords) return;

    const activeReports = externalReports ?? allReports;
    const sectors = buildSectors(activeReports, filtroActivo, filtroPrioridades, filtroBarrio);

    // Actualizar fuente del heatmap
    const source = mapRef.current.getSource("averias-source") as maplibregl.GeoJSONSource | undefined;
    source?.setData(buildRealGeoJSON(sectors));

    // Limpiar marcadores anteriores
    marcadoresRef.current.forEach(({ marker, root }) => { marker.remove(); root.unmount(); });
    marcadoresRef.current = [];

    // Cerrar tooltip abierto (sectores cambiaron)
    setTooltip(null);

    // Crear nuevos marcadores por sector
    sectors.forEach((s) => {
      const { Icon, color } = TIPOS_SERVICIO[s.tipo];
      const el = document.createElement("div");
      el.title = s.name;
      Object.assign(el.style, {
        width: "34px",
        height: "34px",
        background: color,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
        cursor: "pointer",
      });
      const root = createRoot(el);
      root.render(<Icon size={18} color="white" strokeWidth={2.2} />);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isReadonlyRef.current) return;
        const rect = el.getBoundingClientRect();
        setTooltip({ marker: s, x: rect.left + rect.width / 2, y: rect.top });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(s.coords)
        .addTo(mapRef.current!);

      marcadoresRef.current.push({ marker, tipo: s.tipo, root });
    });
  }, [allReports, externalReports, filtroActivo, filtroPrioridades, filtroBarrio, mapLoaded]);

  // ── Marcador pendiente en el mapa ──────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    pendingMarkerRef.current?.remove();
    pendingRootRef.current?.unmount();

    if (!pendingPin) {
      pendingMarkerRef.current = null;
      pendingRootRef.current = null;
      return;
    }
    const { el, root } = createPinEl("#3B82F6");
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(pendingPin.coords)
      .addTo(mapRef.current!);
    pendingMarkerRef.current = marker;
    pendingRootRef.current = root;
  }, [pendingPin, mapLoaded]);

  // ── Pin de vista: reacciona si pinCoords llega después del mount (async) ──
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !pinCoords) return;

    if (mapRef.current.getSource("averias-source")) {
      if (mapRef.current.getLayer("averias-heat")) {
        mapRef.current.removeLayer("averias-heat");
      }
      mapRef.current.removeSource("averias-source");
    }
    marcadoresRef.current.forEach(({ marker }) => {
      marker.getElement().style.display = "none";
    });

    viewPinRootRef.current?.unmount();

    const { el, root } = createPinEl("#0040DF");
    new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(pinCoords)
      .addTo(mapRef.current!);
    viewPinRootRef.current = root;

    mapRef.current.flyTo({ center: pinCoords, zoom: 16 });
  }, [pinCoords, mapLoaded]);

  // ── Marcador confirmado en el mapa ────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    confirmedMarkerRef.current?.remove();
    confirmedRootRef.current?.unmount();

    if (!confirmedPin) {
      confirmedMarkerRef.current = null;
      confirmedRootRef.current = null;
      return;
    }
    const { el, root } = createPinEl("#0040DF");
    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(confirmedPin)
      .addTo(mapRef.current!);
    confirmedMarkerRef.current = marker;
    confirmedRootRef.current = root;
  }, [confirmedPin, mapLoaded]);

  // ── Handlers editPin ────────────────────────────
  function handleConfirmPin() {
    if (!pendingPin) return;
    const coords = pendingPin.coords;
    setPendingPin(null);
    setConfirmedPin(coords);
    onPinChangeRef.current?.(coords);
  }

  function handleCancelPin() {
    setPendingPin(null);
  }

  function handleResetPin() {
    setConfirmedPin(null);
    onPinChangeRef.current?.(null);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setPendingPin(null);
        setConfirmedPin(coords);
        mapRef.current?.flyTo({ center: coords, zoom: 16 });
        onPinChangeRef.current?.(coords);
      },
      () => {},
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  const showFilters = !servicio && !pinCoords && !editPin;

  return (
    <div className="relative w-full h-full rounded-xl shadow-lg">
      {/* Mapa */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
      />

      {/* ── Panel de filtros ── */}
      {showFilters && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
          {/* Fila 0 — Indicador en tiempo real */}
          <div className="flex items-center gap-2.5 bg-white/90 border border-[#e2e8f0] rounded-xl shadow-sm px-3 py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {(["luz", "agua", "aseo"] as TipoServicio[]).map((tipo, i) => {
              const { Icon, color } = TIPOS_SERVICIO[tipo];
              return (
                <div key={tipo} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[#cbd5e1] text-xs select-none">·</span>}
                  <Icon size={12} style={{ color }} strokeWidth={2.2} />
                  <span className="text-xs font-semibold text-[#1e293b]">{byServicio[tipo]}</span>
                </div>
              );
            })}
          </div>

          {/* Fila 1 — Servicio */}
          <div className="flex gap-1 flex-wrap justify-end">
            {availableFiltros.map((f) => {
              const isActive = filtroActivo === f;
              const label = f === "todos" ? "Todos" : TIPOS_SERVICIO[f as TipoServicio].label;
              return (
                <button
                  key={f}
                  onClick={() => setFiltroActual(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm ${
                    isActive
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : "bg-white/90 text-[#1e293b] border-[#cbd5e1] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Fila 2 — Prioridad (multi-select) */}
          <div className="flex gap-1">
            {(["ALTA", "MEDIA", "BAJA"] as Priority[]).map((p) => {
              const { label, bg } = PRIORITY_CFG[p];
              const isActive = filtroPrioridades.has(p);
              return (
                <button
                  key={p}
                  onClick={() =>
                    setFiltroPrioridades((prev) => {
                      const next = new Set(prev);
                      if (next.has(p)) next.delete(p);
                      else next.add(p);
                      return next;
                    })
                  }
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm"
                  style={
                    isActive
                      ? { background: bg, color: "white", borderColor: bg }
                      : { background: "rgba(255,255,255,0.9)", color: "#1e293b", borderColor: "#cbd5e1" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Fila 3 — Barrio */}
          {availableBarrios.length > 0 && (
            <select
              value={filtroBarrio}
              onChange={(e) => setFiltroBarrio(e.target.value)}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-[#cbd5e1] bg-white/90 text-[#1e293b] shadow-sm cursor-pointer outline-none"
            >
              <option value="todos">Todos los sectores</option>
              {availableBarrios.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── Recentrar ── */}
      {!pinCoords && (
        <button
          className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]"
          onClick={() =>
            mapRef.current?.flyTo({ center: [-62.713, 8.296], zoom: 13 })
          }
          title="Recentrar mapa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      )}

      {/* ── Leyenda de calor ── */}
      {showFilters && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-[#e2e8f0] rounded-xl shadow-sm px-3 py-2.5">
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Densidad de reportes
          </p>
          <div
            className="h-2 w-36 rounded-full"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,255,0.4), rgb(255,255,0) 40%, rgb(255,140,0) 70%, rgb(220,0,0))",
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#94a3b8]">Baja</span>
            <span className="text-[10px] text-[#94a3b8]">Alta</span>
          </div>
        </div>
      )}

      {/* ── Controles editPin ── */}
      {editPin && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          {confirmedPin && (
            <button
              onClick={handleResetPin}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors shadow-sm"
            >
              Restablecer
            </button>
          )}
          <button
            onClick={handleGeolocate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-sm transition-colors"
            style={{ background: "#2563EB" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#2563EB")}
          >
            <Locate size={13} />
            Fijar Posición
          </button>
        </div>
      )}

      {/* ── Cluster tooltip (portal) ── */}
      {tooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 12px))",
              zIndex: 9999,
              minWidth: "210px",
              animation: "slideUp 0.22s ease forwards",
            }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-3.5"
          >
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 12,
                height: 12,
                background: "white",
                border: "1px solid #e2e8f0",
                borderTop: "none",
                borderLeft: "none",
                rotate: "45deg",
              }}
            />
            <p className="text-xs font-bold text-gray-900 mb-1 leading-snug">
              {tooltip.marker.name}
            </p>
            <p className="text-[11px] text-gray-400 mb-2">
              {tooltip.marker.reportes.total} reportes concentrados
            </p>
            <div className="flex gap-1.5 mb-3">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                Alta {tooltip.marker.reportes.alta}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                Media {tooltip.marker.reportes.media}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                Baja {tooltip.marker.reportes.baja}
              </span>
            </div>
            <button
              onClick={() => {
                const s = tooltip.marker;
                setTooltip(null);
                navigate(ROUTES.REPORTES, {
                  state: {
                    initialFilterState: {
                      text: { sector: s.name },
                      checkbox: {
                        servicio: s.categorias,
                        ...(filtroPrioridades.size > 0 && {
                          prioridad: [...filtroPrioridades],
                        }),
                      },
                    },
                    ...(externalReports && { companyView: "dirigidos" }),
                  },
                });
              }}
              className="w-full text-xs font-semibold text-white rounded-lg py-1.5 transition-colors"
              style={{ background: "#2563EB" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#2563EB")}
            >
              Ver Reportes
            </button>
          </div>,
          document.body,
        )}

      {/* ── Tooltip de confirmación de pin (portal) ── */}
      {pendingPin &&
        createPortal(
          <div
            ref={pendingTooltipRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: pendingPin.x,
              top: pendingPin.y,
              transform: "translate(-50%, calc(-100% - 44px))",
              zIndex: 9999,
              animation: "slideUp 0.18s ease forwards",
            }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 px-2.5 py-2 flex items-center gap-2"
          >
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 10,
                height: 10,
                background: "white",
                border: "1px solid #e2e8f0",
                borderTop: "none",
                borderLeft: "none",
                rotate: "45deg",
              }}
            />
            <button
              onClick={handleConfirmPin}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "#16A34A" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#15803d")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#16A34A")}
              title="Confirmar ubicación"
            >
              <Check size={16} color="white" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleCancelPin}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "#EF4444" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#dc2626")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#EF4444")}
              title="Cancelar"
            >
              <X size={16} color="white" strokeWidth={2.5} />
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
