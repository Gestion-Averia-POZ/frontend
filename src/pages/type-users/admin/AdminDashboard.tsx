import {
  Download,
  Files,
  AlertTriangle,
  ClipboardCheck,
  Droplet,
  Zap,
  Trash2,
} from "lucide-react";
import { Button, Card, MetricsCharts } from "../../../components/ui";
import { Map } from "../../../components/layout";
import servicesSvg from "../../../assets/icons/services.svg";
import List from "../../../components/ui/LIst";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants";

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto px-2">
      <section id="Resumen" className="flex flex-col gap-2">
        <h1 className=" text-4xl font-bold">Resumen</h1>
        <small>Panel de control con resumen de las averías de la ciudad</small>
        <div className="text-right">
          <Button
            text="Descargar Reporte Excel"
            icon={Download}
            variant_classes="btn-primary btn-sm w-fit"
          />
        </div>

        <div className="grid grid-cols-4">
          <Card
            title="Total de Reportes"
            description="113"
            bgIcon={Files}
            extraClasses="bg-[#DBEAFE] text-[#1E40AF]"
          />
          <Card
            title="Reportes sin Atender"
            description="50"
            bgIcon={AlertTriangle}
            extraClasses="bg-[#FEF9C3] text-[#854D0E]"
          />
          <Card
            title="Reportes Atendidos"
            description="63"
            bgIcon={ClipboardCheck}
            extraClasses="bg-[#DCFCE7] text-[#166534]"
          />
          <Card
            title="Fallas principales"
            description="AGUA/LUZ"
            bgImage={servicesSvg}
            extraClasses="bg-[#FCA5A5] text-[#7F1D1D]"
          />
        </div>
      </section>

      <section id="Mapa" className="mt-8">
        <div className="h-[480px] w-full">
          <Map />
        </div>
      </section>

      <section id="Metricas" className="mt-15 mb-15">
        <h2 className="mb-4 text-2xl font-semibold">Métricas</h2>
        <MetricsCharts />
      </section>

      <section id="Ultimas-incidencias" className="mt-15">
        <h2 className="mb-2 text-2xl font-semibold">Últimas Incidencias</h2>
        <List
          renderRowId={(id) => (
            <span className="font-mono text-xs" style={{ color: "#64748B" }}>
              #URB-{String(id).padStart(4, "0")}
            </span>
          )}
          columns={[
            {
              key: "empresa",
              header: "Empresa",
              render: (row) => (
                <span className="font-bold text-gray-900">{row.empresa}</span>
              ),
            },
            {
              key: "servicio",
              header: "Servicio",
              render: (row) => {
                const cfg: Record<
                  string,
                  { icon: typeof Droplet; color: string; label: string }
                > = {
                  Agua: {
                    icon: Droplet,
                    color: "#3B82F6",
                    label: "Agua Potable",
                  },
                  Electricidad: {
                    icon: Zap,
                    color: "#EAB308",
                    label: "Luz Eléctrica",
                  },
                  "Aseo Urbano": {
                    icon: Trash2,
                    color: "#F97316",
                    label: "Aseo Urbano",
                  },
                };
                const s = cfg[row.servicio];
                if (!s) return row.servicio;
                const Icon = s.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Icon size={16} color={s.color} />
                    <span className="text-gray-700">{s.label}</span>
                  </div>
                );
              },
            },
            {
              key: "estado",
              header: "Estado",
              render: (row) => {
                const cfg: Record<
                  string,
                  { label: string; bg: string; color: string }
                > = {
                  Pendiente: {
                    label: "PENDIENTE",
                    bg: "#F1F5F9",
                    color: "#64748B",
                  },
                  Revisión: {
                    label: "EN PROCESO",
                    bg: "#FEF3C7",
                    color: "#D97706",
                  },
                  Resuelto: {
                    label: "COMPLETADO",
                    bg: "#DCFCE7",
                    color: "#16A34A",
                  },
                };
                const s = cfg[row.estado] ?? {
                  label: row.estado,
                  bg: "#F1F5F9",
                  color: "#64748B",
                };
                return (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                );
              },
            },
            {
              key: "prioridad",
              header: "Prioridad",
              render: (row) => {
                const cfg: Record<string, { color: string }> = {
                  Alta: { color: "#EF4444" },
                  Media: { color: "#F97316" },
                  Baja: { color: "#22C55E" },
                };
                const s = cfg[row.prioridad] ?? { color: "#64748B" };
                return (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium" style={{ color: s.color }}>
                      {row.prioridad}
                    </span>
                  </div>
                );
              },
            },
            {
              key: "sector",
              header: "Sector",
              render: (row) => (
                <span style={{ color: "#64748B" }}>{row.sector}</span>
              ),
            },
          ]}
          data={[
            {
              id: 1,
              empresa: "Empresa X",
              servicio: "Agua",
              prioridad: "Alta",
              estado: "Pendiente",
              sector: "Unare",
            },
            {
              id: 2,
              empresa: "Empresa Y",
              servicio: "Electricidad",
              prioridad: "Baja",
              estado: "Revisión",
              sector: "Sierra Parima",
            },
            {
              id: 3,
              empresa: "Empresa X",
              servicio: "Agua",
              prioridad: "Alta",
              estado: "Pendiente",
              sector: "Unare",
            },
            {
              id: 4,
              empresa: "Empresa Y",
              servicio: "Electricidad",
              prioridad: "Media",
              estado: "Revisión",
              sector: "Sierra Parima",
            },
            {
              id: 5,
              empresa: "Empresa Z",
              servicio: "Aseo Urbano",
              prioridad: "Baja",
              estado: "Resuelto",
              sector: "La Llanada",
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: () => navigate(ROUTES.DETALLES_REPORTE),
            },
          ]}
        />
      </section>
    </div>
  );
}
