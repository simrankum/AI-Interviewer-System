import { Check, MapPin, Users, Briefcase, Code, PenTool, Database, LineChart, Server, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job } from "@/hooks/useFetchJobDetails";
import { toast } from "@/components/ui/sonner";

interface JobCardProps {
  job: Job;
  isActive: boolean;
  onSelect: (job: Job) => void;
  onClose: (id: string) => void;
}

export default function JobCard({ job, isActive, onSelect }: JobCardProps) {

  // Function to determine which icon and style to use based on the job title
  const getJobIcon = () => {
    const title = job.jobTitle.toLowerCase();
    
    if (title.includes('developer') || title.includes('react') || title.includes('frontend')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700">
          <Code size={22} className="text-white drop-shadow-md" />
        </div>
      );
    } 
    else if (title.includes('designer') || title.includes('ux')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600">
          <PenTool size={22} className="text-white drop-shadow-md" />
        </div>
      );
    }
    else if (title.includes('data') || title.includes('scientist')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600">
          <Database size={22} className="text-white drop-shadow-md" />
        </div>
      );
    } 
    else if (title.includes('devops') || title.includes('engineer')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600">
          <Server size={22} className="text-white drop-shadow-md" />
        </div>
      );
    } 
    else if (title.includes('manager') || title.includes('product')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-500 dark:to-blue-600">
          <LineChart size={22} className="text-white drop-shadow-md" />
        </div>
      );
    }
    else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700">
          <Briefcase size={22} className="text-white drop-shadow-md" />
        </div>
      );
    }
  };

  // Get job background color based on job title
  const getJobBgColor = () => {
    const title = job.jobTitle.toLowerCase();
    if (title.includes('developer') || title.includes('react') || title.includes('frontend')) {
      return 'bg-blue-50/70 dark:bg-blue-900/30';
    } else if (title.includes('designer') || title.includes('ux')) {
      return 'bg-purple-50/70 dark:bg-purple-900/30';
    } else if (title.includes('data') || title.includes('scientist')) {
      return 'bg-green-50/70 dark:bg-green-900/30';
    } else if (title.includes('devops') || title.includes('engineer')) {
      return 'bg-amber-50/70 dark:bg-amber-900/30';
    } else {
      return 'bg-gray-50/70 dark:bg-gray-800/50';
    }
  };

  // Handle job selection with click
  const handleSelectJob = () => {
    console.log('Job selected:', job.jobId);
    onSelect(job);
  };

  // Get job status tag styles
  const getJobStatusTag = () => {
    if (job.jobStatus === 'open') {
      return (
        <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 backdrop-blur-sm py-1 px-2 rounded-full shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <Check size={14} className="mr-1" />
          Open
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700/50 backdrop-blur-sm py-1 px-2 rounded-full shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <Clock size={14} className="mr-1" />
          Closed
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "relative p-5 cursor-pointer transition-all hover:z-10",
        "backdrop-blur-sm bg-white/90 dark:bg-gray-800/90",
        "hover:bg-white/95 dark:hover:bg-gray-750/95 border-b border-gray-100/70 dark:border-gray-700/50", 
        isActive 
          ? "bg-white/95 dark:bg-gray-700/90 hover:bg-white/95 dark:hover:bg-gray-700/90 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]"
          : "hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      )}
      onClick={handleSelectJob}
    >
      {/* <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={handleSaveJob}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm"
        >
          <Bookmark size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(job.id);
          }}
          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm"
        >
          <X size={18} />
        </button>
      </div> */}
      
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-lg overflow-hidden shadow-[0_4px_10px_-2px_rgba(0,0,0,0.15)]">
          {getJobIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-1.5 flex items-center">
              {job.jobTitle}
            </h3>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
            <MapPin size={14} className="mr-1.5 text-gray-500 dark:text-gray-400" />
            {job.location} ({job.locationType})
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Job status tag */}
            {getJobStatusTag()}
            
            {/* Experience tag */}
            {job.experience && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 font-medium bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm py-1 px-2 rounded-full shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]">
                <Briefcase size={14} className="mr-1.5" />
                {job.experience}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
