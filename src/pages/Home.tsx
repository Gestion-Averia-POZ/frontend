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
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              Reporte de Averías de Servicios Básicos
            </h1>
            <p className="mb-5">
              Optimización de agua, electricidad y gestión de residuos en tiempo
              real para una ciudad más inteligente
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
      <Button />
      <Card />

      <Form />
      <Footer />
    </>
  );
}
