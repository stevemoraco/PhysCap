import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/GoldButton';
import { Linkedin, ExternalLink, Users } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: 'Founder' | 'Advisor' | 'Executive' | 'Board Member' | 'Partner';
  bio: string;
  expertise: string[];
  linkedinUrl?: string;
  photoPlaceholder?: string;
  achievements?: string[];
}

interface TeamProfilesProps {
  members: TeamMember[];
  onInteraction?: (type: string, context: any) => void;
}

export function TeamProfiles({ members, onInteraction }: TeamProfilesProps) {
  const handleLinkedInClick = (member: TeamMember) => {
    onInteraction?.('team_linkedin_click', {
      memberId: member.id,
      memberName: member.name,
      role: member.role,
    });
    if (member.linkedinUrl) {
      window.open(member.linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProfileClick = (member: TeamMember) => {
    onInteraction?.('team_profile_click', {
      memberId: member.id,
      memberName: member.name,
      role: member.role,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Founder':
        return 'bg-primary text-primary-foreground';
      case 'Advisor':
        return 'bg-accent text-accent-foreground';
      case 'Executive':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Team & Advisors
          </h3>
          <p className="text-muted-foreground mt-1">
            World-class expertise across technology, finance, and operations
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {members.length} Members
        </Badge>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card
            key={member.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50 cursor-pointer"
            onClick={() => handleProfileClick(member)}
            data-testid={`team-card-${member.id}`}
          >
            {/* Photo placeholder with gradient */}
            <div
              className={`h-48 relative overflow-hidden ${
                member.photoPlaceholder || 'bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
              {/* Initials if no photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary/30">
                  <span className="text-3xl font-bold text-primary">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
              </div>
              {/* Role badge overlay */}
              <div className="absolute top-3 right-3">
                <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
              </div>
            </div>

            <div className="p-5">
              {/* Name and title */}
              <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {member.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">{member.title}</p>

              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{member.bio}</p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.expertise.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {member.expertise.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{member.expertise.length - 3}
                  </Badge>
                )}
              </div>

              {/* Achievements (if any) */}
              {member.achievements && member.achievements.length > 0 && (
                <div className="mb-4 space-y-1">
                  {member.achievements.slice(0, 2).map((achievement, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />
                      <span className="line-clamp-1">{achievement}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* LinkedIn link */}
              {member.linkedinUrl && (
                <GoldButton
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleLinkedInClick(member);
                  }}
                  data-testid={`team-linkedin-${member.id}`}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Connect on LinkedIn
                </GoldButton>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">
              {members.filter((m) => m.role === 'Founder').length}
            </div>
            <div className="text-sm text-muted-foreground">Founders</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-1">
              {members.filter((m) => m.role === 'Advisor').length}
            </div>
            <div className="text-sm text-muted-foreground">Advisors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">
              {members.filter((m) => m.role === 'Executive').length}
            </div>
            <div className="text-sm text-muted-foreground">Executives</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-1">
              {Array.from(new Set(members.flatMap((m) => m.expertise))).length}
            </div>
            <div className="text-sm text-muted-foreground">Areas of Expertise</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
