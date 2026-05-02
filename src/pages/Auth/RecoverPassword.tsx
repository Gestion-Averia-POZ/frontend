import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Mail, Send } from "lucide-react";
import { Form, Logo } from "../../components/ui";
import { ROUTES } from "../../constants";
import { authService } from "../../services/auth.service";

type Step = "email" | "otp" | "password";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
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

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail]                   = useState("");
  const [otp, setOtp]                       = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");

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

  const passwordMismatch = !!confirmPassword && newPassword !== confirmPassword;

  // ── Paso 1: enviar OTP al email registrado ────────────────────
  async function handleSendOTP(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await authService.sendResetPasswordOTP(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  // ── Paso 2: validar OTP localmente y avanzar ─────────────────
  // No se llama a verifyOTP aquí porque el backend lo elimina de Redis
  // al verificarlo, dejando al endpoint reset-password sin OTP que validar.
  // El único llamado que consume el OTP es reset-password en el paso 3.
  function handleVerifyOTP(e: { preventDefault(): void }) {
    e.preventDefault();
    if (otp.some((d) => !d)) {
      setError("Ingresa los 6 dígitos del código.");
      return;
    }
    setError("");
    setStep("password");
  }

  // ── Reenviar OTP ──────────────────────────────────────────────
  async function handleResendOTP() {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.sendResetPasswordOTP(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar el código.");
    }
  }

  // ── Paso 3: resetear contraseña ───────────────────────────────
  async function handleResetPassword(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!newPassword || passwordMismatch) return;
    setError("");
    setLoading(true);
    try {
      // El backend necesita el mismo código OTP que se verificó en paso 2
      await authService.resetPassword(email, otp.join(""), newPassword);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: Email ─────────────────────────────────────────────
  if (step === "email") return (
    <Card>
      <BackHeader onBack={() => navigate(ROUTES.LOGIN)} />
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Recuperar Contraseña</h1>
      <p className="text-[#475569] text-xs mb-6">
        Ingresa tu correo electrónico y te enviaremos un código de verificación.
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

  // ── Step 3: Nueva contraseña ──────────────────────────────────
  return (
    <Card>
      <BackHeader onBack={() => setStep("otp")} />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Nueva Contraseña</h1>
      <p className="text-[#475569] text-xs mb-6">Crea una contraseña segura para tu cuenta.</p>
      <Form
        noBorder
        textButton={loading ? "Guardando..." : "Continuar"}
        submitClasses="w-full h-[48px] text-base"
        onSubmit={handleResetPassword}
        error={passwordMismatch ? "Las contraseñas no coinciden." : error || undefined}
        fields={[
          {
            icon: Lock,
            label: "Digite la nueva clave",
            placeholder: "••••••••",
            type: "password",
            value: newPassword,
            onChange: setNewPassword,
          },
          {
            icon: Lock,
            label: "Repita la clave",
            placeholder: "••••••••",
            type: "password",
            value: confirmPassword,
            onChange: setConfirmPassword,
          },
        ]}
      />

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
            <p className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</p>
            <p className="text-sm text-gray-500 mt-1">Tu contraseña ha sido cambiada con éxito.</p>
          </div>
          <p className="text-xs text-gray-400">Redirigiendo al inicio de sesión...</p>
        </div>
      )}
    </Card>
  );
}
