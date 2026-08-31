import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MeetingNotification from "@/components/MeetingNotification";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MeetingNotification />
      <main className="container py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
