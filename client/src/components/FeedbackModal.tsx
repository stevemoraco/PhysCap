import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GoldButton } from "./GoldButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function FeedbackModal({ open, onOpenChange, projectId, projectName }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [expertise, setExpertise] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { projectId: string; feedbackText: string; expertise: string }) => {
      await apiRequest('POST', '/api/feedback', data);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your insights! We're analyzing your expertise to create a personalized report.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      setFeedback("");
      setExpertise("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please share your thoughts before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({ projectId, feedbackText: feedback, expertise });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-primary/20" data-testid="modal-feedback">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            Share Your Expertise
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about your interest in <span className="text-primary font-medium">{projectName}</span>. 
            Your insights help us create a personalized investment recommendation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="expertise" className="text-foreground">
              Your Expertise & Background
            </Label>
            <Input
              id="expertise"
              placeholder="e.g., Solar Energy Investment, Manufacturing Technology, Real Estate Development..."
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="bg-background/50 border-primary/20"
              data-testid="input-expertise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-foreground">
              Your Feedback & Interest
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts, questions, or how you might contribute to this project..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="bg-background/50 border-primary/20 resize-none"
              data-testid="textarea-feedback"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <GoldButton
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </GoldButton>
            <GoldButton
              onClick={handleSubmit}
              icon="sparkle"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </GoldButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
