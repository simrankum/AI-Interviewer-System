import { useState } from 'react';
import { toast } from "@/components/ui/sonner";

// API URL configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

interface SaveResultsProps {
  jobId: string;
  jobTitle: string;
  company?: string;
  results: any[];
}

interface UseSaveResultsReturn {
  saveResults: (data: SaveResultsProps, onSuccess?: () => void) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

/**
 * Custom hook to save resume analysis results to the backend
 */
export default function useSaveResults(): UseSaveResultsReturn {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  
  const saveResults = async (data: SaveResultsProps, onSuccess?: () => void): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      
      const payload = {
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          results: data.results,
          savedAt: new Date().toISOString()
      };
      console.log('Resume results data -> backend', payload);
      // Make API request to save results

      const response = await fetch(`${API_BASE_URL}/candidates/uploadCandidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save results');
      }

      // Parse response
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'API returned an error');
      }

      // Show success notification
      toast.success("Results saved successfully", {
        description: `Analysis results for ${data.jobTitle} have been saved.`,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Handle error
      const errorMessage = error.message || 'Error saving results';
      setError(errorMessage);
      
      // Show error notification
      toast.error("Error saving results", {
        description: errorMessage,
      });
      
      console.error("Save results error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveResults,
    isSaving,
    error
  };
} 