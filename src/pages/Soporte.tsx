import { useState } from "react";
import { Send, User, Tag, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import CustomSelect from "../components/ui/CustomSelect";
import { requestsService } from "../services/requests.service";

const TIPO_OPTIONS = ["Duda", "Bug"];

export default function Soporte() {
  const { user } = useAuth();
  const [tipo, setTipo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const nombreCompleto = `${user.name} ${user.lastname}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tipo) {
      setError("Debes seleccionar un tipo de solicitud.");
      return;
    }
    if (mensaje.trim().length < 5) {
      setError("La descripción debe tener al menos 5 caracteres.");
      return;
    }

    const fecha = new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const body = {
      applicantName: nombreCompleto,
      type: tipo === "Duda" ? "DUDA" : "BUG",
      description: `${user.email}. ${fecha}:\n${mensaje.trim()}`,
    };

    try {
      setLoading(true);
      await requestsService.create(body);
      setSuccess(true);
      setTipo("");
      setMensaje("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
        <p className="text-sm text-gray-500 mt-1">
          ¿Tienes alguna duda o encontraste un error? Envíanos tu solicitud y un administrador la revisará.
        </p>
      </div>

      {/* Banner de éxito */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">¡Solicitud enviada exitosamente!</p>
            <p className="text-xs text-green-600 mt-0.5">Un administrador revisará tu solicitud pronto.</p>
          </div>
          <button
            className="ml-auto text-green-500 hover:text-green-700"
            onClick={() => setSuccess(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="border border-[#E2E8F0] rounded-xl p-8 bg-white flex flex-col gap-5"
      >
        {/* Nombre */}
        <div>
          <label className="label mb-1">
            <User color="#2563EB" size={16} />
            <span className="label-text font-medium">Nombre</span>
          </label>
          <div
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-700"
            style={{ backgroundColor: "#F0F4FF" }}
          >
            {nombreCompleto}
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="label mb-1">
            <Tag color="#2563EB" size={16} />
            <span className="label-text font-medium">Tipo</span>
          </label>
          <CustomSelect
            placeholder="Selecciona el tipo de solicitud"
            options={TIPO_OPTIONS}
            value={tipo}
            onChange={setTipo}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="label mb-1">
            <MessageSquare color="#2563EB" size={16} />
            <span className="label-text font-medium">Descripción</span>
          </label>
          <textarea
            className="textarea w-full resize-none"
            placeholder="Describe tu duda o el error que encontraste..."
            rows={5}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Button
          text={loading ? "Enviando..." : "Enviar Solicitud"}
          variant_classes="btn-primary mt-2 w-full"
          icon={Send}
          disabled={loading}
        />
      </form>
    </div>
  );
}
