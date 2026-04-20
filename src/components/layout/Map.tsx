import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Zap, Droplet, Trash2, MapPin, Check, X, Locate } from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type TipoServicio = "luz" | "agua" | "aseo";
type Filtro = "todos" | TipoServicio;

interface Marcador {
  id: number;
  coords: [number, number];
  tipo: TipoServicio;
  label: string;
  sector: string;
  reportes: { total: number; alta: number; media: number; baja: number };
}

interface TooltipState {
  marker: Marcador;
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

// Mapea tipo interno al valor de `servicio` en Reportes DATA
const TIPO_TO_SERVICIO: Record<TipoServicio, string> = {
  luz:  "Electricidad",
  agua: "Agua",
  aseo: "Aseo Urbano",
};

// ─────────────────────────────────────────────
// MARCADORES — conteos alineados con Reportes DATA
// ─────────────────────────────────────────────

const MARCADORES: Marcador[] = [
  {
    id: 1,
    coords: [-62.753, 8.281],
    tipo: "luz",
    label: "Avería eléctrica – UNARE",
    sector: "Unare",
    reportes: { total: 6, alta: 3, media: 2, baja: 1 },
  },
  {
    id: 2,
    coords: [-62.737, 8.286],
    tipo: "luz",
    label: "Avería eléctrica – ALTA VISTA",
    sector: "Sierra Parima",
    reportes: { total: 2, alta: 1, media: 1, baja: 0 },
  },
  {
    id: 3,
    coords: [-62.705, 8.296],
    tipo: "luz",
    label: "Avería eléctrica – CASTILLITO",
    sector: "Centro",
    reportes: { total: 3, alta: 1, media: 1, baja: 1 },
  },
  {
    id: 4,
    coords: [-62.667, 8.295],
    tipo: "luz",
    label: "Avería eléctrica – TANATA",
    sector: "La Llanada",
    reportes: { total: 2, alta: 1, media: 0, baja: 1 },
  },
  {
    id: 5,
    coords: [-62.721, 8.292],
    tipo: "agua",
    label: "Fuga de agua – ALTA VISTA",
    sector: "Sierra Parima",
    reportes: { total: 3, alta: 1, media: 1, baja: 1 },
  },
  {
    id: 6,
    coords: [-62.695, 8.303],
    tipo: "agua",
    label: "Fuga de agua – CASTILLITO",
    sector: "Centro",
    reportes: { total: 2, alta: 1, media: 1, baja: 0 },
  },
  {
    id: 7,
    coords: [-62.675, 8.309],
    tipo: "aseo",
    label: "Desechos – COMRUSTO",
    sector: "Unare",
    reportes: { total: 3, alta: 2, media: 0, baja: 1 },
  },
];

// ─────────────────────────────────────────────
// PUNTOS DE CALOR
// ─────────────────────────────────────────────

const PUNTOS_CALOR: Array<{
  coords: [number, number];
  intensidad: number;
  tipo: TipoServicio;
}> = [
  { coords: [-62.756, 8.28],  intensidad: 10, tipo: "luz" },
  { coords: [-62.753, 8.283], intensidad: 9,  tipo: "luz" },
  { coords: [-62.75,  8.278], intensidad: 8,  tipo: "luz" },
  { coords: [-62.759, 8.285], intensidad: 7,  tipo: "luz" },
  { coords: [-62.747, 8.281], intensidad: 6,  tipo: "luz" },
  { coords: [-62.738, 8.29],  intensidad: 8,  tipo: "luz"  },
  { coords: [-62.735, 8.293], intensidad: 7,  tipo: "luz"  },
  { coords: [-62.741, 8.287], intensidad: 6,  tipo: "luz"  },
  { coords: [-62.722, 8.292], intensidad: 7,  tipo: "agua" },
  { coords: [-62.718, 8.289], intensidad: 5,  tipo: "agua" },
  { coords: [-62.725, 8.295], intensidad: 6,  tipo: "agua" },
  { coords: [-62.706, 8.296], intensidad: 9,  tipo: "luz"  },
  { coords: [-62.711, 8.299], intensidad: 7,  tipo: "luz"  },
  { coords: [-62.7,   8.293], intensidad: 6,  tipo: "luz"  },
  { coords: [-62.696, 8.304], intensidad: 5,  tipo: "agua" },
  { coords: [-62.693, 8.301], intensidad: 4,  tipo: "agua" },
  { coords: [-62.677, 8.309], intensidad: 10, tipo: "aseo" },
  { coords: [-62.673, 8.306], intensidad: 8,  tipo: "aseo" },
  { coords: [-62.681, 8.312], intensidad: 9,  tipo: "aseo" },
  { coords: [-62.67,  8.308], intensidad: 7,  tipo: "aseo" },
  { coords: [-62.668, 8.291], intensidad: 9,  tipo: "luz" },
  { coords: [-62.665, 8.288], intensidad: 8,  tipo: "luz" },
  { coords: [-62.672, 8.294], intensidad: 7,  tipo: "luz" },
  { coords: [-62.661, 8.29],  intensidad: 6,  tipo: "luz" },
];

function buildGeoJSON(filtro: Filtro) {
  const features = PUNTOS_CALOR.filter(
    (p) => filtro === "todos" || p.tipo === filtro,
  ).map((p) => ({
    type: "Feature" as const,
    properties: { intensidad: p.intensidad },
    geometry: { type: "Point" as const, coordinates: p.coords },
  }));
  return { type: "FeatureCollection" as const, features };
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

export default function Map({ servicio, pinCoords, editPin, onPinChange }: MapProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Citizen en modo dashboard (ni editPin ni pinCoords): mapa de solo lectura sin tooltip
  const isReadonly = user?.role === "citizen" && !editPin && !pinCoords;
  const isReadonlyRef = useRef(isReadonly);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [filtroActual, setFiltroActual] = useState<Filtro>("todos");
  const filtroActivo: Filtro = servicio
    ? (SERVICIO_TO_FILTRO[servicio] ?? "todos")
    : filtroActual;

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
  // Root exclusivo del pin de vista (pinCoords) — no lo toca el efecto de confirmedPin
  const viewPinRootRef = useRef<Root | null>(null);

  // Refs estables para leer desde dentro del useEffect de inicialización
  const pinCoordsRef = useRef(pinCoords);
  const editPinRef = useRef(editPin);
  const onPinChangeRef = useRef(onPinChange);
  useEffect(() => { editPinRef.current = editPin; }, [editPin]);
  useEffect(() => { onPinChangeRef.current = onPinChange; }, [onPinChange]);

  const marcadoresRef = useRef<
    Array<{ marker: maplibregl.Marker; tipo: TipoServicio; root: Root }>
  >([]);

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

      // ── Modo edición de pin: mapa limpio, solo listener de click ──
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

      // ── Modo normal: heatmap + marcadores cluster ──
      mapRef.current.addSource("averias-source", {
        type: "geojson",
        data: buildGeoJSON("todos"),
      });

      mapRef.current.addLayer({
        id: "averias-heat",
        type: "heatmap",
        source: "averias-source",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "intensidad"], 1, 0.2, 10, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 3],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 20, 14, 55],
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

      MARCADORES.forEach((m) => {
        const { Icon, color } = TIPOS_SERVICIO[m.tipo];
        const el = document.createElement("div");
        el.title = m.label;
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
          setTooltip({ marker: m, x: rect.left + rect.width / 2, y: rect.top });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(m.coords)
          .addTo(mapRef.current!);

        marcadoresRef.current.push({ marker, tipo: m.tipo, root });
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

  // ── Filtrado heatmap + visibilidad marcadores ──
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || pinCoordsRef.current) return;
    const source = mapRef.current.getSource("averias-source") as maplibregl.GeoJSONSource;
    source?.setData(buildGeoJSON(filtroActivo));
    marcadoresRef.current.forEach(({ marker, tipo }) => {
      const visible = filtroActivo === "todos" || filtroActivo === tipo;
      marker.getElement().style.display = visible ? "flex" : "none";
    });
  }, [filtroActivo, mapLoaded]);

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
      () => {
        // Geolocalización denegada — sin acción visible
      },
    );
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  const showFilters = !servicio && !pinCoords && !editPin;

  return (
    <div className="relative w-full h-full rounded-xl shadow-lg">
      {/* Mapa — overflow-hidden aquí para recortar las tiles */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
      />

      {/* ── Filtros de servicio ── */}
      {showFilters && (
        <div className="absolute top-3 right-3 z-10 flex gap-1 flex-wrap justify-end">
          {(["todos", "luz", "agua", "aseo"] as Filtro[]).map((f) => {
            const isActive = filtroActivo === f;
            const label =
              f === "todos" ? "Todos" : TIPOS_SERVICIO[f as TipoServicio].label;
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
              {tooltip.marker.label}
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
                setTooltip(null);
                navigate(ROUTES.REPORTES, {
                  state: {
                    initialFilterState: {
                      text: { sector: tooltip.marker.sector },
                      checkbox: { servicio: [TIPO_TO_SERVICIO[tooltip.marker.tipo]] },
                    },
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
