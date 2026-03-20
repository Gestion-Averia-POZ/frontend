import Button from "../components/Button";
import Card from "../components/Card";
import Footer from "../components/Footer";
import Form from "../components/Form";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: "url(/src/assets/images/Home-CD-Guayana.webp)",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-2xl">
            <h1 className="mb-5 text-6xl font-bold">
              Reporte de Averías de Servicios Básicos
            </h1>
            <p className="mb-5">
              Optimización de agua, electricidad y gestión de residuos en tiempo
              real para una ciudad más inteligente
            </p>
            <div className="flex justify-center">
              <Button
                variant_classes="btn-primary mr-8  lg:btn-lg xl:btn-xl"
                text="Comenzar Ahora"
              />
              <Button
                variant_classes="bg-white/10 backdrop-blur-md border-white/60 text-white font-bold  lg:btn-lg xl:btn-xl"
                text="Ver Estadísticas"
              />
            </div>
          </div>
        </div>
      </div>

      <section id="Mapa" className="max-w-7xl mx-auto px-2 mt-25">
        <div>
          <h2 className="text-4xl font-bold">
            Mapa de Incidencias en Tiempo Real
          </h2>
          <h3 className="font-normal mt-4">
            Monitoreo activo de la red de servicios básicos urbanos
          </h3>
        </div>

        {/* Aqui deberia ir el componente Mapa */}
        <div className="flex gap-x-[40px]">
          <div className="bg-red-500 h-[480px] w-[904px] text-white p-4 mt-12"></div>
          <div className="mt-12 w-[360px]">
            {/* Define un ancho explícito aquí */}
            <div className="bg-[#E2E8F0] w-full mb-4 p-4">Leyenda 1</div>{" "}
            {/* Añade márgenes y padding */}
            <div className="bg-[#E2E8F0] w-full mb-4 p-4">Leyenda 2</div>
            <div className="bg-[#E2E8F0] w-full p-4">Leyenda 3</div>
          </div>
        </div>
      </section>

      <section
        id="Objetivos"
        className="max-w-7xl mx-auto px-2 mt-25 bg-[#F1F5F9]"
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold">Nuestros Objetivos</h2>
          <p className="font-normal mt-4">
            Trabajamos para transformar la gestión de servicios públicos
            mediante la tecnología y la participación ciudadana.
          </p>
        </div>

        {/* Aqui van las cards */}

        <Card />
        <Card />
        <Card />
      </section>

      <Form />
      <Footer />
    </>
  );
}
