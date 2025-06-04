import React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Mail, CheckCircle, AlertCircle, XCircle, Star, Video, Calendar, Briefcase } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface CandidateProfileProps {
  candidate: {
    id: string;
    fileName: string;
    candidateName: string;
    email: string;
    status: string;
    matchScore: number;
    skills: string[];
    matched_skills?: string[];
    feedback: string;
    processingError?: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleInterview: (candidateId: string) => void;
  onDisqualify?: (candidateId: string) => void;
  isInterviewScheduled?: boolean;
}

// Helper function to get status icon
const getStatusIcon = (status: string, processingError: boolean = false) => {
  if (processingError) {
    return <XCircle className="text-red-500" size={16} />;
  }
  
  switch (status.toLowerCase()) {
    case 'matched':
    case 'excellent match':
      return <CheckCircle className="text-green-500" size={16} />;
    case 'needs review':
    case 'potential':
      return <AlertCircle className="text-amber-500" size={16} />;
    case 'not qualified':
      return <XCircle className="text-red-500" size={16} />;
    default:
      return <Star className="text-blue-500" size={16} />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string, processingError: boolean = false) => {
  if (processingError) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  
  switch (status.toLowerCase()) {
    case 'matched':
    case 'excellent match':
      return "bg-green-50 text-green-700 border-green-200";
    case 'needs review':
    case 'potential':
      return "bg-amber-50 text-amber-700 border-amber-200";
    case 'not qualified':
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const CandidateProfile: React.FC<CandidateProfileProps> = ({
  candidate,
  open,
  onOpenChange,
  onScheduleInterview,
  onDisqualify,
  isInterviewScheduled = false
}) => {
  // Function to handle opening Google Meet
  const handleOpenGoogleMeet = () => {
    // In a real app, you would have a specific meeting link
    // For demo, we'll construct a meeting name and open in new tab
    const meetingName = `interview-${candidate.candidateName.replace(/\s+/g, '-').toLowerCase()}`;
    const meetUrl = `https://meet.google.com/new?hs=122&authuser=0&name=${meetingName}`;
    window.open(meetUrl, '_blank');
    
    toast.success("Opening Google Meet", {
      description: `Starting video interview with ${candidate.candidateName}`,
    });
  };

  // Format interview date
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() + 3);
  const formattedDate = interviewDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl shadow-xl">
        {/* Top Banner with Profile Circle */}
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-400 h-32 rounded-t-xl">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-200 text-2xl font-bold border-4 border-white dark:border-gray-800">
              {candidate.candidateName.split(' ').map(name => name[0]).join('')}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                <XCircle size={18} />
              </Button>
            </DialogClose>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div className="p-6 pt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{candidate.candidateName}</h1>
              <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{candidate.email}</span>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(candidate.status, candidate.processingError)}`}>
                {getStatusIcon(candidate.status, candidate.processingError)}
                <span className="ml-1">{candidate.status}</span>
              </span>
              
              {/* Interview Status Indicator - Compact Version */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                isInterviewScheduled 
                  ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {isInterviewScheduled ? 'Scheduled' : 'Not Scheduled'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-1">
              <Card className="shadow-lg border-0 dark:bg-gray-800/80 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Resume File */}
                    <div className="flex items-start">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mt-0.5">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Resume</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{candidate.fileName}</p>
                      </div>
                    </div>
                    
                    {/* Match Score */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Match Score</p>
                        <span className={`text-sm font-bold ${
                          candidate.matchScore >= 70 
                            ? 'text-green-600 dark:text-green-400' 
                            : candidate.matchScore >= 40 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-red-600 dark:text-red-400'
                        }`}>
                          {candidate.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            candidate.matchScore >= 70 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : candidate.matchScore >= 40 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
                                : 'bg-gradient-to-r from-red-500 to-red-400'
                          }`}
                          style={{ width: `${candidate.matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Interview Status */}
                    <div className={`rounded-lg px-4 py-3 flex items-center ${
                      isInterviewScheduled 
                        ? 'bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-100 dark:ring-green-800/30' 
                        : candidate.status.toLowerCase() === 'not qualified'
                          ? 'bg-red-50/50 dark:bg-red-900/10 ring-1 ring-red-100 dark:ring-red-800/30' 
                          : 'bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-100 dark:ring-blue-800/30'
                    }`}>
                      {isInterviewScheduled ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                Interview Scheduled
                              </p>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium">
                              {formattedDate}
                            </p>
                          </div>
                          <Button 
                            className="rounded-full h-8 w-8 p-0 bg-green-100 hover:bg-green-200 dark:bg-green-800/50 dark:hover:bg-green-800/80 shadow-sm"
                            onClick={handleOpenGoogleMeet}
                            title="Join Google Meet"
                          >
                            <Video size={14} className="text-green-600 dark:text-green-400" />
                          </Button>
                        </>
                      ) : candidate.status.toLowerCase() === 'not qualified' ? (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Not Qualified
                          </p>
                        </div>
                      ) : (
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                              No Interview
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="rounded h-7 px-3 py-0 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => onScheduleInterview(candidate.id)}
                          >
                            Schedule
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="md:col-span-2">
              <div className="space-y-5">
                {/* Skills */}
                <Card className="shadow-lg border-0 dark:bg-gray-800/80 ring-1 ring-gray-200 dark:ring-gray-700">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <Briefcase className="h-4 w-4 text-amber-500 mr-2" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                        Skills Assessment
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {candidate.matched_skills?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="px-2.5 py-0.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900 shadow-sm">
                          <CheckCircle size={10} className="mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    {candidate.skills
                      .filter(skill => !candidate.matched_skills?.includes(skill))
                      .length > 0 && (
                      <>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2 mt-3">Other Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills
                            .filter(skill => !candidate.matched_skills?.includes(skill))
                            .map((skill, index) => (
                              <Badge key={index} variant="outline" className="px-2.5 py-0.5 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:border-gray-700 shadow-sm">
                                {skill}
                              </Badge>
                            ))
                          }
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {/* Feedback */}
                <Card className="shadow-lg border-0 dark:bg-gray-800/80 ring-1 ring-gray-200 dark:ring-gray-700">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center">
                      <Star className="h-4 w-4 text-amber-500 mr-2" />
                      AI-Generated Feedback
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-md text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed border border-gray-100 dark:border-gray-700">
                      {candidate.feedback}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateProfile; 