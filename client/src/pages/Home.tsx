import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { Card } from "@/components/ui/card";
import { GoldButton } from "@/components/GoldButton";
import { ProjectTavakiev } from "@/components/ProjectTavakiev";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { InnovationsSection } from "@/components/InnovationsSection";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PageInteraction, UserReport } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { trackPageVisit } = useInteractionTracking(user?.id);
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cleanup = trackPageVisit('/');
    return cleanup;
  }, [trackPageVisit]);

  // Fetch user's recent interactions
  const { data: interactions } = useQuery<PageInteraction[]>({
    queryKey: ['/api/interactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/interactions/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch interactions');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch user's latest report
  const { data: latestReport } = useQuery<UserReport | null>({
    queryKey: ['/api/reports/latest', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/reports/latest/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/reports/generate', {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Report Generated!",
        description: "Your personalized investment report has been created and sent to your email.",
      });
      setGeneratingReport(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      setGeneratingReport(false);
    },
  });

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    generateReportMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24">
        {/* Welcome Section */}
        <section className="py-12 bg-gradient-to-b from-card/20 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="font-serif text-4xl md:text-5xl font-bold">
                Welcome back, <span className="text-primary">{user?.firstName || 'Investor'}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore our revolutionary infrastructure projects and discover personalized investment opportunities
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
              <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/10 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Your Activity</h3>
                    <p className="text-2xl font-bold text-primary">
                      {interactions?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Interactions tracked</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/10 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Reports</h3>
                    <p className="text-2xl font-bold text-primary">
                      {latestReport ? '1' : '0'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestReport ? 'Latest report ready' : 'No reports yet'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/10 hover-elevate">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">AI Analysis</h3>
                  <GoldButton
                    onClick={handleGenerateReport}
                    className="w-full"
                    icon="sparkle"
                    size="default"
                  >
                    {generatingReport ? 'Generating...' : 'Generate Report'}
                  </GoldButton>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-16" id="projects">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
              Explore Our <span className="text-primary">Projects</span>
            </h2>
            
            <div className="space-y-16">
              <ProjectTavakiev />
              
              <div className="pt-8">
                <h3 className="font-serif text-2xl font-bold text-center mb-8 text-foreground">
                  Additional Ventures
                </h3>
                <ProjectShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Innovations */}
        <InnovationsSection />

        {/* CTA for Report */}
        {!latestReport && (
          <section className="py-16 bg-gradient-to-b from-card/20 to-transparent">
            <div className="container mx-auto px-4 text-center">
              <Card className="max-w-2xl mx-auto p-8 bg-card/80 backdrop-blur-sm border-primary/20">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                  Get Your Personalized Investment Report
                </h3>
                <p className="text-muted-foreground mb-6">
                  Based on your expertise and interactions, we'll create a customized analysis 
                  matching you with the most relevant projects.
                </p>
                <GoldButton
                  onClick={handleGenerateReport}
                  size="lg"
                  icon="sparkle"
                >
                  {generatingReport ? 'Generating Report...' : 'Generate My Report'}
                </GoldButton>
              </Card>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-primary/10 py-12 bg-card/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Physical.Capital. Building tomorrow's infrastructure, today.
          </p>
        </div>
      </footer>
    </div>
  );
}
