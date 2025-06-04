import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Loader2, User, UserCheck, UserX, CalendarClock, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActionType = 
  | "view-profile" 
  | "schedule-interview" 
  | "reject" 
  | "approve" 
  | "shortlist" 
  | "disqualify";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      actionType: {
        "view-profile": "bg-slate-100 text-slate-800 hover:bg-slate-200",
        "schedule-interview": "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40",
        "reject": "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40",
        "approve": "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40", 
        "shortlist": "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/40",
        "disqualify": "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      actionType: "view-profile",
      size: "sm",
    },
  }
);

export interface ActionButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  actionType: ActionType;
  isLoading?: boolean;
}

const getActionIcon = (actionType: ActionType, size: number = 16) => {
  switch (actionType) {
    case "view-profile":
      return <User size={size} />;
    case "schedule-interview":
      return <CalendarClock size={size} />;
    case "reject":
      return <UserX size={size} />;
    case "approve":
      return <UserCheck size={size} />;
    case "shortlist":
      return <ThumbsUp size={size} />;
    case "disqualify":
      return <ThumbsDown size={size} />;
    default:
      return <User size={size} />;
  }
};

export function ActionButton({
  className,
  actionType,
  size,
  children,
  isLoading = false,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(buttonVariants({ actionType, size, className }))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2">{getActionIcon(actionType)}</span>
      )}
      {children}
    </Button>
  );
}

export default ActionButton; 