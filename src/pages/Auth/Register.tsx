import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  Settings2,
  User,
} from "lucide-react";
import { Form, Logo } from "../../components/ui";
import MultiSelect from "../../components/ui/MultiSelect";
import { ROUTES } from "../../constants";
import { authService } from "../../services/auth.service";
import { solicitudesService } from "../../services/solicitudes.service";

type Step = "choose" | "email" | "otp" | "register" | "company";

const SERVICES = [
  "Agua",
  "Electricidad",
  "Aseo Urbano",
  "Telecomunicaciones",
  "Otro (redactar en descripción)",
];

// Validaciones de formato
const RIF_REGEX = /^[A-Z]-\d{7,9}$/;
const PHONE_REGEX = /^\+58\d{10}$/;
const EMAIL_LOWER_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md relative">
        {children}
      </div>
    </div>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-8">
      <Logo classes="flex items-end gap-2" />
      <button
        onClick={onBack}
        className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} />
      </button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choose");

  // Shared data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Citizen form data
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Company form data
  const [companyName, setCompanyName] = useState("");
  const [rif, setRif] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showCompanySuccess, setShowCompanySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRefs[0].current?.focus(), 50);
  }, [step]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    if (!showCompanySuccess) return;
    const t = setTimeout(() => navigate(ROUTES.COMPANY_SUCCESS), 2500);
    return () => clearTimeout(t);
  }, [showCompanySuccess]);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateCompanyForm(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!companyName.trim())
      errors.companyName = "El nombre de la compañía es requerido.";
    if (!RIF_REGEX.test(rif))
      errors.rif = "Formato: J-12345678 (letra mayúscula, guión, 7-9 dígitos).";
    if (!PHONE_REGEX.test(companyPhone))
      errors.companyPhone =
        "Formato: +58424XXXXXXX (código país + 10 dígitos).";
    if (!address.trim()) errors.address = "La dirección es requerida.";
    if (services.length === 0)
      errors.services = "Selecciona al menos un servicio.";
    if (!EMAIL_LOWER_REGEX.test(companyEmail))
      errors.companyEmail =
        "Correo en minúsculas sin espacios. Ej: correo@example.com";
    return errors;
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs[index - 1].current?.focus();
  }

  // NOTA: La verificación por OTP se omite temporalmente porque el envío de
  // correos OTP a Gmail requiere un plan pagado en Vercel. El paso "otp" y sus
  // handlers (handleVerifyOTP, handleResendOTP, etc.) se conservan inactivos.
  // Para reactivarlo: aquí, volver a llamar a authService.sendRegisterOTP(email)
  // y hacer setStep("otp") en lugar de setStep("register"); y apuntar el botón
  // "atrás" del formulario de registro de nuevo a "otp".
  async function handleContinueWithEmail(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const check = await authService.checkEmail(email);
      if (check.data.exists) {
        setError("Este correo ya está registrado.");
        return;
      }
      setStep("register");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo validar el correo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: { preventDefault(): void }) {
    e.preventDefault();
    if (otp.some((d) => !d)) return;
    setError("");
    setLoading(true);
    try {
      await authService.verifyOTP(email, otp.join(""), "register");
      setStep("register");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Código inválido o expirado.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.sendRegisterOTP(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reenviar el código.",
      );
    }
  }

  function normalizePhone(raw: string): string | undefined {
    if (!raw) return undefined;
    if (raw.startsWith("+")) return raw;
    if (raw.startsWith("0")) return `+58${raw.slice(1)}`;
    return `+58${raw}`;
  }

  async function handleRegister(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register({
        name,
        lastname,
        email,
        password,
        phoneNumber: normalizePhone(phone),
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la cuenta.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCompanyRegister(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    const errors = validateCompanyForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const descriptionText = [
        `- Nombre de la Empresa: ${companyName}`,
        `- RIF: ${rif}`,
        `- Telefono: ${companyPhone}`,
        `- Direccion: ${address}`,
        `- Servicios: ${services.join(", ")}`,
        `- Correo electronico: ${companyEmail}`,
        `- Descripcion: ${description || "N/A"}`,
      ].join("\n");

      await solicitudesService.create({
        applicantName: companyName,
        type: "REGISTRO",
        description: descriptionText,
      });

      setShowCompanySuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar la compañía.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Step: choose ──────────────────────────────────────────────
  if (step === "choose")
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-10">
            <Logo classes="flex items-end gap-2" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              ¿Cómo deseas registrarte?
            </h1>
            <p className="text-[#475569] text-sm">
              Selecciona el tipo de cuenta que mejor se adapte a ti
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <button
              onClick={() => setStep("company")}
              className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: "#2563EB" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Building2 size={28} color="white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-2">Compañía</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Gestiona los reportes de avería de tus clientes con tecnología
                  moderna.
                </p>
              </div>
              <span className="text-white font-medium text-sm mt-auto">
                Registrar compañía &rsaquo;
              </span>
            </button>

            <button
              onClick={() => setStep("email")}
              className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: "#2563EB" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <User size={28} color="white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-2">Ciudadano</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Contribuye a la mejora de calidad de servicios de la ciudad.
                </p>
              </div>
              <span className="text-white font-medium text-sm mt-auto">
                Registrar ciudadano &rsaquo;
              </span>
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-[#64748B]">¿Ya tienes cuenta? </span>
            <Link
              to={ROUTES.LOGIN}
              className="text-[#2563EB] font-medium hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    );

  // ── Step: company form ────────────────────────────────────────
  if (step === "company")
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-xl relative">
          <BackHeader onBack={() => setStep("choose")} />
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Solicitud de registro de compañía
          </h1>
          <p className="text-[#475569] text-xs mb-6">
            Completa los datos de tu empresa para enviar tu solicitud de
            registro.
          </p>

          <form
            onSubmit={handleCompanyRegister}
            className="flex flex-col gap-4"
          >
            {/* Nombre de la compañía */}
            <div>
              <label className="label mb-1">
                <Building2 color="#2563EB" size={16} />
                <span className="label-text font-medium">
                  Nombre de la compañía
                </span>
              </label>
              <input
                type="text"
                className={`input w-full ${fieldErrors.companyName ? "input-error" : ""}`}
                placeholder="Empresa C.A."
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  clearFieldError("companyName");
                }}
              />
              <FieldError message={fieldErrors.companyName} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* RIF */}
              <div>
                <label className="label mb-1">
                  <FileText color="#2563EB" size={16} />
                  <span className="label-text font-medium">RIF</span>
                </label>
                <input
                  type="text"
                  className={`input w-full ${fieldErrors.rif ? "input-error" : ""}`}
                  placeholder="J-123456789"
                  value={rif}
                  onChange={(e) => {
                    setRif(e.target.value.toUpperCase());
                    clearFieldError("rif");
                  }}
                />
                <FieldError message={fieldErrors.rif} />
              </div>

              {/* Teléfono */}
              <div>
                <label className="label mb-1">
                  <Phone color="#2563EB" size={16} />
                  <span className="label-text font-medium">Teléfono</span>
                </label>
                <input
                  type="tel"
                  className={`input w-full ${fieldErrors.companyPhone ? "input-error" : ""}`}
                  placeholder="+58424XXXXXXX"
                  value={companyPhone}
                  onChange={(e) => {
                    setCompanyPhone(e.target.value);
                    clearFieldError("companyPhone");
                  }}
                />
                <FieldError message={fieldErrors.companyPhone} />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="label mb-1">
                <MapPin color="#2563EB" size={16} />
                <span className="label-text font-medium">Dirección</span>
              </label>
              <input
                type="text"
                className={`input w-full ${fieldErrors.address ? "input-error" : ""}`}
                placeholder="Av. Principal, Edificio Torre Norte, Piso 3"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearFieldError("address");
                }}
              />
              <FieldError message={fieldErrors.address} />
            </div>

            {/* Servicios */}
            <div>
              <label className="label mb-1">
                <Settings2 color="#2563EB" size={16} />
                <span className="label-text font-medium">Servicios</span>
              </label>
              <MultiSelect
                placeholder="Selecciona uno o más servicios"
                options={SERVICES}
                value={services}
                onChange={(v) => {
                  setServices(v);
                  clearFieldError("services");
                }}
                error={!!fieldErrors.services}
              />
              <FieldError message={fieldErrors.services} />
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="label mb-1">
                <Mail color="#2563EB" size={16} />
                <span className="label-text font-medium">
                  Correo Electrónico
                </span>
              </label>
              <input
                type="email"
                className={`input w-full ${fieldErrors.companyEmail ? "input-error" : ""}`}
                placeholder="contacto@empresa.com"
                value={companyEmail}
                onChange={(e) => {
                  setCompanyEmail(e.target.value);
                  clearFieldError("companyEmail");
                }}
              />
              <FieldError message={fieldErrors.companyEmail} />
            </div>

            {/* Descripción */}
            <div>
              <label className="label mb-1">
                <FileText color="#2563EB" size={16} />
                <span className="label-text font-medium">
                  Descripción{" "}
                  <span className="text-[#94A3B8] font-normal">(opcional)</span>
                </span>
              </label>
              <textarea
                className="textarea w-full resize-none"
                placeholder="Describe brevemente los servicios que ofrece tu empresa. Si seleccionaste 'Otro', detállalo aquí."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary rounded-xl w-full h-[48px] text-base mt-2"
            >
              {loading
                ? "Enviando solicitud..."
                : "Enviar solicitud de registro"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            <span className="text-[#64748B]">¿Ya tienes cuenta? </span>
            <Link
              to={ROUTES.LOGIN}
              className="text-[#2563EB] font-medium hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>

          {showCompanySuccess && (
            <div
              className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
              style={{ animation: "fadeIn 0.3s ease forwards" }}
            >
              <div
                className="flex items-center justify-center w-20 h-20 rounded-full"
                style={{
                  backgroundColor: "#DCFCE7",
                  animation:
                    "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                }}
              >
                <CheckCircle2 size={44} color="#16A34A" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">¡Felicidades!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ha formalizado su solicitud.
                </p>
              </div>
              <p className="text-xs text-gray-400">Procesando su registro...</p>
            </div>
          )}
        </div>
      </div>
    );

  // ── Step 1: Email ─────────────────────────────────────────────
  if (step === "email")
    return (
      <Card>
        <BackHeader onBack={() => setStep("choose")} />
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Crear cuenta</h1>
        <p className="text-[#475569] text-xs mb-6">
          Ingresa tu correo para comenzar tu registro.
        </p>
        <Form
          noBorder
          textButton={loading ? "Validando..." : "Continuar"}
          submitClasses="w-full h-[48px] text-base"
          submitIcon={Send}
          onSubmit={handleContinueWithEmail}
          error={error}
          fields={[
            {
              icon: Mail,
              label: "Correo Electrónico",
              placeholder: "ejemplo@urbis.com",
              type: "email",
              value: email,
              onChange: setEmail,
            },
          ]}
        />
        <div className="text-center mt-6 text-sm">
          <span className="text-[#64748B]">¿Ya tienes una cuenta? </span>
          <Link
            to={ROUTES.LOGIN}
            className="text-[#2563EB] font-medium hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </Card>
    );

  // ── Step 2: OTP ───────────────────────────────────────────────
  if (step === "otp")
    return (
      <Card>
        <BackHeader onBack={() => setStep("email")} />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Verificación de Correo
          </h1>
          <p className="text-[#475569] text-sm">
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="font-medium text-[#0F172A]">{email}</span>.
          </p>
        </div>
        <form
          onSubmit={handleVerifyOTP}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="input w-12 h-12 text-center text-xl font-bold"
                style={{ borderColor: digit ? "#2563EB" : undefined }}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm -mt-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary rounded-xl w-full h-[48px] text-base"
          >
            {loading ? "Verificando..." : "Verificar Cuenta"}
          </button>
          <p className="text-sm text-gray-500">
            ¿No recibiste el código?{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
            >
              Reenviar
            </button>
          </p>
        </form>
      </Card>
    );

  // ── Step 3: Formulario de registro ────────────────────────────
  return (
    <Card>
      <BackHeader onBack={() => setStep("email")} />
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Crear cuenta</h1>
      <p className="text-[#475569] text-xs mb-6">
        Únete a Urbis y comienza a reportar
      </p>

      <Form
        gridFields={4}
        noBorder
        textButton={loading ? "Creando cuenta..." : "Crear cuenta"}
        submitClasses="w-full h-[48px] text-base"
        submitIcon={Send}
        onSubmit={handleRegister}
        error={error}
        fields={[
          {
            icon: User,
            label: "Nombre",
            placeholder: "John",
            type: "text",
            value: name,
            onChange: setName,
          },
          {
            icon: User,
            label: "Apellido",
            placeholder: "Doe",
            type: "text",
            value: lastname,
            onChange: setLastname,
          },
          {
            icon: Phone,
            label: "Teléfono",
            placeholder: "04241234567",
            type: "tel",
            value: phone,
            onChange: (v) => setPhone(v.replace(/\D/g, "")),
          },
          {
            icon: Mail,
            label: "Correo Electrónico",
            placeholder: email,
            type: "email",
            value: email,
            disabled: true,
          },
          {
            icon: Lock,
            label: "Contraseña",
            placeholder: "••••••••",
            type: "password",
            value: password,
            onChange: setPassword,
          },
        ]}
      />

      <div className="text-center mt-4 text-sm">
        <span className="text-[#64748B]">¿Ya tienes una cuenta? </span>
        <Link
          to={ROUTES.LOGIN}
          className="text-[#2563EB] font-medium hover:underline"
        >
          Inicia sesión aquí
        </Link>
      </div>

      <div className="divider my-4" />

      {showSuccess && (
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
          style={{ animation: "fadeIn 0.3s ease forwards" }}
        >
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full"
            style={{
              backgroundColor: "#DCFCE7",
              animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <CheckCircle2 size={44} color="#16A34A" strokeWidth={1.8} />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">¡Felicidades!</p>
            <p className="text-sm text-gray-500 mt-1">
              Has completado tu registro con éxito.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      )}
    </Card>
  );
}
