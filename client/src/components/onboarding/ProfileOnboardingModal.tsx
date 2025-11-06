import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  company: string;
  profession: string;
  expertiseTags: string[];
  investmentGoals: string[];
  riskAppetite: string;
  preferredInvestmentRange: string;
}

interface ProfileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData?: Partial<ProfileFormData>;
}

const EXPERTISE_OPTIONS = [
  'Solar Energy',
  'Real Estate',
  'Construction',
  'AI/Robotics',
  'Finance',
  'Manufacturing',
  'Policy',
  'Supply Chain',
  'Tax Credits',
  'Clean Tech',
  'Infrastructure',
  'Capital Markets',
];

const INVESTMENT_GOAL_OPTIONS = [
  'Direct Equity Investment',
  'Tax Credit Monetization (Section 45X)',
  'Strategic Partnership',
  'Offtake Agreement',
  'Advisory Role',
  'Real Estate Development',
  'Technology Licensing',
];

const INVESTMENT_RANGES = [
  '$100K - $500K',
  '$500K - $2M',
  '$2M - $10M',
  '$10M+',
];

const RISK_LABELS = ['Conservative', 'Moderate', 'Aggressive'];

const riskLabelToSliderValue = (label?: string): string => {
  switch (label) {
    case 'Conservative':
      return '2';
    case 'Moderate':
      return '5';
    case 'Aggressive':
      return '8';
    default:
      return '5';
  }
};

export function ProfileOnboardingModal({ isOpen, onClose, userId, initialData }: ProfileOnboardingModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    company: initialData?.company ?? '',
    profession: initialData?.profession ?? '',
    expertiseTags: initialData?.expertiseTags ?? [],
    investmentGoals: initialData?.investmentGoals ?? [],
    riskAppetite: initialData?.riskAppetite
      ? riskLabelToSliderValue(initialData.riskAppetite)
      : '5',
    preferredInvestmentRange: initialData?.preferredInvestmentRange ?? '',
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Update user basic info
      await apiRequest('POST', '/api/users/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        profession: data.profession,
      });

      // Update user profile with detailed preferences
      await apiRequest('POST', '/api/users/profile/detailed', {
        userId,
        expertiseTags: data.expertiseTags,
        investmentGoals: data.investmentGoals,
        riskAppetite: RISK_LABELS[Math.floor(parseInt(data.riskAppetite) / 4)],
        preferredInvestmentRange: data.preferredInvestmentRange,
        personaSegments: determinePersonaSegments(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Profile Saved',
        description: 'Your personalized experience is now active!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/personalization/copy', userId] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName ?? '',
        lastName: initialData.lastName ?? '',
        company: initialData.company ?? '',
        profession: initialData.profession ?? '',
        expertiseTags: initialData.expertiseTags ?? [],
        investmentGoals: initialData.investmentGoals ?? [],
        riskAppetite: initialData.riskAppetite
          ? riskLabelToSliderValue(initialData.riskAppetite)
          : '5',
        preferredInvestmentRange: initialData.preferredInvestmentRange ?? '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const determinePersonaSegments = (data: ProfileFormData): string[] => {
    const segments: string[] = [];
    const tags = data.expertiseTags;

    if (tags.includes('Finance') || tags.includes('Tax Credits')) {
      segments.push('FinTech Investor');
    }
    if (tags.includes('Solar Energy') || tags.includes('Manufacturing')) {
      segments.push('Technical Expert');
    }
    if (tags.includes('Policy')) {
      segments.push('Policy Advisor');
    }
    if (tags.includes('Real Estate') || tags.includes('Construction')) {
      segments.push('Strategic Corporate Partner');
    }
    if (segments.length === 0) {
      segments.push('General Investor');
    }

    return segments;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const toggleExpertise = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseTags: prev.expertiseTags.includes(tag)
        ? prev.expertiseTags.filter((t) => t !== tag)
        : [...prev.expertiseTags, tag],
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goal)
        ? prev.investmentGoals.filter((g) => g !== goal)
        : [...prev.investmentGoals, goal],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.profession;
      case 2:
        return formData.expertiseTags.length > 0;
      case 3:
        return formData.investmentGoals.length > 0;
      case 4:
        return formData.preferredInvestmentRange;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Personalize Your Experience
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4 - Help us tailor content to your expertise and goals
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Acme Capital"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Role / Title</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  placeholder="Managing Partner"
                />
              </div>
            </div>
          )}

          {/* Step 2: Expertise Areas */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select all areas that match your expertise (select at least one)
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      formData.expertiseTags.includes(tag)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => toggleExpertise(tag)}
                  >
                    {formData.expertiseTags.includes(tag) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Investment Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                What are your primary investment goals? (select all that apply)
              </p>
              <div className="space-y-2">
                {INVESTMENT_GOAL_OPTIONS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.investmentGoals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <Label
                      htmlFor={goal}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Risk Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Risk Appetite</Label>
                <div className="space-y-2">
                  <Slider
                    value={[parseInt(formData.riskAppetite)]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, riskAppetite: String(value[0]) })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Moderate</span>
                    <span>Aggressive</span>
                  </div>
                  <p className="text-sm text-center font-medium">
                    {RISK_LABELS[Math.floor(parseInt(formData.riskAppetite) / 4)]}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentRange">
                  Preferred Investment Range
                </Label>
                <Select
                  value={formData.preferredInvestmentRange}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredInvestmentRange: value })
                  }
                >
                  <SelectTrigger id="investmentRange">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
