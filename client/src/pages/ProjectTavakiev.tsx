import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { SolarManufacturing3D } from "@/components/SolarManufacturing3D";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NarrativeTimeline } from "@/components/tavakiev/NarrativeTimeline";
import { FinancialStack } from "@/components/tavakiev/FinancialStack";
import { RiskNavigator } from "@/components/tavakiev/RiskNavigator";
import { TeamProfiles, type TeamMember } from "@/components/experiences/TeamProfiles";
import { Zap, DollarSign, Factory, TrendingUp, Share2, ArrowLeft, Target, Cog, Shield } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SocialShare } from "@/components/SocialShare";
import { useTavakievSources } from "@/hooks/useTavakievSources";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

export default function ProjectTavakiev() {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { data: tavakievSections } = useTavakievSources();
  const { profile, getPersonalizedText } = usePersonalization();
  const persona = profile?.personaSegments?.[0];
  const { trackCTA } = useInteractionTracking(user?.id);

  const timelineSection = tavakievSections?.find(
    (section) => section.slug.includes("timeline") || section.data?.timeline?.length,
  );
  const financialSection = tavakievSections?.find(
    (section) => section.slug.includes("financial") || section.data?.financials?.length,
  );
  const riskSection = tavakievSections?.find(
    (section) => section.slug.includes("risk") || section.data?.risks?.length,
  );

  const timelineEntries = timelineSection?.data?.timeline ?? [];
  const financialEntries = financialSection?.data?.financials ?? [];
  const riskEntries = riskSection?.data?.risks ?? [];

  const teamMembers: TeamMember[] = [
    {
      id: "jigar-shah",
      name: "Jigar Shah",
      title: "Former Director, DOE Loan Programs Office",
      role: "Advisor",
      bio: "Led $40B+ loan portfolio at DOE, including major solar manufacturing investments. Previously founded SunEdison and pioneered solar PPAs.",
      expertise: ["Project Finance", "Solar Energy", "DOE Loan Programs", "Policy"],
      achievements: [
        "Deployed $40B in clean energy loans at DOE",
        "Founded SunEdison, first solar PPA company"
      ],
      linkedinUrl: "https://linkedin.com/in/jigarkumar-shah",
    },
    {
      id: "casey-handmer",
      name: "Dr. Casey Handmer",
      title: "Founder, Terraform Industries",
      role: "Advisor",
      bio: "Astrophysicist and synthetic fuel pioneer. Expert in large-scale industrial automation and process optimization. Former JPL scientist.",
      expertise: ["Industrial Process", "Automation", "Carbon Capture", "Manufacturing"],
      achievements: [
        "Developing carbon-negative synthetic fuel at Terraform",
        "Published research on mega-scale solar deployment"
      ],
      linkedinUrl: "https://linkedin.com/in/caseyhandmer",
    },
    {
      id: "perry-sanders",
      name: "Perry Sanders",
      title: "Former CEO, Borrego Solar",
      role: "Advisor",
      bio: "30+ years in solar industry. Built Borrego Solar into one of largest commercial solar developers. Deep expertise in EPC and O&M.",
      expertise: ["Solar Development", "EPC", "Operations", "Commercial Solar"],
      achievements: [
        "Deployed 1+ GW of commercial solar projects",
        "Pioneered solar + storage hybrid systems"
      ],
      linkedinUrl: "https://linkedin.com/in/perrysanders",
    },
    {
      id: "mike-koralewski",
      name: "Mike Koralewski",
      title: "Former VP, First Solar Manufacturing",
      role: "Executive",
      bio: "Led manufacturing operations for largest US solar panel producer. Expert in thin-film and crystalline silicon production at gigawatt scale.",
      expertise: ["Solar Manufacturing", "Cleanroom Operations", "Quality Control", "Automation"],
      achievements: [
        "Scaled First Solar to 8 GW annual production",
        "Implemented Six Sigma across global facilities"
      ],
    },
    {
      id: "sarah-chen",
      name: "Dr. Sarah Chen",
      title: "Process Engineer, Former Intel",
      role: "Executive",
      bio: "Semiconductor manufacturing veteran with 15 years at Intel. Specializes in high-purity silicon processes and yield optimization.",
      expertise: ["Semiconductor Processes", "Yield Optimization", "Silicon Purification", "Cleanroom Design"],
      achievements: [
        "Led 7nm process development at Intel",
        "42 patents in silicon manufacturing"
      ],
    },
    {
      id: "raj-patel",
      name: "Raj Patel",
      title: "CFO & Head of Tax Strategy",
      role: "Executive",
      bio: "Former Big 4 tax partner specializing in IRA credits. Structured $2B+ in renewable energy tax equity deals.",
      expertise: ["Tax Credits", "IRA Section 45X", "Project Finance", "Tax Equity"],
      achievements: [
        "Structured tax equity for 5 GW of solar projects",
        "Published IRS guidance interpretations"
      ],
    },
  ];

  const handleInteraction = (type: string, context: any) => {
    console.log("Interaction:", type, context);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Project Tavakiev</h1>
              <p className="text-xl text-muted-foreground">2 GW Autonomous Solar Gigafactory</p>
              {persona && (
                <Badge variant="outline" className="mt-2 border-primary/30 text-primary">
                  Persona Focus: {persona}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <GoldButton variant="outline" onClick={() => setShowShare(true)} data-testid="button-share-project">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </GoldButton>
              <GoldButton
                onClick={() => {
                  trackCTA({
                    label: "Provide Feedback",
                    section: "project_tavakiev",
                    projectId: "tavakiev",
                  });
                  setShowFeedback(true);
                }}
                data-testid="button-provide-feedback"
              >
                Provide Feedback
              </GoldButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Solar Manufacturing</Badge>
            <Badge variant="secondary">2 GW Capacity</Badge>
            <Badge variant="secondary">IRA Tax Credits</Badge>
            <Badge variant="secondary">Autonomous Production</Badge>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <Target className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="technology" className="gap-2" data-testid="tab-technology">
              <Cog className="w-4 h-4" />
              Technology
            </TabsTrigger>
            <TabsTrigger value="financials" className="gap-2" data-testid="tab-financials">
              <DollarSign className="w-4 h-4" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2" data-testid="tab-timeline">
              <TrendingUp className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-2" data-testid="tab-risks">
              <Shield className="w-4 h-4" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
              Team
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3D Factory Visualization</h2>
                <div className="h-96 rounded-lg overflow-hidden border border-primary/20">
                  <SolarManufacturing3D className="w-full h-full" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Interactive 3D model of the autonomous solar panel manufacturing facility. Click on panels and robots to explore.
                </p>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Project Overview
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {getPersonalizedText(
                      "project.tavakiev.overview",
                      "Project Tavakiev represents a revolutionary approach to solar panel manufacturing through unprecedented integration of IRA tax credit stacking, achieving 100x cost reduction in solar production.",
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">2 GW</div>
                      <div className="text-sm text-muted-foreground">Annual Capacity</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">100x</div>
                      <div className="text-sm text-muted-foreground">Cost Reduction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">95%</div>
                      <div className="text-sm text-muted-foreground">Automation</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$850M</div>
                      <div className="text-sm text-muted-foreground">Annual Tax Credits</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Financial Highlights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturing Tax Credit (45X)</span>
                      <span className="font-semibold">$420M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment Tax Credit (48C)</span>
                      <span className="font-semibold">$185M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energy Community Bonus</span>
                      <span className="font-semibold">$95M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domestic Content Bonus</span>
                      <span className="font-semibold">$150M</span>
                    </div>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-foreground">Total Tax Credits</span>
                      <span className="text-primary">$850M</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <Factory className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Advanced Manufacturing</h3>
                <p className="text-sm text-muted-foreground">
                  Cutting-edge robotic assembly lines with AI-powered quality control
                </p>
              </Card>

              <Card className="p-6">
                <TrendingUp className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold mb-2">Scalable Production</h3>
                <p className="text-sm text-muted-foreground">
                  Modular design enables rapid expansion to 10 GW+ capacity
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">High Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  24.5% efficiency panels with advanced cell technology
                </p>
              </Card>

              <Card className="p-6">
                <DollarSign className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold mb-2">Cost Leadership</h3>
                <p className="text-sm text-muted-foreground">
                  Sub-$0.10/watt production cost through tax credit optimization
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="technology">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Production Capacity</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 2 GW annual solar panel output</li>
                    <li>• 5 million panels per year</li>
                    <li>• 24/7 autonomous operation</li>
                    <li>• 400W average panel power</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Technology Stack</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• PERC+ solar cell technology</li>
                    <li>• Automated optical inspection</li>
                    <li>• AI-driven yield optimization</li>
                    <li>• Robotic material handling</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Facility Details</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 500,000 sq ft manufacturing space</li>
                    <li>• ISO Class 6 cleanroom environment</li>
                    <li>• 50 MW dedicated power supply</li>
                    <li>• Zero-emission operations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Automation</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Talos humanoid robot integration</li>
                    <li>• Vision-guided assembly systems</li>
                    <li>• Real-time process monitoring</li>
                    <li>• Predictive maintenance AI</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-4">
            {financialSection?.summary && (
              <p className="text-sm text-muted-foreground">
                {financialSection.summary}
              </p>
            )}
            <FinancialStack entries={financialEntries} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {timelineSection?.summary && (
              <p className="text-sm text-muted-foreground">
                {timelineSection.summary}
              </p>
            )}
            <NarrativeTimeline
              entries={timelineEntries}
              onCtaClick={() => setShowFeedback(true)}
            />
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-4">
            {riskSection?.summary && (
              <p className="text-sm text-muted-foreground">
                {riskSection.summary}
              </p>
            )}
            <RiskNavigator
              risks={riskEntries}
              onSelectRisk={() => setShowFeedback(true)}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamProfiles
              members={teamMembers}
              onInteraction={handleInteraction}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Interested in learning more about Project Tavakiev?
          </p>
          <GoldButton
            onClick={() => {
              trackCTA({
                label: "Get Involved",
                section: "project_tavakiev",
                projectId: "tavakiev",
              });
              setShowFeedback(true);
            }}
            data-testid="button-get-involved"
          >
            Get Involved
          </GoldButton>
        </div>
      </div>

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        projectId="tavakiev"
        projectName="Project Tavakiev"
      />

      {showShare && (
        <SocialShare
          title="Project Tavakiev"
          description="2 GW autonomous solar gigafactory achieving 100x cost reduction through IRA tax credit stacking"
          projectId="tavakiev"
        />
      )}
    </div>
  );
}
