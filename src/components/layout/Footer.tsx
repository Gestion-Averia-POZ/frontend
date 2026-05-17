export default function Footer() {
  return (
    <footer className="w-full bg-footer text-base-content">
      <div className="max-w-7xl mx-auto footer footer-secondary-color sm:footer-horizontal p-10">
        <aside>
          <div className="flex items-end">
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

            <h3 className="footer-title m-0 ml-3 ">Urbis</h3>
          </div>

          <p className="w-92  footer-link">
            Sistema integral para reportar y gestionar averías en servicios
            básicos con transparencia y eficiencia.
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">Enlaces rápido</h6>
          <a href="#Inicio" className="link  footer-link">
            Inicio
          </a>
          <a href="#Mapa" className="link  footer-link">
            Mapa
          </a>
          <a href="#Objetivos" className="link  footer-link">
            Objetivos
          </a>
          <a href="#Contactanos" className="link  footer-link">
            Contacto
          </a>
        </nav>
        <nav>
          <h6 className="footer-title">Contáctanos</h6>
          <a className="link footer-link">info@reportes.es</a>
        </nav>

        <div className="footer-secondary-color">
          <div className="mb-2">
            <small>© 2026 Urbis. Todos los derechos reservados.</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
