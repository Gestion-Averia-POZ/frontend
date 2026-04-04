import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Zap, Droplet, Trash2 } from "lucide-react";

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
}

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE TIPOS DE SERVICIO
// Define el ícono y color de cada categoría
// ─────────────────────────────────────────────

const TIPOS_SERVICIO: Record<
  TipoServicio,
  { label: string; Icon: React.ElementType; color: string }
> = {
  luz: { label: "Luz", Icon: Zap, color: "#f0a31d" },
  agua: { label: "Agua", Icon: Droplet, color: "#3b82f6" },
  aseo: { label: "Aseo", Icon: Trash2, color: "#835911" },
};

// ─────────────────────────────────────────────
// MARCADORES DE INCIDENCIAS
// Cada punto representa un reporte ciudadano
// ─────────────────────────────────────────────

const MARCADORES: Marcador[] = [
  {
    id: 1,
    coords: [-62.753, 8.281],
    tipo: "luz",
    label: "Avería eléctrica – UNARE",
  },
  {
    id: 2,
    coords: [-62.737, 8.286],
    tipo: "luz",
    label: "Avería eléctrica – ALTA VISTA",
  },
  {
    id: 3,
    coords: [-62.705, 8.296],
    tipo: "luz",
    label: "Avería eléctrica – CASTILLITO",
  },
  {
    id: 4,
    coords: [-62.667, 8.295],
    tipo: "luz",
    label: "Avería eléctrica – TANATA",
  },
  {
    id: 5,
    coords: [-62.721, 8.292],
    tipo: "agua",
    label: "Fuga de agua – ALTA VISTA",
  },
  {
    id: 6,
    coords: [-62.695, 8.303],
    tipo: "agua",
    label: "Fuga de agua – CASTILLITO",
  },
  {
    id: 7,
    coords: [-62.675, 8.309],
    tipo: "aseo",
    label: "Fuga de aseo – COMRUSTO",
  },
];

// ─────────────────────────────────────────────
// PUNTOS DE CALOR BASE
// Cada punto contribuye al heatmap con una
// intensidad y pertenece a un tipo de servicio
// ─────────────────────────────────────────────

const PUNTOS_CALOR: Array<{
  coords: [number, number];
  intensidad: number;
  tipo: TipoServicio;
}> = [
  // UNARE – núcleo eléctrico crítico
  { coords: [-62.756, 8.28], intensidad: 10, tipo: "luz" },
  { coords: [-62.753, 8.283], intensidad: 9, tipo: "luz" },
  { coords: [-62.75, 8.278], intensidad: 8, tipo: "luz" },
  { coords: [-62.759, 8.285], intensidad: 7, tipo: "luz" },
  { coords: [-62.747, 8.281], intensidad: 6, tipo: "luz" },

  // ALTA VISTA – núcleo eléctrico + agua
  { coords: [-62.738, 8.29], intensidad: 8, tipo: "luz" },
  { coords: [-62.735, 8.293], intensidad: 7, tipo: "luz" },
  { coords: [-62.741, 8.287], intensidad: 6, tipo: "luz" },
  { coords: [-62.722, 8.292], intensidad: 7, tipo: "agua" },
  { coords: [-62.718, 8.289], intensidad: 5, tipo: "agua" },
  { coords: [-62.725, 8.295], intensidad: 6, tipo: "agua" },

  // CASTILLITO centro – eléctrica + agua
  { coords: [-62.706, 8.296], intensidad: 9, tipo: "luz" },
  { coords: [-62.711, 8.299], intensidad: 7, tipo: "luz" },
  { coords: [-62.7, 8.293], intensidad: 6, tipo: "luz" },
  { coords: [-62.696, 8.304], intensidad: 5, tipo: "agua" },
  { coords: [-62.693, 8.301], intensidad: 4, tipo: "agua" },

  // COMRUSTO – núcleo de agua
  { coords: [-62.677, 8.309], intensidad: 10, tipo: "aseo" },
  { coords: [-62.673, 8.306], intensidad: 8, tipo: "aseo" },
  { coords: [-62.681, 8.312], intensidad: 9, tipo: "aseo" },
  { coords: [-62.67, 8.308], intensidad: 7, tipo: "aseo" },

  // BOUNAS / TANATA – núcleo eléctrico
  { coords: [-62.668, 8.291], intensidad: 9, tipo: "luz" },
  { coords: [-62.665, 8.288], intensidad: 8, tipo: "luz" },
  { coords: [-62.672, 8.294], intensidad: 7, tipo: "luz" },
  { coords: [-62.661, 8.29], intensidad: 6, tipo: "luz" },
];

// ─────────────────────────────────────────────
// UTILIDAD: construye el GeoJSON a partir del
// filtro activo para actualizar el heatmap
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// COMPONENTE MAP
// ─────────────────────────────────────────────

