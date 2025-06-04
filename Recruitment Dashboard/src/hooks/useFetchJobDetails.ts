import { useEffect, useState, useCallback, useMemo } from "react";

// API URL configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

export interface Job {
    jobId: string;
    jobTitle: string;
    location: string;
    locationType: 'On-site' | 'Remote' | 'Hybrid';
    postedDate: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract';
    jobStatus: 'open' | 'close';
    experience?: string;
    [key: string]: any;
  }

export interface JobFilters {
  location?: string;
  jobType?: string;
  [key: string]: string | undefined;
}

export interface UseFetchJobDetailsReturn {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJob: Job | null;
  loading: boolean;
  jobDetailsLoading: boolean;
  error: string | null;
  fetchJobById: (jobId: string, forceRefresh?: boolean) => Promise<void>;
  applyFilters: (filters: JobFilters) => void;
}

const useFetchJobDetails = (): UseFetchJobDetailsReturn => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobDetailsLoading, setJobDetailsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //***** --- fetch initial job lists only --- ******* */
  useEffect(() => {
    const fetchAllJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`);

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        console.log("display data", data);
        if (Array.isArray(data)) {
          setAllJobs(data);
          console.log("set all jobs",allJobs);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAllJobs();
  }, []);

  // Apply filters to jobs
  const applyFilters = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters);
  }, []);

  // Filter jobs based on selected filters
  const filteredJobs = useMemo(() => {
    if (!Object.keys(filters).length) return allJobs;

    return allJobs.filter(job => {
      // Check if job matches all active filters
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Skip undefined or empty values
        
        // Handle location filter (partial match)
        if (key === 'location') {
          return job.location.toLowerCase().includes(value.toLowerCase());
        }
        
        // Handle job type filter
        if (key === 'jobType') {
          return job.locationType === value;
        }
        
        // Default check for any other filters
        return job[key] === value;
      });
    });
  }, [allJobs, filters]);

  //***** ---fetch job details based on jobId --- ******* */
  const fetchJobById = useCallback(async (jobId: string, forceRefresh?: boolean): Promise<void> => {
    if (!jobId) {
      console.error("No job ID provided");
      return;
    }
    
    // If we already have this job selected and not forcing refresh, don't refetch it
    if (selectedJob && selectedJob.jobId === jobId && !forceRefresh) {
      console.log("Job already selected, skipping fetch");
      return;
    }
    
    console.log(`Fetching job details for ID: ${jobId}${forceRefresh ? ' (forced refresh)' : ''}`);
    setJobDetailsLoading(true);
    
    try {
      // First, check if we can find the job in our jobs list and not forcing refresh
      const cachedJob = allJobs.find(job => job.jobId === jobId);
      if (cachedJob && !forceRefresh) {
        console.log("Using cached job data:", cachedJob);
        setSelectedJob(cachedJob);
        // Still fetch from API to get the latest data, but don't block UI
        fetchJobFromAPI(jobId).then(jobData => {
          if (jobData) setSelectedJob(jobData);
        });
      } else {
        // If not in cache or forcing refresh, fetch from API and wait for result
        const jobData = await fetchJobFromAPI(jobId);
        if (jobData) setSelectedJob(jobData);
      }
    } catch (err: any) {
      console.error("Error fetching job details:", err);
      setError(err.message || "An error occurred");
    } finally {
      setJobDetailsLoading(false);
    }
  }, [allJobs, selectedJob]);
  
  // Helper function to fetch job from API
  const fetchJobFromAPI = async (jobId: string): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      
      const data = await response.json();
      console.log("printing data", data);
      if (data) {
        console.log("Successfully fetched job details from API:", data);
        return data;
      } else {
        throw new Error("Invalid job details response");
      }
    } catch (err: any) {
      console.error("API error:", err);
      throw err;
    }
  };

  return {
    jobs: filteredJobs, // Return filtered jobs as jobs
    filteredJobs,      // Also provide filteredJobs for clarity
    selectedJob,
    loading,
    jobDetailsLoading,
    error,
    fetchJobById,
    applyFilters,
  };
};

export default useFetchJobDetails;
