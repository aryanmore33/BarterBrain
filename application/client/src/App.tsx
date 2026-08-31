import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import MainLayout from "@/layouts/MainLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AddSkillPage from "./pages/AddSkillPage";
import ExplorePage from "./pages/ExplorePage";
import RequestsPage from "./pages/RequestsPage";
import CreditsPage from "./pages/CreditsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import ChatPage from "./pages/ChatPage";
import MeetingPage from "./pages/MeetingPage";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/add-skill" element={<AddSkillPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/connections/:barterId" element={<ChatPage />} />
                <Route path="/credits" element={<CreditsPage />} />
              </Route>
              <Route path="/connections/:barterId/call" element={<MeetingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </ChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
