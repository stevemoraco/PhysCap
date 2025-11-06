import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Search, Shield, TrendingDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'Policy' | 'Technology' | 'Supply Chain' | 'Market' | 'Financial' | 'Operational';
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
  status: 'Active' | 'Mitigated' | 'Monitoring';
}

interface RiskNavigatorProps {
  risks: Risk[];
  onInteraction?: (type: string, context: any) => void;
}

const likelihoodValues = { Low: 1, Medium: 2, High: 3 };
const impactValues = { Low: 1, Medium: 2, High: 3 };

export function RiskNavigator({ risks, onInteraction }: RiskNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(risks.map((r) => r.category)))];

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || risk.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRiskColor = (likelihood: string, impact: string) => {
    const score = likelihoodValues[likelihood as keyof typeof likelihoodValues] *
                  impactValues[impact as keyof typeof impactValues];
    if (score >= 7) return 'bg-red-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = (likelihood: string, impact: string) => {
    const score = likelihoodValues[likelihood as keyof typeof likelihoodValues] *
                  impactValues[impact as keyof typeof impactValues];
    if (score >= 7) return 'Critical';
    if (score >= 4) return 'Moderate';
    return 'Low';
  };

  const handleRiskClick = (risk: Risk) => {
    setSelectedRisk(selectedRisk === risk.id ? null : risk.id);
    onInteraction?.('risk_card_click', {
      riskId: risk.id,
      category: risk.category,
      level: getRiskLevel(risk.likelihood, risk.impact),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Risk Assessment Matrix
          </h3>
          <p className="text-muted-foreground mt-1">
            Comprehensive risk analysis and mitigation strategies
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="risk-search-input"
          />
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize"
              data-testid={`risk-category-${category}`}
            >
              {category}
              {category !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {risks.filter((r) => r.category === category).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Risk heatmap visualization */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Risk Heatmap: Likelihood × Impact</h4>
        <div className="grid grid-cols-4 gap-2">
          {/* Header row */}
          <div></div>
          <div className="text-center text-xs font-medium text-muted-foreground">Low Impact</div>
          <div className="text-center text-xs font-medium text-muted-foreground">Medium Impact</div>
          <div className="text-center text-xs font-medium text-muted-foreground">High Impact</div>

          {/* High likelihood row */}
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-end pr-2">
            High Likelihood
          </div>
          {['Low', 'Medium', 'High'].map((impact) => {
            const count = filteredRisks.filter(
              (r) => r.likelihood === 'High' && r.impact === impact
            ).length;
            return (
              <div
                key={impact}
                className={`h-20 rounded flex items-center justify-center text-white font-bold text-lg ${getRiskColor(
                  'High',
                  impact
                )} ${count === 0 ? 'opacity-30' : 'opacity-90 hover:opacity-100 cursor-pointer'} transition-opacity`}
                onClick={() => {
                  if (count > 0) {
                    onInteraction?.('heatmap_cell_click', { likelihood: 'High', impact });
                  }
                }}
              >
                {count || ''}
              </div>
            );
          })}

          {/* Medium likelihood row */}
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-end pr-2">
            Medium Likelihood
          </div>
          {['Low', 'Medium', 'High'].map((impact) => {
            const count = filteredRisks.filter(
              (r) => r.likelihood === 'Medium' && r.impact === impact
            ).length;
            return (
              <div
                key={impact}
                className={`h-20 rounded flex items-center justify-center text-white font-bold text-lg ${getRiskColor(
                  'Medium',
                  impact
                )} ${count === 0 ? 'opacity-30' : 'opacity-90 hover:opacity-100 cursor-pointer'} transition-opacity`}
                onClick={() => {
                  if (count > 0) {
                    onInteraction?.('heatmap_cell_click', { likelihood: 'Medium', impact });
                  }
                }}
              >
                {count || ''}
              </div>
            );
          })}

          {/* Low likelihood row */}
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-end pr-2">
            Low Likelihood
          </div>
          {['Low', 'Medium', 'High'].map((impact) => {
            const count = filteredRisks.filter(
              (r) => r.likelihood === 'Low' && r.impact === impact
            ).length;
            return (
              <div
                key={impact}
                className={`h-20 rounded flex items-center justify-center text-white font-bold text-lg ${getRiskColor(
                  'Low',
                  impact
                )} ${count === 0 ? 'opacity-30' : 'opacity-90 hover:opacity-100 cursor-pointer'} transition-opacity`}
                onClick={() => {
                  if (count > 0) {
                    onInteraction?.('heatmap_cell_click', { likelihood: 'Low', impact });
                  }
                }}
              >
                {count || ''}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Risk cards */}
      <div className="grid gap-4">
        {filteredRisks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No risks found matching your criteria.</p>
          </Card>
        ) : (
          filteredRisks.map((risk) => {
            const isSelected = selectedRisk === risk.id;
            const riskLevel = getRiskLevel(risk.likelihood, risk.impact);

            return (
              <Card
                key={risk.id}
                className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 ${
                  isSelected ? 'border-primary shadow-md' : ''
                }`}
                onClick={() => handleRiskClick(risk)}
                data-testid={`risk-card-${risk.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{risk.category}</Badge>
                      <Badge
                        variant={riskLevel === 'Critical' ? 'destructive' : 'secondary'}
                        className={
                          riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' : ''
                        }
                      >
                        {riskLevel}
                      </Badge>
                      <Badge variant="secondary">{risk.status}</Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {risk.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Likelihood</div>
                    <Badge variant="outline" className="mb-2">
                      {risk.likelihood}
                    </Badge>
                    <div className="text-xs text-muted-foreground mb-1">Impact</div>
                    <Badge variant="outline">{risk.impact}</Badge>
                  </div>
                </div>

                {/* Expanded mitigation strategy */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-sm text-foreground mb-2">
                          Mitigation Strategy
                        </h5>
                        <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
