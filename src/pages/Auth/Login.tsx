import { Link } from "react-router-dom";
import { Lock, Mail, Send } from "lucide-react";
import Form from "../../components/Form";
import Logo from "../../components/Logo";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Logo */}
        <Logo classes="flex items-center justify-center gap-2 mb-8" />

        {/* Encabezado */}
        <h1 className="text-3xl font-bold text-[#0F172A] text-center mb-2">
          Bienvenido
        </h1>
        <p className="text-[#475569] text-center mb-6">
          Inicia sesión en tu cuenta de Urbis
        </p>

        {/* Formulario */}
        <Form
          noBorder
          textButton="Iniciar Sesión"
          submitClasses="w-full h-[48px] text-base"
          submitIcon={Send}
          fields={[
            {
              icon: Mail,
              label: "Correo Electrónico",
              placeholder: "ejemplo@urbis.com",
              type: "email",
            },
            {
              icon: Lock,
              label: "Contraseña",
              placeholder: "••••••••",
              type: "password",
            },
          ]}
        />

        {/* Links inferiores */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <Link
            to="/recover-password"
            className="text-sm text-[#2563EB] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-[#94A3B8] hover:underline"
          >
            Política de Privacidad
          </Link>
        </div>

        <div className="divider my-4" />

        <p className="text-center text-sm text-[#475569]">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-[#2563EB] font-medium hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
