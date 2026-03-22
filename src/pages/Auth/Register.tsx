import Form from "../../components/Form";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Send } from "lucide-react";
import Logo from "../../components/Logo";

export default function Register() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 p-20">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-between  gap-2 mb-8">
          <Logo classes="flex items-end gap-2" />

          <Link to="/login">
            <ArrowLeft />
          </Link>
        </div>

        {/* Encabezado */}
        <h1 className="text-3xl font-bold text-[#0F172A]  mb-2">
          Crear cuenta
        </h1>
        <p className="text-[#475569] text-xs mb-6">
          Únete a Urbis y comienza a reportar
        </p>

        <Form
          gridFields={4}
          noBorder
          textButton="Crear cuenta"
          submitClasses="w-full h-[48px] text-base"
          submitIcon={Send}
          fields={[
            {
              label: "Nombre",
              placeholder: "John",
              type: "text",
            },
            {
              label: "Apellido",
              placeholder: "Doe",
              type: "text",
            },
            {
              label: "Cedula",
              placeholder: "123456789",
              type: "number",
            },
            {
              label: "Teléfono",
              placeholder: "+58 123456789",
              type: "tel",
            },
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

        <div className="text-center mt-4 text-sm">
          <span className="text-[#64748B]">¿Ya tienes una cuenta?</span>
          <span className="text-[#2563EB]">
            <Link to="/login"> Inicia sesión aquí</Link>
          </span>
        </div>

        <div className="divider my-4" />

        <Link to="/privacy" className="hover:underline">
          <span className="text-xs text-[#64748B]">
            Consulte nuestros Términos de Servicio y Política de Privacidad.
          </span>
        </Link>
      </div>
    </div>
  );
}
