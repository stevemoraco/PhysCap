import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import ProjectTavakiev from "@/pages/ProjectTavakiev";
import ProjectTabeguache from "@/pages/ProjectTabeguache";
import ProjectVenustas from "@/pages/ProjectVenustas";
import ProjectYadilhil from "@/pages/ProjectYadilhil";
import InnovationGoldenSpike from "@/pages/InnovationGoldenSpike";
import InnovationVitruvius from "@/pages/InnovationVitruvius";
import InnovationTalos from "@/pages/InnovationTalos";
import InnovationStoryEngineering from "@/pages/InnovationStoryEngineering";
import { PersonalizationProvider } from "@/contexts/PersonalizationContext";
import { PersonalizationOnboardingGate } from "@/components/onboarding/PersonalizationOnboardingGate";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
        </>
      )}
      {/* Project pages */}
      <Route path="/project/tavakiev" component={ProjectTavakiev} />
      <Route path="/project/tabeguache" component={ProjectTabeguache} />
      <Route path="/project/venustas" component={ProjectVenustas} />
      <Route path="/project/yadilhil" component={ProjectYadilhil} />

      {/* Innovation pages */}
      <Route path="/innovation/golden-spike" component={InnovationGoldenSpike} />
      <Route path="/innovation/vitruvius" component={InnovationVitruvius} />
      <Route path="/innovation/talos" component={InnovationTalos} />
      <Route path="/innovation/story-engineering" component={InnovationStoryEngineering} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PersonalizationProvider>
            <Toaster />
            <Router />
            <PersonalizationOnboardingGate />
          </PersonalizationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
