import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, HelpCircle, User, Moon, Sun, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Get theme from localStorage or use system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme as "dark" | "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast(`Switched to ${newTheme} mode`);
  };

  const handleLogout = () => {
    // You could add any logout logic here (clear tokens, etc.)
    toast("Logged out successfully");
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-[4.8rem] flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md z-20 h-16 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <div className="h-[5.5rem] w-auto flex items-center justify-center">
            <img 
              src="https://itkonekt.com/media/2022/09/Grid_Dynamics_transparent.png" 
              alt="Grid Dynamics Logo" 
              className="h-full w-auto object-contain" 
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md w-10 h-10"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} />
          )}
        </Button>
        <div className="h-7 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        
        {/* User profile dropdown with logout option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-sm hover:shadow-md pl-1 pr-4 py-5">
              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-600 shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gray-100 text-gray-700">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">User</span>
              <ChevronDown size={16} className="ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
