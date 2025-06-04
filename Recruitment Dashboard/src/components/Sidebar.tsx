import { Briefcase, Home, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');
  
  const menuItems = [
    // { id: 'jobs', icon: Briefcase, label: 'Job Listings', path: '/' },
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
  ];

  // Set active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => 
      item.path === currentPath || 
      (currentPath === '/' && item.id === 'jobs')
    );
    
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname]);

  const handleClick = (id: string, path: string) => {
    setActiveItem(id);
    navigate(path);
  };

  return (
    <div className="w-[4.8rem] h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-3 fixed left-0 top-0 z-30 shadow-md transition-transform duration-300">
      
      <div className="flex-1 flex flex-col items-center gap-6 mt-[5rem]">
        {menuItems.map(item => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => handleClick(item.id, item.path)}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                activeItem === item.id
                  ? "bg-gray-700 dark:bg-gray-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md"
              )}
              aria-label={item.label}
            >
              <item.icon size={21} className={activeItem === item.id ? "transform scale-110" : ""} />
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 py-1.5 px-3 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap bg-gray-800 dark:bg-gray-700 text-white rounded-md text-sm z-40 shadow-lg">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 