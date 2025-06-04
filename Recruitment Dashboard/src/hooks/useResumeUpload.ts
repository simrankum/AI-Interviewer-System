import { useState, useRef, useMemo, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";

// API URL configuration
const API_BASE_URL = import.meta.env.VITE_DS_API_URL || 'http://0.0.0.0:8000/api';

// Custom File type with ID
export interface ResumeFile extends File {
  id: string;
}

// Response data structure
export interface ResumeResponseRow {
  id: string;
  fileName: string;
  candidateName?: string;
  email?: string;
  status: string;
  matchScore: number;
  skills: string[];
  matched_skills?: string[];
  feedback: string;
  processingError?: boolean;
  jobDetails?: {
    id: string;
    title: string;
    company?: string;
  };
}

// New response format interfaces
export interface JobMatch {
  success: boolean;
  jobDetails: {
    id: string;
    title: string;
    company?: string;
  };
  results: ResumeResponseRow[];
}

export interface ApiResponse {
  success: boolean;
  results?: ResumeResponseRow[];
  jobMatches?: JobMatch[];
}

interface Job {
  id?: string;
  title?: string;
  company?: string;
  [key: string]: any;
}

interface UseResumeUploadProps {
  itemsPerPage?: number;
}

interface UseResumeUploadReturn {
  files: ResumeFile[];
  currentFiles: ResumeFile[];
  currentPage: number;
  totalPages: number;
  isSubmitting: boolean;
  isProcessing: boolean;
  responseData: ApiResponse | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  deleteFile: (fileId: string) => void;
  deleteAllFiles: () => void;
  triggerFileInput: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (pageNumber: number) => void;
  submitResumes: (job: Job) => Promise<void>;
  clearResponseData: () => void;
}

function convertJobToPDF(job: any): File {
  const doc = new jsPDF();

  const lines = [
    `Job Title: ${job.jobTitle}`,
    `Location: ${job.location}`,
    `Location Type: ${job.locationType}`,
    `Job Type: ${job.jobType}`,
    `Experience: ${job.experience}`,
    `Job Status: ${job.jobStatus}`,
    `Posted Date: ${job.postedDate}`,
    `Promoted: ${job.promoted ? 'Yes' : 'No'}`,
    '',
    `Description:\n${job.description}`,
    '',
    `Required Skills:\n${(job.requiredSkills || []).join(', ')}`
  ];

  doc.setFontSize(12);
  doc.text(lines.join('\n'), 10, 10);

  const pdfBlob = doc.output('blob');
  return new File([pdfBlob], "job_description.pdf", { type: 'application/pdf' });
}

export default function useResumeUpload({ itemsPerPage = 10 }: UseResumeUploadProps = {}): UseResumeUploadReturn {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);

  // Clear response data
  const clearResponseData = useCallback(() => {
    setResponseData(null);
  }, []);

  // File validation utility function
  const isValidFileType = useCallback((file: File): boolean => {
    // Check by MIME type first
    if (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return true;
    }
    
    // Fallback to extension check if MIME type is missing or incorrect
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'pdf' || extension === 'doc' || extension === 'docx';
  }, []);

  // Add files with validation
  const addFiles = useCallback((newFiles: File[]) => {
    // Clear any previous response data when adding new files
    clearResponseData();
    
    const validFiles = newFiles.filter(file => {
      const isValid = isValidFileType(file);
      
      if (!isValid) {
        toast("Invalid file format", {
          description: `${file.name} is not a supported format. Please upload PDF, DOCX, or DOC files.`,
        });
      }
      
      return isValid;
    });
    
    // Create ResumeFile objects with IDs
    const resumeFiles: ResumeFile[] = validFiles.map(file => {
      // Simple cast with ID addition
      const resumeFile = file as ResumeFile;
      resumeFile.id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return resumeFile;
    });
    
    setFiles(prev => [...prev, ...resumeFiles]);
    
    if (validFiles.length > 0) {
      toast("Resume uploaded", {
        description: `${validFiles.length} file(s) added successfully.`,
      });
    }
  }, [isValidFileType, clearResponseData]);

  // Handle file input change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      addFiles(newFiles);
    }
  }, [addFiles]);

  // Handle drag over event
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      addFiles(newFiles);
    }
  }, [addFiles]);

  // Delete a file by ID
  const deleteFile = useCallback((fileId: string) => {
    // Clear response data when files are modified
    clearResponseData();
    
    setFiles(prev => {
      const fileIndex = prev.findIndex(file => file.id === fileId);
      
      if (fileIndex === -1) {
        console.error('File with ID not found:', fileId);
        return prev;
      }
      
      const newFiles = [...prev];
      newFiles.splice(fileIndex, 1);
      
      // If we're on the last page and it's now empty, go to previous page
      const newTotalPages = Math.ceil(newFiles.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      toast("File removed", {
        description: "Resume has been removed successfully.",
      });
      
      return newFiles;
    });
  }, [currentPage, itemsPerPage, clearResponseData]);

  // Delete all files at once
  const deleteAllFiles = useCallback(() => {
    if (files.length === 0) return;
    
    // Clear response data
    clearResponseData();
    
    // Reset to first page
    setCurrentPage(1);
    
    // Clear all files
    setFiles([]);
    
    toast("All files removed", {
      description: `${files.length} resume${files.length !== 1 ? 's' : ''} have been removed.`,
    });
  }, [files.length, clearResponseData]);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const indexOfLastFile = currentPage * itemsPerPage;
  const indexOfFirstFile = indexOfLastFile - itemsPerPage;
  
  // Get current page files
  const currentFiles = useMemo(() => {
    return files.slice(indexOfFirstFile, indexOfLastFile);
  }, [files, indexOfFirstFile, indexOfLastFile]);

  // Pagination controls
  const goToNextPage = useCallback(() => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(page => Math.max(page - 1, 1));
  }, []);

  const goToPage = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // Submit resumes to server
  const submitResumes = useCallback(async (job: Job): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Create FormData for API request
      const formData = new FormData();
      
      // Add resume files to FormData
      files.forEach((file) => {
        formData.append('resumes', file);
      });

    
      // Add job details as JSON
      // formData.append('job_description', JSON.stringify(job));
      const jobPdf = convertJobToPDF(job);
      formData.append('job_description_pdf', jobPdf);

      
      // First phase: submission
      toast("Resumes submitted", {
        description: "Waiting for AI to analyze the resumes...",
      });
      
      // Set to processing state
      setIsSubmitting(false);
      setIsProcessing(true);
      
      // Make API request to backend
      const response = await fetch(`${API_BASE_URL}/match`, {
        method: 'POST',
        body: formData,
      });
     
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload resumes');
      }
      
      // Parse response
      const data = await response.json();
      console.log('DS Response:---', data);
      
      if (!data.success) {
        throw new Error(data.message || 'API returned an error');
      }
      
      // Set response data - support both old and new formats
      setResponseData(data);
      
      // Success notification
      toast("Analysis complete", {
        description: `${files.length} resume${files.length !== 1 ? 's' : ''} analyzed successfully.`,
      });
    } catch (error: any) {
      toast("Error processing resumes", {
        description: error.message || "There was an error processing your resumes. Please try again.",
      });
      console.error("Resume submission error:", error);
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  }, [files]);

  return {
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
    submitResumes,
    clearResponseData
  };
} 