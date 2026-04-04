import { Download, Files, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Button, Card, MetricsCharts } from "../../../components/ui";
import { Map } from "../../../components/layout";
import servicesSvg from "../../../assets/icons/services.svg";
import List from "../../../components/ui/LIst";

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-2">
      <section id="Resumen" className="flex flex-col gap-4">
        <h1 className="mb-2 text-4xl font-bold">Resumen</h1>
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
          columns={[
            { key: "empresa", header: "empresa" },
            { key: "servicio", header: "servicio" },
            { key: "prioridad", header: "prioridad" },
            { key: "estado", header: "estado" },
            { key: "sector", header: "sector" },
          ]}
          data={[
            {
              id: 1,
              empresa: "empresa x",
              servicio: "Agua",
              prioridad: "Alta",
              estado: "Pendiente",
              sector: "Unare",
            },
            {
              id: 2,
              empresa: "empresa y",
              servicio: "Luz",
              prioridad: "Baja",
              estado: "Revision",
              sector: "Sierra Parima",
            },
            {
              id: 3,
              empresa: "empresa x",
              servicio: "Agua",
              prioridad: "Alta",
              estado: "Pendiente",
              sector: "Unare",
            },
            {
              id: 4,
              empresa: "empresa y",
              servicio: "Luz",
              prioridad: "Baja",
              estado: "Revision",
              sector: "Sierra Parima",
            },
            {
              id: 5,
              empresa: "empresa y",
              servicio: "Luz",
              prioridad: "Baja",
              estado: "Revision",
              sector: "Sierra Parima",
            },
          ]}
          actions={[
            {
              label: "Ver Detalles",
              onClick: (row) => alert(`Ver detalles de reporte ${row.id}`),
            },
          ]}
        />
      </section>
    </div>
  );
}
