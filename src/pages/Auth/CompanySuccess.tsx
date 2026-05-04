import { Link, useNavigate } from "react-router-dom";
import { Button, Logo } from "../../components/ui";
import { ROUTES } from "../../constants";
import companySuccessImg from "../../assets/images/2812144775_167bb6f1b5_b.jpg";
import { Send } from "lucide-react";

export default function CompanySuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo ── */}
      <div
        className="flex flex-col justify-center px-12 py-16 w-full lg:w-1/2"
        style={{ backgroundColor: "#0B1740" }}
      >
        <div className="mb-14">
          <Logo classes="flex items-end gap-2 text-white" />
        </div>

        <h1
          className="text-4xl font-bold text-white leading-tight mb-6"
          style={{ animation: "fadeIn 0.6s ease forwards" }}
        >
          Su solicitud ha sido registrada en el sistema.
        </h1>

        <p
          className="text-blue-200 text-base leading-relaxed mb-10"
          style={{ animation: "fadeIn 0.7s ease forwards" }}
        >
          Nuestros administradores se contactarán con usted para continuar el
          proceso de registro.
        </p>

        <Link to={ROUTES.HOME}>
          <Button
            variant_classes="btn-primary mr-8  lg:btn-lg xl:btn-xl"
            text="Volver al Inicio"
            icon={Send}
          />
        </Link>
      </div>

      {/* ── Panel derecho — imagen ── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Nuevo contenedor para la imagen de fondo con efectos */}
        <div
          className="
      w-full h-full
      bg-cover bg-center bg-no-repeat
      
      overflow-hidden
      
      /* 1. Sombra personalizada (sin cambios) */
      shadow-[-10px_10px_20px_rgba(0,0,0,0.4)]
      
      /* 2. Filtro CORREGIDO para un tono de negro suave manteniendo los colores reales */
      /* Eliminamos hue-rotate, aumentamos saturación a 0.85, aumentamos brillo a 0.8 */
      [filter:hue-rotate(0deg)_saturate(0.85)_brightness(0.8)]
      
      transition-filter duration-300
    "
          style={{
            // Reemplaza la etiqueta <img> por la imagen de fondo
            backgroundImage: `url(${companySuccessImg})`,
          }}
        />

        {/* Capa de oscurecimiento adicional opcional (como en la segunda imagen) */}
        {/* <div className="absolute inset-0 bg-black/30" /> */}
      </div>
    </div>
  );
}
