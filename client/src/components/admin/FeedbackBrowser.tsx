import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FeedbackBrowserProps {
  feedbacks: Array<{
    id: string;
    userId: string;
    projectId: string;
    feedbackText: string;
    expertise: string;
    createdAt: string;
    user?: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
  }>;
}

export function FeedbackBrowser({ feedbacks }: FeedbackBrowserProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No feedback available</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Expertise</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell>
                {feedback.user ? (
                  <div>
                    <div className="font-medium">
                      {feedback.user.firstName} {feedback.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{feedback.user.email}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Unknown</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{feedback.projectId}</Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <div className="truncate">{feedback.feedbackText}</div>
              </TableCell>
              <TableCell>
                <Badge>{feedback.expertise}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
