import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/GoldButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Mail, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SEOHead } from "@/components/SEOHead";
import type { User, Feedback, PageInteraction, UserReport } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ['/api/feedback', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/feedback/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: latestReport, isLoading: reportLoading } = useQuery<UserReport | null>({
    queryKey: ['/api/reports/latest', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/reports/latest/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: interactions, isLoading: interactionsLoading} = useQuery<PageInteraction[]>({
    queryKey: ['/api/interactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/interactions/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch interactions');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/reports/generate', {});
    },
    onSuccess: () => {
      toast({
        title: "Report Generated Successfully",
        description: "Your personalized investment report has been sent to your email!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/latest'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Report Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Investor';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Dashboard - Physical.Capital"
        description="Your personalized investment dashboard with AI-powered insights and project recommendations."
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2" data-testid="text-welcome">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your project interests and receive AI-powered investment insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-feedback-count">
                {feedbackLoading ? '...' : feedback?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Projects you've reviewed
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-views-count">
                {interactionsLoading ? '...' : interactions?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total interactions tracked
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Reports</CardTitle>
              <Mail className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-reports-count">
                {reportLoading ? '...' : latestReport ? '1' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Personalized insights sent
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Investment Report
              </CardTitle>
              <CardDescription>
                Generate a personalized analysis based on your interests and expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {latestReport && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Latest Report Generated</p>
                      <Badge variant="default" className="bg-accent">
                        {latestReport.emailSent ? 'Email Sent' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {latestReport.createdAt && formatDistanceToNow(new Date(latestReport.createdAt), { addSuffix: true })}
                    </p>
                    {latestReport.recommendedProjects && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Recommended Projects:</p>
                        <div className="flex gap-2 flex-wrap">
                          {latestReport.recommendedProjects.map((project: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <GoldButton 
                  onClick={() => generateReportMutation.mutate()}
                  disabled={generateReportMutation.isPending || !feedback || feedback.length === 0}
                  icon="sparkle"
                  data-testid="button-generate-report"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    latestReport ? 'Generate New Report' : 'Generate Your First Report'
                  )}
                </GoldButton>
                {(!feedback || feedback.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    Submit feedback on projects to generate your personalized report
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback History</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-4">
            {feedbackLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !feedback || feedback.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Explore projects and share your insights to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              feedback.map((item: any) => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-feedback-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {item.projectId.replace(/-/g, ' ')}
                      </CardTitle>
                      <Badge variant="outline">
                        {item.expertise || 'General Interest'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{item.feedbackText}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {interactionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !interactions || interactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No activity logged yet</p>
                </CardContent>
              </Card>
            ) : (
              interactions.slice(0, 20).map((item: any) => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-activity-${item.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.interactionType}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.pagePath} {item.sectionId && `• ${item.sectionId}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                        {item.duration && (
                          <p className="text-xs text-muted-foreground">{item.duration}s</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
