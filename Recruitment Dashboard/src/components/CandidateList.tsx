import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, FileText, UserPlus, CheckCircle, AlertCircle, XCircle, Star, Inbox, Video, Calendar } from "lucide-react";
import CandidateProfile from "@/components/CandidateProfile";
import ActionButton from "@/components/ui/custom-button";
import useCandidateList, { CandidateResult } from "@/hooks/useCandidateList";

interface CandidateListProps {
  selectedJobId?: string;
  onRefresh?: () => void;
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

const CandidateList = ({ selectedJobId, onRefresh }: CandidateListProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  
  const {
    savedResults,
    loading,
    error,
    isRefreshing,
    scheduledInterviews,
    activeFilter,
    handleRefresh,
    handleScheduleInterview,
    handleDisqualify,
    handleOpenGoogleMeet,
    setActiveFilter
  } = useCandidateList(selectedJobId, onRefresh);

  const handleViewProfile = (candidate: CandidateResult) => {
    setSelectedCandidate(candidate);
    setIsProfileOpen(true);
  };

  // Empty state - no job selected
  if (!selectedJobId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-6">
          <Inbox size={36} className="text-purple-500 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Job Selected</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Select a job from the list on the left to view its candidates.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Loader2 size={36} className="text-blue-500 dark:text-blue-400 animate-spin mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Loading Candidates</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Retrieving candidate data for the selected job...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <XCircle size={36} className="text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Could Not Load Candidates</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {error}
        </p>
        <Button variant="outline" className="mt-6" onClick={handleRefresh}>
          Try Again
        </Button>
      </div>
    );
  }

