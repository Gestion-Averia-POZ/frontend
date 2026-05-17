import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-[#2563EB]">404</h1>
      <p className="text-xl text-[#475569]">Página no encontrada</p>
      <Link to={ROUTES.HOME} className="text-[#2563EB] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
