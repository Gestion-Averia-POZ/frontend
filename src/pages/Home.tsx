import Button from "../components/Button";
import Card from "../components/Card";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <section id="Hero-image">
        <h1>Bienvenido a nuestra página</h1>
        <p>Esta es una sección de contenido principal.</p>
        <Button />
      </section>
      <Card />
      <Footer />
    </>
  );
}
