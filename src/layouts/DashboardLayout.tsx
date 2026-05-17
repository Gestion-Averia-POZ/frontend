import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import UserHeader from "../components/layout/UserHeader";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-end items-center px-6 py-3 shrink-0">
          <UserHeader />
        </header>
        <main ref={mainRef} className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
