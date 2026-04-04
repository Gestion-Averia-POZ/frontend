import { Outlet } from "react-router-dom";
import { Footer, NavBar } from "../components/layout";

export default function MainLayout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