  // No results saved yet
  if (!savedResults || !savedResults.results || savedResults.results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <UserPlus size={36} className="text-amber-500 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Candidates Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          You haven't saved any resume analysis results for this job yet. Process and save resumes from the Job Description tab.
        </p>
      </div>
    );
  }

  // Results display
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Candidates for {savedResults.jobTitle}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {savedResults.results.length} candidates • Last updated {new Date(savedResults.savedAt).toLocaleString()}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Refresh candidate list"
          >
            <RefreshCw 
              size={18} 
              className={`${isRefreshing ? 'animate-spin' : ''} mr-2`}
            />
            Refresh Candidates
          </Button>
        </div>
      </div>
      
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
          className={`rounded-full px-4 ${activeFilter === null ? 'bg-blue-600 text-white' : ''}`}
        >
          All Candidates
        </Button>
        <Button
          variant={activeFilter === "qualified" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("qualified")}
          className={`rounded-full px-4 ${activeFilter === "qualified" ? 'bg-green-600 text-white' : ''}`}
        >
          <CheckCircle size={16} className="mr-2" />
          Qualified
        </Button>
        <Button
          variant={activeFilter === "not-qualified" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("not-qualified")}
          className={`rounded-full px-4 ${activeFilter === "not-qualified" ? 'bg-red-600 text-white' : ''}`}
        >
          <XCircle size={16} className="mr-2" />
          Not Qualified
        </Button>
        <Button
          variant={activeFilter === "interview-scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("interview-scheduled")}
          className={`rounded-full px-4 ${activeFilter === "interview-scheduled" ? 'bg-green-600 text-white' : ''}`}
        >
          <Video size={16} className="mr-2" />
          Interview Scheduled
        </Button>
        <Button
          variant={activeFilter === "interview-pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("interview-pending")}
          className={`rounded-full px-4 ${activeFilter === "interview-pending" ? 'bg-amber-600 text-white' : ''}`}
        >
          <Calendar size={16} className="mr-2" />
          Interview Not Scheduled
        </Button>
      </div>
      
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Match</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Interview Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.results
                  .filter(candidate => {
                    // Apply active filter
                    if (!activeFilter) return true;
                    
                    // Check if interview is scheduled for this candidate
                    const isInterviewScheduled = scheduledInterviews.has(candidate.id);
                    
                    // For demo, only use deterministic status if not explicitly scheduled
                    const interviewStatus = isInterviewScheduled 
                      ? 'scheduled'
                      : (candidate.status.toLowerCase() === 'not qualified' 
                        ? 'disqualified'
                        : ['scheduled', 'pending', 'not scheduled'][Math.floor(candidate.id.length % 3)]);
                    
                    // Check each filter condition
                    switch (activeFilter) {
                      case "qualified":
                        return candidate.status.toLowerCase() !== 'not qualified' && candidate.matchScore >= 60;
                      case "not-qualified":
                        return candidate.status.toLowerCase() === 'not qualified' || candidate.matchScore < 40;
                      case "interview-scheduled":
                        return isInterviewScheduled || interviewStatus === 'scheduled';
                      case "interview-pending":
                        return !isInterviewScheduled && interviewStatus !== 'scheduled' && interviewStatus !== 'disqualified';
                      default:
                        return true;
                    }
                  })
                  .map((candidate) => {
                    // Check if interview is scheduled for this candidate
                    const isInterviewScheduled = scheduledInterviews.has(candidate.id);
                    
                    // For demo, only use deterministic status if not explicitly scheduled
                    const interviewStatus = isInterviewScheduled 
                      ? 'scheduled'
                      : (candidate.status.toLowerCase() === 'not qualified' 
                        ? 'disqualified'
                        : ['scheduled', 'pending', 'not scheduled'][Math.floor(candidate.id.length % 3)]);
                    
                    const getInterviewStatusStyle = (status: string) => {
                      switch(status) {
                        case 'scheduled':
                          return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
                        case 'pending': 
                          return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
                        case 'disqualified':
                          return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400";
                        default:
                          return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400";
                      }
                    };
                    
                    return (
                      <tr key={candidate.id} className="border-b dark:border-gray-700">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {candidate.candidateName || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {candidate.email || "No email available"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status, candidate.processingError)}`}>
                            {getStatusIcon(candidate.status, candidate.processingError)}
                            <span className="ml-1">{candidate.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className={`h-2.5 rounded-full ${
                                candidate.matchScore >= 70 
                                  ? 'bg-green-500' 
                                  : candidate.matchScore >= 40 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${candidate.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {candidate.matchScore}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInterviewStatusStyle(interviewStatus)}`}>
                            {interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <ActionButton 
                              actionType="view-profile" 
                              onClick={() => handleViewProfile(candidate)}
                            >
                              View
                            </ActionButton>
                            
                            {interviewStatus === 'scheduled' && (
                              <ActionButton 
                                actionType="approve"
                                onClick={() => handleOpenGoogleMeet(candidate?.id,savedResults?.jobId)}
                              >
                                <Video size={16} className="mr-1" />
                                Meet
                              </ActionButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            
            {/* Show empty state when no results match the filter */}
            {savedResults.results.filter(candidate => {
              if (!activeFilter) return true;
              
              // Check if interview is scheduled for this candidate
              const isInterviewScheduled = scheduledInterviews.has(candidate.id);
              
              // For demo, only use deterministic status if not explicitly scheduled
              const interviewStatus = isInterviewScheduled 
                ? 'scheduled'
                : (candidate.status.toLowerCase() === 'not qualified' 
                  ? 'disqualified'
                  : ['scheduled', 'pending', 'not scheduled'][Math.floor(candidate.id.length % 3)]);
              
              switch (activeFilter) {
                case "qualified":
                  return candidate.status.toLowerCase() !== 'not qualified' && candidate.matchScore >= 60;
                case "not-qualified":
                  return candidate.status.toLowerCase() === 'not qualified' || candidate.matchScore < 40;
                case "interview-scheduled":
                  return isInterviewScheduled || interviewStatus === 'scheduled';
                case "interview-pending":
                  return !isInterviewScheduled && interviewStatus !== 'scheduled' && interviewStatus !== 'disqualified';
                default:
                  return true;
              }
            }).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No candidates match the selected filter</p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveFilter(null)}
                  className="mt-2"
                >
                  Clear filter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          onScheduleInterview={(candidateId) => {
            handleScheduleInterview(candidateId, () => setIsProfileOpen(false));
          }}
          onDisqualify={(candidateId) => {
            handleDisqualify(candidateId, () => setIsProfileOpen(false));
          }}
          isInterviewScheduled={scheduledInterviews.has(selectedCandidate.id)}
        />
      )}
    </div>
  );
};

export default CandidateList; 