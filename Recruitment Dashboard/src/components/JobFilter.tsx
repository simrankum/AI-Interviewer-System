import { MapPin, Briefcase, SlidersHorizontal, X, Clock, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { JobFilters } from "@/hooks/useFetchJobDetails";

interface JobFilterProps {
  onFilterChange: (filters: JobFilters) => void;
}

export default function JobFilter({ onFilterChange }: JobFilterProps) {
  const [activeFilters, setActiveFilters] = useState<JobFilters>({});

  const handleFilterChange = (key: string, value: string) => {
    let newFilters: JobFilters;
    
    if (value === "all") {
      // Remove this filter
      newFilters = { ...activeFilters };
      delete newFilters[key];
    } else {
      // Add or update this filter
      newFilters = { ...activeFilters, [key]: value };
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters: JobFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm pt-3 flex-shrink-0">
      {/* Title and header */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">Job Listings</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-[0_2px_3px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_5px_-2px_rgba(0,0,0,0.2)] transition-all backdrop-blur-sm"
          onClick={clearAllFilters}
        >
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters section */}
      <div className="px-5 pb-4 flex flex-wrap gap-3">
        {/* Location filter */}
        <div className="relative">
          <Select 
            value={activeFilters.location || ""} 
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger className="pl-9 h-9 min-w-[140px] border-gray-300/70 dark:border-gray-600/70 bg-white/80 dark:bg-gray-700/80 dark:text-gray-200 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 shadow-[0_2px_3px_-2px_rgba(0,0,0,0.1)] backdrop-blur-sm rounded-lg">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 dark:text-blue-400" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="border-gray-300/70 dark:border-gray-600/70 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="san francisco">San Francisco</SelectItem>
              <SelectItem value="new york">New York</SelectItem>
              <SelectItem value="austin">Austin</SelectItem>
              <SelectItem value="seattle">Seattle</SelectItem>
              <SelectItem value="boston">Boston</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Job Type filter (this should match the locationType) */}
        <div className="relative">
          <Select 
            value={activeFilters.jobType || ""} 
            onValueChange={(value) => handleFilterChange("jobType", value)}
          >
            <SelectTrigger className="pl-9 h-9 min-w-[140px] border-gray-300/70 dark:border-gray-600/70 bg-white/80 dark:bg-gray-700/80 dark:text-gray-200 focus:ring-amber-400 focus:border-amber-400 dark:focus:ring-amber-500 dark:focus:border-amber-500 shadow-[0_2px_3px_-2px_rgba(0,0,0,0.1)] backdrop-blur-sm rounded-lg">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-amber-400" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent className="border-gray-300/70 dark:border-gray-600/70 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null; // Skip undefined values
            
            // Determine badge color based on filter type
            let badgeClasses = "flex items-center gap-1 px-3 py-1.5 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur-sm";
            
            if (key === "location") {
              badgeClasses += " bg-blue-50/80 text-blue-700 border-blue-200/70 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/70";
            } else if (key === "jobType") {
              badgeClasses += " bg-amber-50/80 text-amber-700 border-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/70";
            } else {
              badgeClasses += " bg-white/70 text-gray-700 border-gray-300/70 dark:bg-gray-700/70 dark:text-gray-200 dark:border-gray-600/70";
            }
            
            // Format the label properly
            let label = "";
            if (key === "jobType") label = "Type";
            else label = key.charAt(0).toUpperCase() + key.slice(1);
            
            return (
              <Badge key={key} variant="outline" className={badgeClasses}>
                {label}:&nbsp;
                <span className="font-medium">{value}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1 hover:bg-white/40 dark:hover:bg-gray-700/40 backdrop-blur-sm rounded-full p-0"
                  onClick={() => clearFilter(key)}
                >
                  <X size={10} />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
