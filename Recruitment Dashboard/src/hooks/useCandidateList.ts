import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

export interface CandidateResult {
  id: string;
  fileName: string;
  candidateName: string;
  email: string;
  status: string;
  matchScore: number;
  skills: string[];
  matched_skills?: string[];
  processingError?: boolean;
  feedback: string;
}

export interface SavedResults {
  jobId: string;
  jobTitle: string;
  company?: string;
  results: CandidateResult[];
  savedAt: string;
}

export interface UseCandidateListReturn {
  savedResults: SavedResults | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  scheduledInterviews: Set<string>;
  activeFilter: string | null;
  fetchSavedResults: () => Promise<void>;
  handleRefresh: () => void;
  handleScheduleInterview: (candidateId: string, closeDialog?: () => void) => void;
  handleDisqualify: (candidateId: string, closeDialog?: () => void) => void;
  handleOpenGoogleMeet: (candidateId:string,jobId: string) => void;
  setActiveFilter: (filter: string | null) => void;
}

export default function useCandidateList(selectedJobId?: string, onRefresh?: () => void): UseCandidateListReturn {
  const [savedResults, setSavedResults] = useState<SavedResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [scheduledInterviews, setScheduledInterviews] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch saved results
  const fetchSavedResults = async () => {
    if (!selectedJobId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would fetch from an endpoint like '/api/resumes/saved-results/:jobId'
      // For this demo, we'll simulate a fetch with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulated API response - in a real app, this would be fetched from the backend
      const response = await fetch(`${API_BASE_URL}/candidates/listOfCandidates/${selectedJobId}`);

      if (!response.ok) {
        if (response.status === 404) {
          // No results found is not an error, just an empty state
          setSavedResults(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch saved results');
      }

      const data = await response.json();
      setSavedResults(data.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching saved results');
      toast.error("Could not load candidates", {
        description: err.message || 'Failed to load candidate data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedResults();
  }, [selectedJobId]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    fetchSavedResults().finally(() => {
      setIsRefreshing(false);
      if (onRefresh) onRefresh();
    });
  };

  const handleScheduleInterview = (candidateId: string, closeDialog?: () => void) => {
    // Update scheduledInterviews state
    setScheduledInterviews(prev => {
      const updated = new Set(prev);
      updated.add(candidateId);
      return updated;
    });
    
    toast.success("Interview scheduled", {
      description: `Successfully scheduled interview with candidate ID: ${candidateId}`,
    });
    
    if (closeDialog) {
      closeDialog();
    }
  };

  const handleDisqualify = (candidateId: string, closeDialog?: () => void) => {
    toast.success("Candidate disqualified", {
      description: `Candidate ID: ${candidateId} has been marked as disqualified`,
    });
    
    if (closeDialog) {
      closeDialog();
    }
  };

  // Function to handle opening Google Meet---------------- work in this part
  const handleOpenGoogleMeet = (candidateId:string,jobId: string) => {
    const meetUrl = `${import.meta.env.VITE_REDIRECT_URL}?jobId=${jobId}&candidateId=${candidateId}`;
    window.open(meetUrl, '_blank');
    
    toast.success("Opening Google Meet", {
      description: `Starting video interview`,
    });
  };

  return {
    savedResults,
    loading,
    error,
    isRefreshing,
    scheduledInterviews,
    activeFilter,
    fetchSavedResults,
    handleRefresh,
    handleScheduleInterview,
    handleDisqualify,
    handleOpenGoogleMeet,
    setActiveFilter
  };
} 