export default function Map() {
  // Referencia al div contenedor del mapa
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Instancia del mapa de MapLibre
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Bandera que indica si el mapa terminó de cargar
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filtro activo: "todos" muestra todas las incidencias
  const [filtroActivo, setFiltroActivo] = useState<Filtro>("todos");

  // Almacena los marcadores instanciados y sus roots de React
  // para poder mostrar/ocultar y limpiar correctamente
  const marcadoresRef = useRef<
    Array<{ marker: maplibregl.Marker; tipo: TipoServicio; root: Root }>
  >([]);

  // Límites geográficos de Puerto Ordaz (impide que el usuario se aleje)
  const PZO_BOUNDS: [[number, number], [number, number]] = [
    [-62.83, 8.23],
    [-62.65, 8.35],
  ];

  // ── Inicialización del mapa ──────────────────
  useEffect(() => {
    // Evita doble inicialización (React StrictMode)
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-62.713, 8.296],
      zoom: 13,
    });

    // Control de navegación (zoom ++ y brújula)
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-left");

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      // Restringe el área visible a Puerto Ordaz
      mapRef.current.setMaxBounds(PZO_BOUNDS);

      // ── Fuente de datos GeoJSON para el heatmap ──
      mapRef.current.addSource("averias-source", {
        type: "geojson",
        data: buildGeoJSON("todos"),
      });

      // ── Capa de heatmap ──────────────────────────
      mapRef.current.addLayer({
        id: "averias-heat",
        type: "heatmap",
        source: "averias-source",
        paint: {
          // Peso de cada punto según su intensidad (1–10)
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "intensidad"],
            1,
            0.2,
            10,
            1,
          ],

          // Intensidad global escala con el zoom
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1,
            15,
            3,
          ],

          // Radio de difusión de cada punto
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            20,
            14,
            55,
          ],

          // Paleta de colores: transparente → azul → amarillo → naranja → rojo
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.15,
            "rgba(0,0,255,0.4)",
            0.4,
            "rgb(255,255,0)",
            0.7,
            "rgb(255,140,0)",
            1,
            "rgb(220,0,0)",
          ],

          // Opacidad global del heatmap (no tapa completamente el mapa base)
          "heatmap-opacity": 0.72,
        },
      });

      // ── Marcadores de incidencias ────────────────
      MARCADORES.forEach(({ coords, tipo, label }) => {
        const { Icon, color } = TIPOS_SERVICIO[tipo];

        // Elemento HTML que contendrá el ícono de Lucide
        const el = document.createElement("div");
        el.title = label;
        Object.assign(el.style, {
          width: "34px",
          height: "34px",
          background: color, // Color propio del tipo de servicio
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
          cursor: "pointer",
        });

        // Renderiza el ícono de Lucide dentro del elemento DOM
        const root = createRoot(el);
        root.render(<Icon size={18} color="white" strokeWidth={2.2} />);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(mapRef.current!);

        // Guarda referencia para filtrado y cleanup
        marcadoresRef.current.push({ marker, tipo, root });
      });

      // Fuerza redimensionado por si el contenedor cambió de tamaño
      mapRef.current.resize();
      setMapLoaded(true);
    });

    // Cleanup: elimina el mapa y los roots de React al desmontar
    return () => {
      marcadoresRef.current.forEach(({ root }) => root.unmount());
      marcadoresRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Efecto de filtrado ───────────────────────
  // Se ejecuta cada vez que el usuario cambia el filtro
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Actualiza los puntos del heatmap según el filtro
    const source = mapRef.current.getSource(
      "averias-source",
    ) as maplibregl.GeoJSONSource;
    source?.setData(buildGeoJSON(filtroActivo));

    // Muestra u oculta cada marcador según su tipo
    marcadoresRef.current.forEach(({ marker, tipo }) => {
      const visible = filtroActivo === "todos" || filtroActivo === tipo;
      marker.getElement().style.display = visible ? "flex" : "none";
    });
  }, [filtroActivo, mapLoaded]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      {/* Contenedor del mapa (MapLibre lo llena al 100%) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* ── Botones de filtro (superpuestos top-right) ── */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 flex-wrap justify-end">
        {(["todos", "luz", "agua", "aseo"] as Filtro[]).map((f) => {
          const isActive = filtroActivo === f;
          const label =
            f === "todos" ? "Todos" : TIPOS_SERVICIO[f as TipoServicio].label;

          return (
            <button
              key={f}
              onClick={() => setFiltroActivo(f)}
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

      {/* ── Botón para recentrar el mapa ── */}
      <button
        className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]"
        onClick={() =>
          mapRef.current?.flyTo({ center: [-62.713, 8.296], zoom: 13 })
        }
        title="Recentrar mapa"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#1e293b"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </div>
  );
}
