import "../styles/navbar.css";
import Button from "./Button";

export default function Navbar() {
  return (
    <div className="navbar max-w-7xl mx-auto px-2 bg-base-200">
      <div className="navbar-start">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="36" height="36" rx="8" fill="#2563EB" />
          <path
            d="M22.0444 9.54545H25.7347V20.8807C25.7347 22.1534 25.4307 23.267 24.8228 24.2216C24.2205 25.1761 23.3768 25.9205 22.2915 26.4545C21.2063 26.983 19.9421 27.2472 18.4989 27.2472C17.0501 27.2472 15.783 26.983 14.6978 26.4545C13.6126 25.9205 12.7688 25.1761 12.1665 24.2216C11.5643 23.267 11.2631 22.1534 11.2631 20.8807V9.54545H14.9535V20.5653C14.9535 21.2301 15.0984 21.821 15.3881 22.3381C15.6836 22.8551 16.0984 23.2614 16.6324 23.5568C17.1665 23.8523 17.7887 24 18.4989 24C19.2148 24 19.837 23.8523 20.3654 23.5568C20.8995 23.2614 21.3114 22.8551 21.6012 22.3381C21.8966 21.821 22.0444 21.2301 22.0444 20.5653V9.54545Z"
            fill="white"
          />
        </svg>
        <h3 className="text-lg font-semibold m-0 ml-2">Urbis</h3>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal font-medium px-1">
          <li>
            <a>Inicio</a>
          </li>
          <li>
            <a href="#Mapa">Mapa</a>
          </li>
          <li>
            <a>Objetivos</a>
          </li>
          <li>
            <a>Contacto</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <Button variant_classes="btn-primary" text="Ingresar" />

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
              <a>Inicio</a>
            </li>
            <li>
              <a href="#Mapa">Mapa</a>
            </li>
            <li>
              <a>Objetivos</a>
            </li>
            <li>
              <a>Contacto</a>
            </li>
            <li>
              <Button variant_classes="btn-primary" text="Ingresar" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
