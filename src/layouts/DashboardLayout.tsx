import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import UserHeader from "../components/layout/UserHeader";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-end items-center px-6 py-3 shrink-0">
          <UserHeader />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
