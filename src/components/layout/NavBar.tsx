import { CircleArrowRight, DoorOpen } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Logo } from "../ui";
import { ROUTES } from "../../constants";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const handleNavClick = (sectionId: string) => {
    if (isHome) {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav className="fixed w-full text-white bg-[#0c111c]/70 backdrop-blur-md border-b border-white/10 z-50">
      <div className="navbar max-w-7xl mx-auto px-2">
        <div className="navbar-start">
          <Logo classes="flex items-end gap-2 text-white" />
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal font-medium px-1">
            <li>
              <button onClick={() => handleNavClick("Inicio")}>Inicio</button>
            </li>
            <li>
              <button onClick={() => handleNavClick("Mapa")}>Mapa</button>
            </li>
            <li>
              <button onClick={() => handleNavClick("Objetivos")}>
                Objetivos
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick("Contactanos")}>
                Contacto
              </button>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <Link to={ROUTES.LOGIN}>
            <Button
              variant_classes="btn-primary"
              text="Ingresar"
              icon={CircleArrowRight}
            />
          </Link>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a href="#Inicio">Inicio</a>
              </li>
              <li>
                <a href="#Mapa">Mapa</a>
              </li>
              <li>
                <a href="#Objetivos">Objetivos</a>
              </li>
              <li>
                <a href="#Contactanos">Contacto</a>
              </li>

              <li>
                <Button
                  variant_classes="btn-primary"
                  text="Ingresar"
                  icon={DoorOpen}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
