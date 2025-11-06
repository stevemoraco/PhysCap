import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Facebook, Link2, Mail } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  projectId?: string;
}

export function SocialShare({ title, description, url, projectId }: SocialShareProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="hover-elevate"
          data-testid={`button-share-${projectId || 'page'}`}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="grid gap-2">
          <div className="text-sm font-medium mb-1">Share this project</div>
          
          {hasNativeShare && (
            <Button
              variant="ghost"
              className="w-full justify-start hover-elevate"
              onClick={handleNativeShare}
              data-testid="button-native-share"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share...
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start hover-elevate"
            onClick={copyToClipboard}
            data-testid="button-copy-link"
          >
            <Link2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start hover-elevate"
            asChild
            data-testid="button-share-twitter"
          >
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </a>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start hover-elevate"
            asChild
            data-testid="button-share-linkedin"
          >
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </a>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start hover-elevate"
            asChild
            data-testid="button-share-facebook"
          >
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </a>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start hover-elevate"
            asChild
            data-testid="button-share-email"
          >
            <a href={shareLinks.email}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
