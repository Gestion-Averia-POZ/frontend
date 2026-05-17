import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Zap, Droplet, Trash2 } from "lucide-react";
import type { HeatmapPoint } from "../../types/heatmap";

// ─── Tipos de servicio ────────────────────────────────────────────────────────

type TipoServicio = "luz" | "agua" | "aseo";
type Filtro = "todos" | TipoServicio;

const TIPOS_SERVICIO: Record<TipoServicio, { label: string; Icon: React.ElementType }> = {
  luz:  { label: "Electricidad", Icon: Zap     },
  agua: { label: "Agua",         Icon: Droplet  },
  aseo: { label: "Aseo Urbano",  Icon: Trash2   },
};

function categoryToFiltro(catName: string): TipoServicio | null {
  const n = catName.toLowerCase();
  if (n.includes("electric") || n === "luz") return "luz";
  if (n.includes("agua")) return "agua";
  if (n.includes("aseo") || n.includes("urban") || n.includes("basura")) return "aseo";
  return null;
}

// ─── GeoJSON ──────────────────────────────────────────────────────────────────

function buildGeoJSON(points: HeatmapPoint[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((p) => ({
      type: "Feature" as const,
      properties: { intensidad: 1 },
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
    })),
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface PublicHeatMapProps {
  points: HeatmapPoint[];
}

export default function PublicHeatMap({ points }: PublicHeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Filtros disponibles: solo los tipos de servicio que tienen puntos en el JSON
  const availableFiltros = useMemo<Filtro[]>(() => {
    const tipos = new Set(
      points
        .map((p) => categoryToFiltro(p.category))
        .filter((t): t is TipoServicio => t !== null),
    );
    return [
      "todos",
      ...(["luz", "agua", "aseo"] as TipoServicio[]).filter((t) => tipos.has(t)),
    ];
  }, [points]);

  // Puntos filtrados según selección activa
  const filteredPoints = useMemo(
    () =>
      filtro === "todos"
        ? points
        : points.filter((p) => categoryToFiltro(p.category) === filtro),
    [points, filtro],
  );

  // ── Inicializar mapa una sola vez ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-62.713, 8.296],
      zoom: 13,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-left");

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      mapRef.current.setMaxBounds([[-62.83, 8.23], [-62.65, 8.35]]);

      mapRef.current.addSource("public-heatmap-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      mapRef.current.addLayer({
        id: "public-heatmap-layer",
        type: "heatmap",
        source: "public-heatmap-source",
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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Actualizar heatmap cuando cambian los puntos filtrados ─────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const source = mapRef.current.getSource(
      "public-heatmap-source",
    ) as maplibregl.GeoJSONSource | undefined;
    source?.setData(buildGeoJSON(filteredPoints));
  }, [filteredPoints, mapLoaded]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mapa */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
      />

      {/* Filtros de servicio */}
      {availableFiltros.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex gap-1 flex-wrap justify-end">
          {availableFiltros.map((f) => {
            const isActive = filtro === f;
            const label =
              f === "todos" ? "Todos" : TIPOS_SERVICIO[f as TipoServicio].label;
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
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

      {/* Recentrar */}
      <button
        className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]"
        onClick={() => mapRef.current?.flyTo({ center: [-62.713, 8.296], zoom: 13 })}
        title="Recentrar mapa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth={2}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </>
  );
}
