// import { Job } from "@/hooks/useFetchJobDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Building, Calendar, Clock, ExternalLink, FileText, MapPin, Share, Users, X, Upload, Trash2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, XCircle, Star, Loader2, RefreshCw, TrashIcon, Briefcase, Eye, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect, useRef, memo } from "react";
import useResumeUpload, { ResumeResponseRow, ApiResponse } from "@/hooks/useResumeUpload";
import useSaveResults from "@/hooks/useSaveResults";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Add a style tag with animation keyframes
const animationStyles = `
  @keyframes flow-right {
    0% { transform: translateX(0); opacity: 0.8; }
    100% { transform: translateX(80px); opacity: 0; }
  }
  
  @keyframes ping {
    0% { transform: scale(1); opacity: 0.8; }
    75%, 100% { transform: scale(1.2); opacity: 0; }
  }

  .animate-flow-right {
    animation: flow-right 1.5s infinite linear;
  }
  
  @keyframes pulse-rainbow {
    0% { border-color: #3b82f6; }
    25% { border-color: #8b5cf6; }
    50% { border-color: #ec4899; }
    75% { border-color: #f59e0b; }
    100% { border-color: #3b82f6; }
  }
  
  .animate-pulse-rainbow {
    animation: pulse-rainbow 3s infinite linear;
  }

  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
  
  .shimmer {
    background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
    background-size: 800px 104px;
    animation: shimmer 1.5s infinite linear;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

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

// Loading skeleton component
const JobDetailSkeleton = () => (
  <div className="p-6 overflow-y-auto h-full">
    <style dangerouslySetInnerHTML={{ __html: animationStyles }}/>
    
    <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <div className="h-8 w-64 shimmer rounded mb-3"></div>
      </div>
      
      <div className="flex items-center mt-2">
        <div className="h-5 w-32 shimmer rounded mr-3"></div>
        <div className="h-5 w-40 shimmer rounded"></div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <div className="h-8 w-32 shimmer rounded"></div>
        <div className="h-8 w-40 shimmer rounded"></div>
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        <div className="h-7 w-24 shimmer rounded"></div>
        <div className="h-7 w-24 shimmer rounded"></div>
      </div>
    </div>

    <div className="h-1 w-full shimmer rounded my-6"></div>

    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 shimmer rounded mb-4"></div>
        <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="h-6 w-48 shimmer rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 w-full shimmer rounded"></div>
            <div className="h-4 w-full shimmer rounded"></div>
            <div className="h-4 w-3/4 shimmer rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface JobDetailProps {
  job: any;
  isLoading?: boolean;
  onRefresh?: () => void;
  onSwitchToTab?: (tab: string) => void;
}

// Memoize JobDetail component to prevent unnecessary re-renders
const JobDetail = memo(({ job, isLoading = false, onRefresh, onSwitchToTab }: JobDetailProps) => {
  const {
    files,
    currentFiles,
    currentPage,
    totalPages,
    isSubmitting,
    isProcessing,
    responseData,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDrop,
    deleteFile,
    deleteAllFiles,
    triggerFileInput,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    submitResumes
  } = useResumeUpload();
  
  // Use the save results hook
  const { saveResults, isSaving, error: saveError } = useSaveResults();
  
  // Refs for scrolling
  const processingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // State for refresh button animation
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for showing processing animation with dots
  const [loadingDots, setLoadingDots] = useState('');

  // State for controlling dialog visibility
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Update loading dots animation
  useEffect(() => {
    if (!isProcessing) return;
    
    const interval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Scroll to processing section when isProcessing changes to true
  useEffect(() => {
    if (isProcessing && processingRef.current) {
      processingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isProcessing]);

  // Scroll to results section when results are available
  useEffect(() => {
    if (responseData && 
       ((responseData.results && responseData.results.length > 0) || 
        (responseData.jobMatches && responseData.jobMatches.length > 0)) && 
       !isProcessing && 
       resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [responseData, isProcessing]);

  const handleApplyNow = () => {
    toast("Application submitted successfully", {
      description: "We've received your application and will review it shortly.",
    });
  };

  const handleSaveJob = () => {
    toast("Job saved to your favorites", {
      description: "You can access your saved jobs from your profile.",
    });
  };

  const handleSubmitResumes = () => {
    submitResumes(job);
    // Immediately scroll to processing section
    setTimeout(() => {
      if (processingRef.current) {
        processingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    onRefresh();
    
    // Reset refresh animation after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Handler for saving results to backend
  const handleSaveResults = async () => {
    if (!responseData) return;
  
    try {
      // Prepare data based on the response format
      if (responseData.jobMatches && responseData.jobMatches.length > 0) {
        // New format
        const jobMatch = responseData.jobMatches[0];
        await saveResults({
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          company: job.company || '',
          results: jobMatch.results
        }, () => {
          // Navigate to the List of Candidates tab on success
          if (onSwitchToTab) {
            onSwitchToTab("List of Candidates");
          }
        });
      } else if (responseData.results) {
        // Old format
        await saveResults({
          jobId: job.id || job.jobId || `job-${Date.now()}`,
          jobTitle: job.jobTitle || job.title || 'Unknown Job',
          company: job.company || '',
          results: responseData.results
        }, () => {
          // Navigate to the List of Candidates tab on success
          if (onSwitchToTab) {
            onSwitchToTab("List of Candidates");
          }
        });
      } else {
        throw new Error('No results data available to save');
      }
    } catch (error) {
      console.error('Error in handleSaveResults:', error);
    }
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400 dark:text-gray-500">
        <FileText size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium">Select a job to view details</p>
        <p className="text-sm mt-2">Click on any job from the left panel to see more information</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Add style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }}/>
      
      <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-lg shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {job.jobTitle}
            {job.jobStatus === 'open' ? (
              <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 py-1 px-2 rounded-full">
                Open
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 py-1 px-2 rounded-full">
                Closed
              </span>
            )}
          </h1>
          
          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Refresh job details"
            >
              <RefreshCw 
                size={18} 
                className={`${isRefreshing ? 'spin' : ''}`}
              />
            </Button>
          )}
        </div>
        
        <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
          <MapPin size={16} className="mr-1" />
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <Calendar size={16} className="mr-1" />
          <span>{job.postedDate}</span>
          <span className="mx-2">•</span>
          <Briefcase size={16} className="mr-1" />
          <span>{job.jobType}</span>
          {job.experience && (
            <>
              <span className="mx-2">•</span>
              <Clock size={16} className="mr-1" />
              <span>{job.experience} experience</span>
            </>
          )}
        </div>
      </div>

      <Separator className="my-6 dark:bg-gray-700" />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            About the job
          </h2>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Job Description</h3>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 whitespace-pre-line">
                <p>{job.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <FileText size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
            Upload Resume
          </h2>
            
            {files.length > 0 && (
              <Button
                variant="outline" 
                size="sm"
                onClick={deleteAllFiles}
                className="text-red-500 border-red-200 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:border-red-800/50 dark:hover:bg-red-900/20"
              >
                <TrashIcon size={16} className="mr-2" />
                Delete All
              </Button>
            )}
          </div>
          
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 border-dashed shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]">
            <CardContent className="p-8">
              <div
                className="text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50/90 dark:bg-blue-900/40 flex items-center justify-center mb-4 backdrop-blur-sm shadow-[0_4px_8px_-2px_rgba(0,0,0,0.08)]">
                  <Upload size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Drag and drop resume here</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">or</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  multiple
                />
                <Button 
                  variant="outline" 
                  onClick={triggerFileInput}
                  className="mx-auto bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-gray-200/70 dark:border-gray-600/70 dark:text-gray-300 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]"
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Supported formats: PDF, DOCX, DOC (Max 5MB per file)</p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-6 border-t pt-4 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Uploaded Files</h3>
                  <div className="space-y-2">
                    {currentFiles.map((file, index) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-700/40 rounded-md backdrop-blur-sm"
                      >
                        <div className="flex items-center">
                          <FileText size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {files.length > 0 && (
                    <div className="flex justify-between mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {files.length} {files.length === 1 ? 'file' : 'files'} uploaded
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerFileInput}
                        className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                      >
                        Add More
                      </Button>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Display page numbers in a smart way
                          let pageToShow: number;
                          
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            // If at start, show first 5
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // If near end, show last 5
                            pageToShow = totalPages - 4 + i;
                          } else {
                            // Show current page and 2 on each side
                            pageToShow = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageToShow}
                              variant={currentPage === pageToShow ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageToShow)}
                              className={`h-8 w-8 p-0 ${
                                currentPage === pageToShow 
                                  ? "bg-blue-600 text-white" 
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {pageToShow}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                  
                  {/* Submit Resumes Button */}
                  <div className="mt-6 pt-4 border-t dark:border-gray-700">
                    <Button 
                      className={`w-full ${job.jobStatus === 'open' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'} text-white py-2 rounded-md shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2`}
                      onClick={handleSubmitResumes}
                      disabled={isSubmitting || files.length === 0 || job.jobStatus !== 'open'}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit {files.length} Resume{files.length !== 1 ? 's' : ''} for this Job
                        </>
                      )}
                    </Button>
                    {job.jobStatus !== 'open' && (
                      <p className="text-xs text-center text-red-500 dark:text-red-400 mt-2">
                        This job is no longer accepting applications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LLM Processing Animation - shown during processing */}
        {isProcessing && (
          <div ref={processingRef}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-2 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
              AI Processing Resumes{loadingDots}
            </h2>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] mb-6 overflow-hidden">
              <CardContent className="p-4">
                {/* AI Processing Animation */}
                <div className="relative h-36 mb-4">
                  {/* Resume Documents */}
                  <div className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-16 h-20 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-1 flex flex-col items-center justify-center mb-1 shadow-md">
                      <FileText size={16} className="text-blue-600 dark:text-blue-400 mb-1" />
                      <div className="w-full h-1 bg-blue-200 dark:bg-blue-700 mb-1 rounded-full"></div>
                      <div className="w-full h-1 bg-blue-200 dark:bg-blue-700 mb-1 rounded-full"></div>
                      <div className="w-3/4 h-1 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Resumes</p>
                  </div>
                  
                  {/* LLM Brain Animation */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-1 overflow-hidden border-4 border-purple-500 animate-pulse-rainbow">
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                          <path d="M12 2a8 8 0 1 0 8 8h-8V2Z" />
                          <path d="M20 10a8 8 0 1 1-8-8v8h8Z" />
                          <circle cx="18" cy="18" r="3" />
                          <circle cx="6" cy="6" r="3" />
                        </svg>
                      </div>

                      {/* Animated Processing Circles */}
                      <div className="absolute inset-0">
                        <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 animate-spin"></div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Large Language Model</p>
                    
                    {/* Animated processing steps text */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md animate-pulse">
                        Analyzing Resume Content
                      </span>
                    </div>
                    
                    {/* Data Flow Lines - Left to Center */}
                    <div className="absolute left-[-80px] top-1/2 w-[80px] h-1 bg-gradient-to-r from-blue-300 to-purple-400 dark:from-blue-600 dark:to-purple-500">
                      <div className="absolute left-0 top-0 h-full w-6 bg-blue-400 dark:bg-blue-500 animate-flow-right"></div>
                    </div>
                    
                    {/* Data Flow Lines - Center to Right */}
                    <div className="absolute right-[-80px] top-1/2 w-[80px] h-1 bg-gradient-to-r from-purple-400 to-green-400 dark:from-purple-500 dark:to-green-500">
                      <div className="absolute left-0 top-0 h-full w-6 bg-purple-400 dark:bg-purple-500 animate-flow-right"></div>
                    </div>
                  </div>
                  
                  {/* Job Description */}
                  <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-16 h-20 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex flex-col items-center justify-center p-1 mb-1 shadow-md">
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400 mb-1" />
                      <div className="w-full h-1 bg-green-200 dark:bg-green-700 mb-1 rounded-full"></div>
                      <div className="w-full h-1 bg-green-200 dark:bg-green-700 mb-1 rounded-full"></div>
                      <div className="w-3/4 h-1 bg-green-200 dark:bg-green-700 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Job Requirements</p>
                  </div>
                </div>
                
                {/* Processing steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50/80 dark:bg-gray-700/40 rounded-lg p-3 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 ${!loadingDots.includes('.') ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}></div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Extracting Skills
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Identifying technical and soft skills from resume content</p>
                  </div>
                  
                  <div className="bg-gray-50/80 dark:bg-gray-700/40 rounded-lg p-3 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-purple-500/10 dark:bg-purple-500/20 ${loadingDots.length === 1 || loadingDots.length === 2 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      Matching to Job Requirements
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Comparing skills and experience to job requirements</p>
                  </div>
                  
                  <div className="bg-gray-50/80 dark:bg-gray-700/40 rounded-lg p-3 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-green-500/10 dark:bg-green-500/20 ${loadingDots.length === 3 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Scoring Candidates
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Calculating match percentages and generating feedback</p>
                  </div>
                </div>
                
                {/* Processing status */}
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Processing...</span> Analyzing {files.length} resume{files.length !== 1 ? 's' : ''} for {job.jobTitle}
                    </p>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{
                          width: loadingDots === '' ? '25%' : 
                                 loadingDots === '.' ? '50%' : 
                                 loadingDots === '..' ? '75%' : '95%'
                        }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results section - shown after resume submission and processing is complete */}
        {responseData && !isProcessing && (
          <div ref={resultsRef}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CheckCircle size={20} className="mr-2 text-green-600 dark:text-green-400" />
              Resume Processing Complete
            </h2>
            
            {/* Success Card with View Results Button */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] mb-6">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analysis Complete!</h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  {responseData.jobMatches ? 
                    `We've analyzed ${responseData.jobMatches.reduce((total, match) => total + match.results.length, 0)} resumes` : 
                    `We've analyzed ${responseData.results?.length || 0} resumes`} 
                  {" "}for the {job.jobTitle} position. Click below to view detailed results.
                </p>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                      <Eye size={18} className="mr-2" />
                      View Results
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl mb-1">Resume Analysis Results</DialogTitle>
                      <DialogDescription>
                        Showing match results for {job.jobTitle} at {job.company || "Company"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Match Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                      <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-md p-3 text-center">
                        <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{files.length}</p>
                        <p className="text-xs text-blue-800 dark:text-blue-300">Resumes Analyzed</p>
                      </div>
                      <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-md p-3 text-center">
                        {/* Handle both old and new response formats */}
                        <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                          {responseData.results 
                            ? responseData.results.reduce((acc, curr) => acc + curr.skills.length, 0)
                            : responseData.jobMatches?.reduce((acc, match) => 
                                acc + match.results.reduce((skillsAcc, result) => 
                                  skillsAcc + result.skills.length, 0), 0) || 0
                          }
                        </p>
                        <p className="text-xs text-purple-800 dark:text-purple-300">Skills Identified</p>
                      </div>
                      <div className="bg-green-50/80 dark:bg-green-900/20 rounded-md p-3 text-center">
                        {/* Handle both old and new response formats */}
                        <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                          {responseData.results
                            ? responseData.results.filter(r => r.matchScore >= 70).length
                            : responseData.jobMatches?.reduce((acc, match) => 
                                acc + match.results.filter(r => r.matchScore >= 70).length, 0) || 0
                          }
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-300">Strong Matches</p>
                      </div>
                    </div>
                    
                    {/* Results Table */}
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-700">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">File Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Candidate</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Skills</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Matched Skills</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Process both old and new response formats */}
                          {responseData.results ? (
                            // Handle old format
                            responseData.results.map((row) => (
                              <tr key={row.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-4">
                                  <div className="flex items-center">
                                    <FileText size={16} className="text-blue-500 mr-2" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.fileName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {row.candidateName || "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {row.email || ""}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.processingError)}`}>
                                      {getStatusIcon(row.status, row.processingError)}
                                      <span className="ml-1">{row.status}</span>
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        row.matchScore >= 70 
                                          ? 'bg-green-500' 
                                          : row.matchScore >= 40 
                                            ? 'bg-yellow-500' 
                                            : 'bg-red-500'
                                      }`}
                                      style={{ width: `${row.matchScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                    {row.matchScore}%
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {row.skills.map((skill, idx) => (
                                      <span 
                                        key={idx} 
                                        className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {row.matched_skills?.map((skill, idx) => (
                                      <span 
                                        key={idx} 
                                        className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded"
                                      >
                                        {skill}
                                      </span>
                                    )) || <span className="text-xs text-gray-500">N/A</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{row.feedback}</p>
                                </td>
                              </tr>
                            ))
                          ) : (
                            // Handle new format with jobMatches
                            responseData.jobMatches?.flatMap(match => 
                              match.results.map(row => (
                                <tr key={row.id} className="border-b dark:border-gray-700">
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      <FileText size={16} className="text-blue-500 mr-2" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.fileName}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.candidateName || "N/A"}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {row.email || ""}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status, row.processingError)}`}>
                                        {getStatusIcon(row.status, row.processingError)}
                                        <span className="ml-1">{row.status}</span>
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                      <div 
                                        className={`h-2.5 rounded-full ${
                                          row.matchScore >= 70 
                                            ? 'bg-green-500' 
                                            : row.matchScore >= 40 
                                              ? 'bg-yellow-500' 
                                              : 'bg-red-500'
                                        }`}
                                        style={{ width: `${row.matchScore}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                      {row.matchScore}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {row.skills.map((skill, idx) => (
                                        <span 
                                          key={idx} 
                                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {row.matched_skills?.map((skill, idx) => (
                                        <span 
                                          key={idx} 
                                          className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded"
                                        >
                                          {skill}
                                        </span>
                                      )) || <span className="text-xs text-gray-500">N/A</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{row.feedback}</p>
                                  </td>
                                </tr>
                              ))
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        className="text-gray-600 dark:text-gray-300"
                        onClick={() => window.print()}
                      >
                        Export Results
                      </Button>
                      <DialogClose asChild>
                        <Button className="bg-blue-600 text-white">
                          Close
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20"
                    disabled={isSaving}
                    onClick={handleSaveResults}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Results
                      </>
                    )}
                  </Button>
                </div>
                
                {saveError && (
                  <p className="text-sm text-red-500 mt-2">{saveError}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
});

JobDetail.displayName = 'JobDetail';

export default JobDetail;
