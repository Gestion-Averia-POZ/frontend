import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Mail, Send, User, Phone } from "lucide-react";
import { Form, Logo } from "../../components/ui";
import { ROUTES } from "../../constants";
import { authService } from "../../services/auth.service";

type Step = "email" | "otp" | "register";

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

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");

  // Datos compartidos entre pasos
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Datos del formulario de registro (paso 3)
  const [name, setName]         = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

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

  // ── Paso 1: verificar que el email no exista y enviar OTP ────
  async function handleSendOTP(e: { preventDefault(): void }) {
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
      await authService.sendRegisterOTP(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  // ── Paso 2: verificar el OTP ─────────────────────────────────
  async function handleVerifyOTP(e: { preventDefault(): void }) {
    e.preventDefault();
    if (otp.some((d) => !d)) return;
    setError("");
    setLoading(true);
    try {
      await authService.verifyOTP(email, otp.join(""), "register");
      setStep("register");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  }

  // ── Reenviar OTP ──────────────────────────────────────────────
  async function handleResendOTP() {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.sendRegisterOTP(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar el código.");
    }
  }

  // Convierte número local venezolano a E.164 (+58...)
  function normalizePhone(raw: string): string | undefined {
    if (!raw) return undefined;
    if (raw.startsWith("+")) return raw;
    if (raw.startsWith("0")) return `+58${raw.slice(1)}`;
    return `+58${raw}`;
  }

  // ── Paso 3: registrar usuario ─────────────────────────────────
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
      setError(err instanceof Error ? err.message : "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: Email ─────────────────────────────────────────────
  if (step === "email") return (
    <Card>
      <BackHeader onBack={() => navigate(ROUTES.LOGIN)} />
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Crear cuenta</h1>
      <p className="text-[#475569] text-xs mb-6">
        Ingresa tu correo para verificar tu identidad antes de registrarte.
      </p>
      <Form
        noBorder
        textButton={loading ? "Enviando..." : "Enviar código"}
        submitClasses="w-full h-[48px] text-base"
        submitIcon={Send}
        onSubmit={handleSendOTP}
        error={error}
        fields={[{
          icon: Mail,
          label: "Correo Electrónico",
          placeholder: "ejemplo@urbis.com",
          type: "email",
          value: email,
          onChange: setEmail,
        }]}
      />
      <div className="text-center mt-6 text-sm">
        <span className="text-[#64748B]">¿Ya tienes una cuenta? </span>
        <Link to={ROUTES.LOGIN} className="text-[#2563EB] font-medium hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </Card>
  );

  // ── Step 2: OTP ───────────────────────────────────────────────
  if (step === "otp") return (
    <Card>
      <BackHeader onBack={() => setStep("email")} />
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Verificación de Correo</h1>
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

        {error && (
          <p className="text-red-500 text-sm -mt-4">{error}</p>
        )}

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
      <BackHeader onBack={() => setStep("otp")} />
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Crear cuenta</h1>
      <p className="text-[#475569] text-xs mb-6">Únete a Urbis y comienza a reportar</p>

      <Form
        gridFields={4}
        noBorder
        textButton={loading ? "Creando cuenta..." : "Crear cuenta"}
        submitClasses="w-full h-[48px] text-base"
        submitIcon={Send}
        onSubmit={handleRegister}
        error={error}
        fields={[
          { icon: User,  label: "Nombre",              placeholder: "John",                type: "text",     value: name,     onChange: setName },
          { icon: User,  label: "Apellido",             placeholder: "Doe",                 type: "text",     value: lastname, onChange: setLastname },
          { icon: Phone, label: "Teléfono",             placeholder: "04241234567",         type: "tel",      value: phone,    onChange: (v) => setPhone(v.replace(/\D/g, "")) },
          { icon: Mail,  label: "Correo Electrónico",   placeholder: email,                 type: "email",    value: email,    disabled: true },
          { icon: Lock,  label: "Contraseña",           placeholder: "••••••••",            type: "password", value: password, onChange: setPassword },
        ]}
      />

      <div className="text-center mt-4 text-sm">
        <span className="text-[#64748B]">¿Ya tienes una cuenta? </span>
        <Link to={ROUTES.LOGIN} className="text-[#2563EB] font-medium hover:underline">
          Inicia sesión aquí
        </Link>
      </div>

      <div className="divider my-4" />

      <Link to={ROUTES.PRIVACY} className="hover:underline">
        <span className="text-xs text-[#64748B]">
          Consulte nuestros Términos de Servicio y Política de Privacidad.
        </span>
      </Link>

      {showSuccess && (
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4"
          style={{ animation: "fadeIn 0.3s ease forwards" }}
        >
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full"
            style={{ backgroundColor: "#DCFCE7", animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <CheckCircle2 size={44} color="#16A34A" strokeWidth={1.8} />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">¡Felicidades!</p>
            <p className="text-sm text-gray-500 mt-1">Has completado tu registro con éxito.</p>
          </div>
          <p className="text-xs text-gray-400">Redirigiendo al inicio de sesión...</p>
        </div>
      )}
    </Card>
  );
}
