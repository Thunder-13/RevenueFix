// start the app always with '/' route
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";
import { ProtectedRoute } from "./components/auth/route-components";
import { AppLayout } from "./components/layout/Layout";
import "./index.css";

// Pages
import Index from "./pages";
import LoginForm from "./pages/login";
import SignupForm from "./pages/signup";
import Logout from "./pages/logout";
import Dashboard from "./pages/dashboard";
import NetworkBilling from "./pages/network-billing";
import MediationBilling from "./pages/mediation-billing";
import CrmBilling from "./pages/crm-billing";
import B2BAnalysis from "./pages/b2b-analysis";
import B2CAnalysis from "./pages/b2c-analysis";
import FixedLine from "./pages/fixed-line";
import CrmInsights from "./pages/crm-insights";
import AlarmManagement from "./pages/alarm-management";
import UserManagement from "./pages/user-management";
import CaseManagement from "./pages/case-management";
import UpcomingFeatures from "./pages/upcoming-features";
import Settings from "./pages/settings";
import Voice from "@/pages/voice";
import SMS from "@/pages/sms";
import Data from "@/pages/data";

const queryClient = new QueryClient();

// Wrap protected components with AppLayout
const ProtectedComponent = ({ Component }: { Component: () => JSX.Element }) => {
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Index />} />
              <Route path='/login' element={<LoginForm />} />
              <Route path='/signup' element={<SignupForm />} />
              <Route path='/logout' element={<Logout />} />
              <Route path='/dashboard' element={<ProtectedRoute Component={() => <ProtectedComponent Component={Dashboard} />} />} />
              <Route path='/network-billing' element={<ProtectedRoute Component={() => <ProtectedComponent Component={NetworkBilling} />} />} />
              <Route path='/mediation-billing' element={<ProtectedRoute Component={() => <ProtectedComponent Component={MediationBilling} />} />} />
              <Route path='/crm-billing' element={<ProtectedRoute Component={() => <ProtectedComponent Component={CrmBilling} />} />} />
              <Route path='/b2b-analysis' element={<ProtectedRoute Component={() => <ProtectedComponent Component={B2BAnalysis} />} />} />
              <Route path='/b2c-analysis' element={<ProtectedRoute Component={() => <ProtectedComponent Component={B2CAnalysis} />} />} />
              <Route path='/fixed-line' element={<ProtectedRoute Component={() => <ProtectedComponent Component={FixedLine} />} />} />
              <Route path='/voice' element={<ProtectedRoute Component={() => <ProtectedComponent Component={Voice} />} />} />
              <Route path='/sms' element={<ProtectedRoute Component={() => <ProtectedComponent Component={SMS} />} />} />
              <Route path='/data' element={<ProtectedRoute Component={() => <ProtectedComponent Component={Data} />} />} />
              <Route path='/crm-insights' element={<ProtectedRoute Component={() => <ProtectedComponent Component={CrmInsights} />} />} />
              <Route path='/alarm-management' element={<ProtectedRoute Component={() => <ProtectedComponent Component={AlarmManagement} />} />} />
              <Route path='/user-management' element={<ProtectedRoute Component={() => <ProtectedComponent Component={UserManagement} />} />} />
              <Route path='/case-management' element={<ProtectedRoute Component={() => <ProtectedComponent Component={CaseManagement} />} />} />
              <Route path='/upcoming-features' element={<ProtectedRoute Component={() => <ProtectedComponent Component={UpcomingFeatures} />} />} />
              <Route path='/settings' element={<ProtectedRoute Component={() => <ProtectedComponent Component={Settings} />} />} />
            </Routes>
          </BrowserRouter>
          <Sonner />
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);