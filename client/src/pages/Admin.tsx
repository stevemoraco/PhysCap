import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserActivityChart } from '@/components/admin/UserActivityChart';
import { FeedbackBrowser } from '@/components/admin/FeedbackBrowser';
import { InteractionHeatmap } from '@/components/admin/InteractionHeatmap';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiRequest('GET', '/api/admin/users'),
  });

  const { data: interactions, isLoading: interactionsLoading } = useQuery({
    queryKey: ['admin-interactions'],
    queryFn: () => apiRequest('GET', '/api/admin/interactions'),
  });

  const { data: feedbacks, isLoading: feedbacksLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: () => apiRequest('GET', '/api/admin/feedbacks'),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiRequest('GET', '/api/admin/analytics'),
  });

  const handleGenerateAllReports = async () => {
    try {
      await apiRequest('POST', '/api/admin/reports/generate-all');
      alert('Reports generated successfully!');
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports');
    }
  };

  if (usersLoading || interactionsLoading || feedbacksLoading || analyticsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const filteredFeedbacks = feedbacks?.filter(
    (f: any) =>
      f.feedbackText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleGenerateAllReports}>Generate All Reports</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.activeToday || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalInteractions || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalFeedback || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <UserActivityChart data={analytics?.activityByDay || []} />
        </CardContent>
      </Card>

      {/* Interaction Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractionHeatmap data={interactions || []} />
        </CardContent>
      </Card>

      {/* Feedback Browser */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Feedback</CardTitle>
          <Input
            type="search"
            placeholder="Search transcripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <FeedbackBrowser feedbacks={filteredFeedbacks || []} />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.profession}</TableCell>
                  <TableCell>{user.expertise}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
