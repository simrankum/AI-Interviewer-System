import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobTabs from "@/components/JobTabs";
import JobCard from "@/components/JobCard";
import JobDetail from "@/components/JobDetail";
import JobFilter from "@/components/JobFilter";
import CandidateList from "@/components/CandidateList";
import useFetchJobDetails, { JobFilters } from "@/hooks/useFetchJobDetails";
import { Briefcase, Maximize2, Minimize2, FileText, UserCheck, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("Job Descriptions");
  const { jobs, selectedJob, loading, jobDetailsLoading, error, fetchJobById, applyFilters } = useFetchJobDetails();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs = ["Job Descriptions", "Selected Candidate", "List of Candidates"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleJobSelect = (job: any) => {
    // If already selected, do nothing to prevent re-render
    if (selectedJob && selectedJob.jobId === job.jobId) return;
    fetchJobById(job.jobId);
  };

  const handleJobClose = (jobId: string) => {
    // This functionality would need to be handled differently with the API
    // For now, we'll leave it as a UI-only function with no backend effect
    if (selectedJob && selectedJob.jobId === jobId) {
      if (jobs.length > 0 && jobs[0].jobId !== jobId) {
        fetchJobById(jobs[0].jobId);
      } else if (jobs.length > 1) {
        fetchJobById(jobs[1].jobId);
      }
    }
  };

  const handleFilterChange = (newFilters: JobFilters) => {
    console.log("Applying filters:", newFilters);
    applyFilters(newFilters);
  };
  
  const handleRefreshJob = () => {
    if (selectedJob) {
      console.log("Refreshing job data for:", selectedJob.jobId);
      fetchJobById(selectedJob.jobId, true); // Pass true to force refresh
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Memoize job cards to prevent re-renders
  const jobCards = useMemo(() => {
    return jobs.map((job) => (
      <JobCard
        key={job.jobId}
        job={job}
        isActive={selectedJob?.jobId === job.jobId}
        onSelect={handleJobSelect}
        onClose={handleJobClose}
      />
    ));
  }, [jobs, selectedJob?.jobId, handleJobSelect, handleJobClose]);

  // Render empty state with icon based on current tab
  const renderEmptyState = () => {
    switch (activeTab) {
      case "Job Descriptions":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <FileText size={36} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Job Selected</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Select a job from the list on the left to view its description and details.
            </p>
          </div>
        );
      case "Selected Candidate":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <UserCheck size={36} className="text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Candidate Selected</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Choose a candidate from the job applicants list to view their profile and application details.
            </p>
            <Button variant="outline" className="mt-6 bg-white/80 dark:bg-gray-800/80">
              Coming Soon
            </Button>
          </div>
        );
      case "List of Candidates":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-6">
              <Users size={36} className="text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Candidate List</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              View all candidates who applied for this position and filter by qualifications.
            </p>
            <Button variant="outline" className="mt-6 bg-white/80 dark:bg-gray-800/80">
              Coming Soon
            </Button>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-6">
              <AlertCircle size={36} className="text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Empty Tab</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              This section is currently empty. Select an item to view details.
            </p>
          </div>
        );
    }
  };

  // Memoize the main content to prevent re-renders
  const mainContent = useMemo(() => {
    return (
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative bg-gray-50/80 dark:bg-gray-900/80 p-4 gap-4 h-[calc(100%-56px)]">
        {/* Left sidebar - Fixed width with card shadow */}
        <div className="w-full md:w-[350px] flex flex-col overflow-hidden rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex-shrink-0 h-full max-h-full">
          <JobFilter onFilterChange={handleFilterChange} />
          
          <div className="overflow-y-auto flex-1 border-t border-gray-100/70 dark:border-gray-700/50 h-full">
            {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobCards
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right content area - with card shadow */}
        <div className="w-full md:flex-1 overflow-hidden flex flex-col rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm h-full">
          <JobTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
          
          <div className="overflow-y-auto flex-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 h-full">
            {activeTab === "Job Descriptions" && (
              selectedJob || jobDetailsLoading ? (
                <JobDetail 
                  job={selectedJob} 
                  isLoading={jobDetailsLoading} 
                  onRefresh={handleRefreshJob}
                  onSwitchToTab={handleTabChange}
                />
              ) : renderEmptyState()
            )}
            {activeTab === "Selected Candidate" && (
              renderEmptyState()
            )}
            {activeTab === "List of Candidates" && (
              selectedJob ? (
                <CandidateList
                  selectedJobId={selectedJob.jobId}
                  onRefresh={handleRefreshJob}
                />
              ) : renderEmptyState()
            )}
          </div>
        </div>
      </div>
    );
  }, [
    activeTab, 
    jobs.length, 
    loading, 
    jobCards, 
    selectedJob, 
    jobDetailsLoading, 
    tabs,
    handleRefreshJob
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {!isFullscreen && <Sidebar />}
      {!isFullscreen && <Header />}
      
      <div className={`flex-1 transition-all duration-300 ${isFullscreen ? 'ml-0' : 'ml-[4.8rem]'} h-full`}>
        <main className={`h-full w-full pl-4 pr-2 ${isFullscreen ? 'pt-4' : 'pt-20'} overflow-hidden`}>
          <div className="flex flex-col w-full h-full overflow-hidden rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_8px_24px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-filter backdrop-blur-[2px] bg-white/90 dark:bg-gray-800/90">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/70 dark:border-gray-700/70">
              <div className="flex items-center">
                <Briefcase className="mr-2 text-gray-600 dark:text-gray-300" size={20} />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recruitment Dashboard</h2>

              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md w-10 h-10"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
              </Button>
            </div>
            
            {mainContent}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Index;
