import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Waitlist from "@/pages/waitlist";
import PartnerOnboarding from "@/pages/partner-onboarding";
import PartnerDashboard from "@/pages/partner-dashboard";
import PartnerSettings from "@/pages/partner-settings";
import TermsAndConditions from "@/pages/terms-and-conditions";
import PrivacyPolicy from "@/pages/privacy-policy";
import FloatingChat from "@/components/floating-chat";

// Hide Vite console messages in development
if (import.meta.env.DEV) {
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('[vite]')) {
      return; // Skip Vite messages
    }
    originalLog.apply(console, args);
  };
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/partner-dashboard" component={PartnerDashboard} />
      <Route path="/partner-settings" component={PartnerSettings} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />
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
