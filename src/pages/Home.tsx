import Button from "../components/Button";
import Card from "../components/Card";
import Footer from "../components/Footer";
import Form from "../components/Form";
import NavBar from "../components/NavBar";
// Iconos de lucide-react

import {
  ChartNoAxesCombined,
  Check,
  Earth,
  Eye,
  FilePenLine,
  SearchCheck,
  Send,
  Sparkles,
  Users,
  Mail,
  TextAlignStart,
  MessageSquareMore,
  ChartColumnIncreasing,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <NavBar />
      <section id="Inicio">
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: "url(/src/assets/images/Home-CD-Guayana.webp)",
          }}
        >
          {/* Hero section */}

          <div className="hero-overlay"></div>
          <div className="hero-content mt-15 text-neutral-content text-center">
            <div className="max-w-2xl">
              <h1 className="mb-5 text-6xl font-bold">
                Reporte de Averías de Servicios Básicos
              </h1>
              <p className="mb-5">
                Optimización de agua, electricidad y gestión de residuos en
                tiempo real para una ciudad más inteligente
              </p>
              <div className="flex justify-center">
                <Button
                  variant_classes="btn-primary mr-8  lg:btn-lg xl:btn-xl"
                  text="Comenzar Ahora"
                  icon={Send}
                />
                <Button
                  variant_classes="bg-white/10 backdrop-blur-md border-white/60 text-white font-bold  lg:btn-lg xl:btn-xl"
                  text="Ver Estadísticas"
                  icon={ChartColumnIncreasing}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <div className="bg-blue-500 h-[480px] w-[904px] text-white p-4 mt-12"></div>
          <div className="mt-12 w-[360px]">
            {/* Define un ancho explícito aquí */}
            <div className="bg-[#E2E8F0] w-full mb-4 p-4">Leyenda 1</div>{" "}
            {/* Añade márgenes y padding */}
            <div className="bg-[#E2E8F0] w-full mb-4 p-4">Leyenda 2</div>
            <div className="bg-[#E2E8F0] w-full p-4">Leyenda 3</div>
          </div>
        </div>
      </section>

      <section id="Objetivos" className="w-full h-[690px] mt-25 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-2 h-full  flex flex-col justify-center ">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Nuestros Objetivos</h2>
            <p className="font-normal mt-4">
              Trabajamos para transformar la gestión de servicios públicos
              mediante la tecnología y la participación ciudadana.
            </p>
          </div>

          {/* Aqui van las cards */}

          <div className="flex justify-center gap-x-10 mt-15">
            <Card
              title="Transparencia"
              description="Impulsamos la rendición de cuentas
mediante datos abiertos, permitiendo a
los ciudadanos auditar el tiempo de
respuesta."
              icon={Eye}
              extraClasses="w-[384px]"
            />
            <Card
              title="Centralización"
              description="Unificamos la gestión de agua, luz y aseo
en una sola plataforma para agilizar la
coordinación interdepartamental."
              icon={Earth}
              extraClasses="w-[384px]"
            />
            <Card
              title="Optimización"
              description="Utilizamos analítica predictiva para
identificar fallas recurrentes y optimizar el
mantenimiento preventivo del servicio."
              icon={ChartNoAxesCombined}
              extraClasses="w-[384px]"
            />
          </div>
        </div>
      </section>

      <section id="CalltoAction" className="max-w-7xl mx-auto px-2 mt-25">
        <div className="text-center">
          <h2 className="text-4xl font-bold">¿Listo para reportar?</h2>
          <h3 className="font-normal mt-4">
            Únete a miles de ciudadanos que ya están ayudando a mejorar los
            servicios básicos en sus comunidades.
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6 justify-items-center mt-15">
          <Card
            title="Crear Reportes"
            description="Documenta cualquier avería que encuentres"
            icon={FilePenLine}
            extraClasses="w-[500px]"
          />
          <Card
            title="Seguimiento"
            description="Monitorea el estado de tus reportes en tiempo real"
            icon={SearchCheck}
            extraClasses="w-[500px]"
          />
          <Card
            title="Comunidad"
            description="Sé parte de la solución para mejorar los servicios"
            icon={Users}
            extraClasses="w-[500px]"
          />
          <Card
            title="Impacto"
            description="Contribuye a la transparencia y mejora continua"
            icon={Sparkles}
            extraClasses="w-[500px]"
          />
        </div>

        <div className="text-center mt-12">
          <Button
            text="Comenzar ahora"
            variant_classes="btn-primary w-[300px] h-[60px] text-xl"
            icon={Send}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <Check className="mr-2" />
          <h4 className="text-center font-normal text-[#64748B]">
            Tu opinión es importante para nosotros. Forma parte de la solución
            ahora mismo.
          </h4>
        </div>
      </section>

      <section id="Contáctanos" className="max-w-7xl mx-auto px-2 mt-30">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Contáctanos</h2>
          <small className="font-normal text-lg mt-4 text-[#475569]">
            Si tienes alguna duda, estamos aquí para escucharte.
          </small>
        </div>
        <div className="flex justify-center">
          <Form
            submitIcon={Send}
            fields={[
              { icon: Mail, label: "Correo", placeholder: "tu@correo.com" },
              {
                icon: TextAlignStart,
                label: "Asunto",
                placeholder: "¿En qué asunto podemos ayudarte?",
              },
              {
                icon: MessageSquareMore,
                label: "Mensaje",
                placeholder: "Escribe aquí tu mensaje",
              },
            ]}
            classes="w-[664px] h-[487px] mt-15 bg-white mb-20"
          />
        </div>
      </section>
      <Footer />
    </>
  );
}
