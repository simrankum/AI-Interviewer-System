import { cn } from "@/lib/utils";
import { FileText, User, Users } from "lucide-react";

interface JobTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function JobTabs({ tabs, activeTab, onTabChange }: JobTabsProps) {
  // Helper function to get the icon for each tab
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "Job Descriptions":
        return <FileText size={18} />;
      case "Selected Candidate":
        return <User size={18} />;
      case "List of Candidates":
        return <Users size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex border-b border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-x-auto no-scrollbar shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={cn(
            "relative whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === tab
              ? "text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-gray-700/40 backdrop-blur-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/20 hover:backdrop-blur-sm"
          )}
          onClick={() => onTabChange(tab)}
        >
          {getTabIcon(tab)}
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 shadow-[0_-1px_3px_rgba(59,130,246,0.3)]" />
          )}
        </button>
      ))}
    </div>
  );
}
