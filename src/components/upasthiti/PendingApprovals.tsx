import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PendingRequest {
  id: string;
  department: string;
  year: string;
  rollNo: string;
  studentName: string;
  requestType: string;
  submittedAt: string;
}

const mockRequests: PendingRequest[] = [
  {
    id: '1',
    department: 'Computer Science',
    year: '3rd Year',
    rollNo: 'CS2021001',
    studentName: 'Rahul Sharma',
    requestType: 'Leave Application',
    submittedAt: '2024-01-15 10:30'
  },
  {
    id: '2',
    department: 'Electronics',
    year: '2nd Year',
    rollNo: 'EC2022045',
    studentName: 'Priya Patel',
    requestType: 'Attendance Correction',
    submittedAt: '2024-01-15 09:15'
  },
  {
    id: '3',
    department: 'Mechanical',
    year: '4th Year',
    rollNo: 'ME2020123',
    studentName: 'Amit Kumar',
    requestType: 'Assignment Extension',
    submittedAt: '2024-01-14 16:45'
  }
];

export const PendingApprovals = () => {
  const [requests, setRequests] = useState<PendingRequest[]>(mockRequests);

  const handleApprove = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    toast({
      title: "Request Approved",
      description: "The student request has been approved successfully.",
    });
  };

  const handleDecline = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    toast({
      title: "Request Declined",
      description: "The student request has been declined.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Pending Approvals</h2>
        <Badge variant="secondary" className="ml-2">
          {requests.length} pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Check className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending approvals at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{request.studentName}</CardTitle>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {request.department} • {request.year}
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    Roll No: {request.rollNo}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {request.requestType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Submitted: {request.submittedAt}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleDecline(request.id)}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};