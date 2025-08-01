import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import PartnerOnboarding from "@/pages/partner-onboarding";
import PartnerDashboard from "@/pages/partner-dashboard";
import PartnerSettings from "@/pages/partner-settings";
import FloatingChat from "@/components/floating-chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/partner-dashboard" component={PartnerDashboard} />
      <Route path="/partner-settings" component={PartnerSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <FloatingChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
