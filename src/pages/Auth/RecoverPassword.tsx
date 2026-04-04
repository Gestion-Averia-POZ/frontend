import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Form, Logo } from "../../components/ui";
import { ROUTES } from "../../constants";

export default function RecoverPassword() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="flex items-center justify-between  gap-2 mb-8">
          <Logo classes="flex items-end gap-2" />

          <Link to={ROUTES.LOGIN}>
            <ArrowLeft />
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-[#0F172A]  mb-2">
          Recuperar Contraseña
        </h1>
        <p className="text-[#475569] text-xs mb-6">
          Ingresa tu correo electrónico para recuperar tu contraseña
        </p>

        <Form
          noBorder
          textButton="Enviar código"
          submitClasses="w-full h-[48px] text-base"
          submitIcon={Send}
          fields={[
            {
              icon: Mail,
              label: "Correo Electrónico",
              placeholder: "ejemplo@urbis.com",
              type: "email",
            },
          ]}
        />
      </div>
    </div>
  );
}
